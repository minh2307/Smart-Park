package com.smartpark.domain.complaint.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.employee.entity.Employee;
import com.smartpark.domain.employee.repository.EmployeeRepository;
import com.smartpark.domain.complaint.dto.ComplaintDto;
import com.smartpark.domain.complaint.entity.Complaint;
import com.smartpark.domain.complaint.entity.Complaint.ComplaintStatus;
import com.smartpark.domain.complaint.entity.ComplaintHistory;
import com.smartpark.domain.complaint.mapper.ComplaintMapper;
import com.smartpark.domain.complaint.repository.ComplaintHistoryRepository;
import com.smartpark.domain.complaint.repository.ComplaintRepository;
import com.smartpark.domain.complaint.service.ComplaintService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintHistoryRepository historyRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin tài khoản đăng nhập hiện tại: " + username));
    }

    private Customer getCurrentCustomer(User user) {
        return customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Tài khoản của bạn chưa liên kết với thông tin Khách hàng"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ComplaintDto.Response> findAllComplaints(
            String search,
            String status,
            Long customerId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        Specification<Complaint> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("complaintNumber")), pattern),
                        cb.like(cb.lower(root.get("complaintType")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), ComplaintStatus.valueOf(status.toUpperCase())));
            }

            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return complaintRepository.findAll(spec, pageable)
                .map(ComplaintMapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintDto.Response findComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", id));
        return ComplaintMapper.toResponseDto(complaint);
    }

    @Override
    @Transactional
    public ComplaintDto.Response createComplaint(ComplaintDto.CreateRequest request) {
        User user = getCurrentUser();
        Customer customer = getCurrentCustomer(user);

        String complaintNumber = "CP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Complaint complaint = Complaint.builder()
                .complaintNumber(complaintNumber)
                .customer(customer)
                .complaintType(request.getComplaintType())
                .description(request.getDescription())
                .evidence(request.getEvidence())
                .status(ComplaintStatus.SUBMITTED)
                .build();

        Complaint saved = complaintRepository.save(complaint);

        // Record history
        ComplaintHistory hist = ComplaintHistory.builder()
                .complaint(saved)
                .statusFrom(null)
                .statusTo(ComplaintStatus.SUBMITTED.name())
                .actionDetails("Khiếu nại được tạo mới bởi khách hàng.")
                .performedBy(user)
                .build();
        historyRepository.save(hist);

        // Load history list into entity for mapper
        saved.getHistory().add(hist);

        return ComplaintMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public ComplaintDto.Response resolveComplaint(Long id, ComplaintDto.ResolveRequest request) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", id));

        if (complaint.getStatus() == ComplaintStatus.RESOLVED || complaint.getStatus() == ComplaintStatus.REJECTED) {
            throw new BusinessException("Khiếu nại đã kết thúc xử lý, không thể thay đổi.");
        }

        User user = getCurrentUser();
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Chỉ nhân viên vận hành/CSKH mới được quyền giải quyết khiếu nại."));

        String oldStatus = complaint.getStatus().name();
        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setResolution(request.getResolution());
        complaint.setAssignedStaff(employee);
        Complaint saved = complaintRepository.save(complaint);

        // Record history
        ComplaintHistory hist = ComplaintHistory.builder()
                .complaint(saved)
                .statusFrom(oldStatus)
                .statusTo(ComplaintStatus.RESOLVED.name())
                .actionDetails("Giải quyết khiếu nại: " + request.getResolution())
                .performedBy(user)
                .build();
        historyRepository.save(hist);

        return ComplaintMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public ComplaintDto.Response rejectComplaint(Long id, ComplaintDto.RejectRequest request) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", id));

        if (complaint.getStatus() == ComplaintStatus.RESOLVED || complaint.getStatus() == ComplaintStatus.REJECTED) {
            throw new BusinessException("Khiếu nại đã kết thúc xử lý, không thể thay đổi.");
        }

        User user = getCurrentUser();
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Chỉ nhân viên vận hành/CSKH mới được quyền từ chối khiếu nại."));

        String oldStatus = complaint.getStatus().name();
        complaint.setStatus(ComplaintStatus.REJECTED);
        complaint.setResolution("Từ chối: " + request.getReason());
        complaint.setAssignedStaff(employee);
        Complaint saved = complaintRepository.save(complaint);

        // Record history
        ComplaintHistory hist = ComplaintHistory.builder()
                .complaint(saved)
                .statusFrom(oldStatus)
                .statusTo(ComplaintStatus.REJECTED.name())
                .actionDetails("Từ chối khiếu nại. Lý do: " + request.getReason())
                .performedBy(user)
                .build();
        historyRepository.save(hist);

        return ComplaintMapper.toResponseDto(saved);
    }
}
