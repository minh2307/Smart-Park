package com.smartpark.domain.lpr.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
@Data
public class LprScanRequest {
 @NotBlank @Size(max=80) private String deviceId;
 @NotNull @Positive private Long parkingLotId;
 @NotNull private Direction direction;
 @NotNull @PastOrPresent @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) private LocalDateTime capturedAt;
 @NotBlank @Size(max=64) private String requestId;
 @Size(max=20) private String plateNumber;
 @NotNull private MultipartFile image;
 public enum Direction{ENTRY,EXIT}
}
