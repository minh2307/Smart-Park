package com.smartpark.domain.lpr.dto;
import java.time.LocalDateTime;
public record LprScanResponse(String requestId,String plateNumber,double confidence,LprScanRequest.Direction direction,Decision decision,BarrierCommand barrierCommand,Long parkingTransactionId,LocalDateTime processedAt){public enum Decision{ALLOW,DENY,MANUAL_REVIEW}public enum BarrierCommand{OPEN,KEEP_CLOSED}}
