package com.smartpark.domain.lpr.repository;
import com.smartpark.domain.lpr.entity.LprScanEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface LprScanEventRepository extends JpaRepository<LprScanEvent,Long>{ Optional<LprScanEvent> findByDeviceDeviceCodeAndRequestId(String deviceCode,String requestId); }
