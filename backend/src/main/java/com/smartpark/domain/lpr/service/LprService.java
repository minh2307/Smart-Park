package com.smartpark.domain.lpr.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.audit.entity.AuditLog;
import com.smartpark.domain.audit.service.AuditLogService;
import com.smartpark.domain.device.entity.IoTDevice;
import com.smartpark.domain.device.repository.IoTDeviceRepository;
import com.smartpark.domain.device.service.ReplayProtectionService;
import com.smartpark.domain.lpr.client.LprClient;
import com.smartpark.domain.lpr.dto.*;
import com.smartpark.domain.lpr.entity.LprScanEvent;
import com.smartpark.domain.lpr.repository.LprScanEventRepository;
import com.smartpark.domain.lpr.storage.ImageStorage;
import com.smartpark.domain.parking.entity.*;
import com.smartpark.domain.parking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.math.*;
import java.time.*;
import java.util.Locale;
import java.util.regex.Pattern;

@Service @RequiredArgsConstructor
public class LprService {
 private static final long MAX_IMAGE_BYTES=5L*1024*1024;
 private static final Pattern PLATE=Pattern.compile("[A-Z0-9]{5,15}");
 private final IoTDeviceRepository devices; private final ParkingLotRepository lots; private final ParkingTransactionRepository transactions;
 private final LprScanEventRepository events; private final LprClient client; private final ImageStorage storage;
 private final ReplayProtectionService replay; private final AuditLogService audit; private final com.smartpark.domain.settings.service.FeatureFlagService featureFlags; private final com.smartpark.domain.device.service.DeviceRateLimitService deviceRateLimit;
 @Value("${app.integration.lpr.confidence-threshold:0.80}") private double threshold;

 @Transactional
 public LprScanResponse process(LprScanRequest request){
  long started=System.nanoTime();
  featureFlags.requireEnabled(com.smartpark.domain.settings.service.FeatureFlagService.FeatureFlag.LPR);
  IoTDevice device=devices.findByDeviceCode(request.getDeviceId()).orElse(null);
  deviceRateLimit.check(request.getDeviceId());
  if(!validDevice(device,request)){audit.create(AuditLog.builder().action("DEVICE_DENIED").targetTable("iot_devices").newValues("{\"device\":\""+request.getDeviceId()+"\"}").build());return closed(request,null,0,"ERR-GATE-003",started);}
  var previous=events.findByDeviceDeviceCodeAndRequestId(request.getDeviceId(),request.getRequestId());
  if(previous.isPresent()) return response(previous.get());
  replay.claim("lpr",request.getDeviceId(),request.getRequestId(),Duration.ofHours(24));
  byte[] image=readAndValidate(request); String contentType=detect(image);
  String imageReference=storage.store(image,contentType);
  LprClient.Recognition recognized=request.getPlateNumber()==null||request.getPlateNumber().isBlank()?client.recognize(image,contentType):new LprClient.Recognition(request.getPlateNumber(),1.0);
  String plate=normalize(recognized.plateNumber()); double confidence=recognized.confidence();
  ParkingLot lot=lots.findByIdForUpdate(request.getParkingLotId()).orElse(null);
  if(lot==null||lot.getStatus()==ParkingLot.ParkingLotStatus.CLOSED) return persist(device,lot,request,plate,confidence,imageReference,null,"DENY","KEEP_CLOSED","ERR-LPR-003",started);
  if(confidence<threshold) return persist(device,lot,request,plate,confidence,imageReference,null,"MANUAL_REVIEW","KEEP_CLOSED","ERR-LPR-002",started);
  ParkingTransaction tx; String decision="ALLOW",command="OPEN",error=null;
  if(request.getDirection()==LprScanRequest.Direction.ENTRY){
   tx=transactions.findActiveForUpdate(lot.getId(),plate,ParkingTransaction.ParkingStatus.PARKED).orElse(null);
   if(tx!=null){decision="MANUAL_REVIEW";command="KEEP_CLOSED";error="ERR-LPR-003";}
   else if(lot.getOccupiedSpaces()>=lot.getTotalSpaces()||lot.getStatus()==ParkingLot.ParkingLotStatus.FULL){tx=null;decision="DENY";command="KEEP_CLOSED";error="ERR-LPR-003";}
   else {tx=ParkingTransaction.builder().parkingLot(lot).entryGate(device.getGate()).vehiclePlate(plate).vehicleType(ParkingTransaction.VehicleType.CAR).entryTime(request.getCapturedAt()).status(ParkingTransaction.ParkingStatus.PARKED).paymentStatus(ParkingTransaction.PaymentStatus.UNPAID).entryImageReference(imageReference).entryDevice(device).entryRecognitionConfidence(BigDecimal.valueOf(confidence)).build();transactions.save(tx);lot.setOccupiedSpaces(lot.getOccupiedSpaces()+1);}
  }else{
   tx=transactions.findActiveForUpdate(lot.getId(),plate,ParkingTransaction.ParkingStatus.PARKED).orElse(null);
   if(tx==null){decision="DENY";command="KEEP_CLOSED";error="ERR-LPR-003";}
   else {LocalDateTime exit=request.getCapturedAt().isBefore(tx.getEntryTime())?LocalDateTime.now():request.getCapturedAt();long minutes=Math.max(1,Duration.between(tx.getEntryTime(),exit).toMinutes());long hours=Math.max(1,(minutes+59)/60);BigDecimal rate=lot.getHourlyRate()==null?BigDecimal.ZERO:lot.getHourlyRate();tx.setExitTime(exit);tx.setExitGate(device.getGate());tx.setExitDevice(device);tx.setExitImageReference(imageReference);tx.setExitRecognitionConfidence(BigDecimal.valueOf(confidence));tx.setParkingFee(rate.multiply(BigDecimal.valueOf(hours)));tx.setStatus(ParkingTransaction.ParkingStatus.EXITED);lot.setOccupiedSpaces(Math.max(0,lot.getOccupiedSpaces()-1));}
  }
  return persist(device,lot,request,plate,confidence,imageReference,tx,decision,command,error,started);
 }
 private boolean validDevice(IoTDevice d,LprScanRequest r){if(d==null||d.getStatus()!=IoTDevice.DeviceStatus.ACTIVE||d.getDeviceType()!=IoTDevice.DeviceType.LPR_CAMERA)return false;if(d.getGate()!=null&&d.getGate().getParkingArea()!=null&&!d.getGate().getParkingArea().getId().equals(r.getParkingLotId()))return false;var auth=SecurityContextHolder.getContext().getAuthentication();return auth==null||auth.getAuthorities().stream().noneMatch(a->a.getAuthority().equals("DEVICE_LPR"))||auth.getName().equals("device:"+r.getDeviceId());}
 private byte[] readAndValidate(LprScanRequest r){try{if(r.getImage().isEmpty()||r.getImage().getSize()>MAX_IMAGE_BYTES)throw new BusinessException("ERR-LPR-001","Invalid image size");byte[] b=r.getImage().getBytes();detect(b);return b;}catch(IOException ex){throw new BusinessException("ERR-LPR-001","Unable to read image");}}
 private String detect(byte[] b){if(b.length>=3&&(b[0]&255)==0xff&&(b[1]&255)==0xd8&&(b[2]&255)==0xff)return "image/jpeg";if(b.length>=8&&(b[0]&255)==0x89&&b[1]==0x50&&b[2]==0x4e&&b[3]==0x47)return "image/png";throw new BusinessException(HttpStatus.BAD_REQUEST,"ERR-LPR-001","Only genuine JPEG or PNG images are accepted");}
 private String normalize(String value){String p=value==null?"":value.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]","");if(!PLATE.matcher(p).matches())throw new BusinessException("ERR-LPR-001","Invalid plate number");return p;}
 private LprScanResponse persist(IoTDevice d,ParkingLot lot,LprScanRequest r,String plate,double confidence,String ref,ParkingTransaction tx,String decision,String command,String error,long started){
  if(lot==null)return closed(r,plate,confidence,error,started);
  LprScanEvent e=events.saveAndFlush(LprScanEvent.builder().device(d).parkingLot(lot).parkingTransaction(tx).requestId(r.getRequestId()).direction(r.getDirection().name()).plateNumber(plate).confidence(BigDecimal.valueOf(confidence)).imageReference(ref).decision(decision).barrierCommand(command).errorCode(error).capturedAt(r.getCapturedAt()).processedAt(LocalDateTime.now()).latencyMs((System.nanoTime()-started)/1_000_000).build());
  audit.create(AuditLog.builder().action("LPR_DECISION").targetTable("lpr_scan_events").recordId(e.getId()).newValues("{\"device\":\""+d.getDeviceCode()+"\",\"decision\":\""+decision+"\"}").build());return response(e);
 }
 private LprScanResponse closed(LprScanRequest r,String plate,double confidence,String error,long start){return new LprScanResponse(r.getRequestId(),plate,confidence,r.getDirection(),LprScanResponse.Decision.DENY,LprScanResponse.BarrierCommand.KEEP_CLOSED,null,LocalDateTime.now());}
 private LprScanResponse response(LprScanEvent e){return new LprScanResponse(e.getRequestId(),e.getPlateNumber(),e.getConfidence()==null?0:e.getConfidence().doubleValue(),LprScanRequest.Direction.valueOf(e.getDirection()),LprScanResponse.Decision.valueOf(e.getDecision()),LprScanResponse.BarrierCommand.valueOf(e.getBarrierCommand()),e.getParkingTransaction()==null?null:e.getParkingTransaction().getId(),e.getProcessedAt());}
}
