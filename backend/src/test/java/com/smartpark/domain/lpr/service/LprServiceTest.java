package com.smartpark.domain.lpr.service;
import com.smartpark.domain.audit.service.AuditLogService;
import com.smartpark.domain.device.repository.IoTDeviceRepository;
import com.smartpark.domain.device.service.ReplayProtectionService;
import com.smartpark.domain.lpr.client.LprClient;
import com.smartpark.domain.lpr.dto.*;
import com.smartpark.domain.lpr.repository.LprScanEventRepository;
import com.smartpark.domain.lpr.storage.ImageStorage;
import com.smartpark.domain.parking.repository.*;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.mock.web.MockMultipartFile;
import java.time.LocalDateTime;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class LprServiceTest {
 @Mock IoTDeviceRepository devices;@Mock ParkingLotRepository lots;@Mock ParkingTransactionRepository transactions;@Mock LprScanEventRepository events;@Mock LprClient client;@Mock ImageStorage storage;@Mock ReplayProtectionService replay;@Mock AuditLogService audit;@Mock com.smartpark.domain.settings.service.FeatureFlagService featureFlags;@Mock com.smartpark.domain.device.service.DeviceRateLimitService deviceRateLimit;@InjectMocks LprService service;
 @BeforeEach void init(){MockitoAnnotations.openMocks(this);}
 @Test void unknownDeviceNeverReadsImageOrOpensBarrier(){when(devices.findByDeviceCode("CAM-X")).thenReturn(Optional.empty());LprScanRequest r=new LprScanRequest();r.setDeviceId("CAM-X");r.setParkingLotId(1L);r.setDirection(LprScanRequest.Direction.ENTRY);r.setCapturedAt(LocalDateTime.now());r.setRequestId("r1");r.setImage(new MockMultipartFile("image","x.jpg","image/jpeg",new byte[]{(byte)0xff,(byte)0xd8,(byte)0xff}));var response=service.process(r);assertEquals(LprScanResponse.BarrierCommand.KEEP_CLOSED,response.barrierCommand());verifyNoInteractions(client,storage,transactions,lots);}
}
