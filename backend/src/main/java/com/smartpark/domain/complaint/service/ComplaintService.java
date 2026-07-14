package com.smartpark.domain.complaint.service;

import com.smartpark.domain.complaint.dto.ComplaintDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface ComplaintService {
    Page<ComplaintDto.Response> findAllComplaints(
            String search,
            String status,
            Long customerId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    ComplaintDto.Response findComplaintById(Long id);

    ComplaintDto.Response createComplaint(ComplaintDto.CreateRequest request);

    ComplaintDto.Response resolveComplaint(Long id, ComplaintDto.ResolveRequest request);

    ComplaintDto.Response rejectComplaint(Long id, ComplaintDto.RejectRequest request);
}
