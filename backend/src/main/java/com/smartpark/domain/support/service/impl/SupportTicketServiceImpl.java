package com.smartpark.domain.support.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.employee.entity.Employee;
import com.smartpark.domain.employee.repository.EmployeeRepository;
import com.smartpark.domain.support.dto.SupportTicketDto;
import com.smartpark.domain.support.entity.SupportComment;
import com.smartpark.domain.support.entity.SupportTicket;
import com.smartpark.domain.support.entity.SupportTicket.TicketPriority;
import com.smartpark.domain.support.entity.SupportTicket.TicketStatus;
import com.smartpark.domain.support.mapper.SupportTicketMapper;
import com.smartpark.domain.support.repository.SupportCommentRepository;
import com.smartpark.domain.support.repository.SupportTicketRepository;
import com.smartpark.domain.support.service.SupportTicketService;
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
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final SupportCommentRepository commentRepository;
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
    public Page<SupportTicketDto.Response> findAllTickets(
            String search,
            String status,
            String priority,
            Long customerId,
            Long employeeId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        Specification<SupportTicket> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("ticketNumber")), pattern),
                        cb.like(cb.lower(root.get("subject")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), TicketStatus.valueOf(status.toUpperCase())));
            }

            if (priority != null && !priority.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("priority"), TicketPriority.valueOf(priority.toUpperCase())));
            }

            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }

            if (employeeId != null) {
                predicates.add(cb.equal(root.get("assignedEmployee").get("id"), employeeId));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return ticketRepository.findAll(spec, pageable).map(SupportTicketMapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public SupportTicketDto.Response findTicketById(Long id) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket", id));
        return SupportTicketMapper.toResponseDto(ticket);
    }

    @Override
    @Transactional
    public SupportTicketDto.Response createTicket(SupportTicketDto.CreateRequest request) {
        User user = getCurrentUser();
        Customer customer = getCurrentCustomer(user);

        String ticketNumber = "TK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber(ticketNumber)
                .customer(customer)
                .subject(request.getSubject())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM)
                .status(TicketStatus.OPEN)
                .build();

        SupportTicket saved = ticketRepository.save(ticket);
        return SupportTicketMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public SupportTicketDto.Response updateTicket(Long id, SupportTicketDto.UpdateRequest request) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket", id));

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BusinessException("Không thể chỉnh sửa phiếu hỗ trợ đã đóng.");
        }

        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        if (request.getPriority() != null) {
            ticket.setPriority(request.getPriority());
        }

        SupportTicket saved = ticketRepository.save(ticket);
        return SupportTicketMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public SupportTicketDto.Response assignTicket(Long id, SupportTicketDto.AssignRequest request) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket", id));

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BusinessException("Không thể phân công phiếu hỗ trợ đã đóng.");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", request.getEmployeeId()));

        ticket.setAssignedEmployee(employee);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        SupportTicket saved = ticketRepository.save(ticket);
        return SupportTicketMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public SupportTicketDto.Response updateTicketStatus(Long id, String status) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket", id));

        TicketStatus targetStatus = TicketStatus.valueOf(status.toUpperCase());

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BusinessException("Không thể thay đổi trạng thái của phiếu hỗ trợ đã đóng.");
        }

        ticket.setStatus(targetStatus);
        if (targetStatus == TicketStatus.CLOSED) {
            ticket.setClosedDate(LocalDateTime.now());
        }

        SupportTicket saved = ticketRepository.save(ticket);
        return SupportTicketMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public SupportTicketDto.Response closeTicket(Long id, SupportTicketDto.CloseRequest request) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket", id));

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BusinessException("Phiếu hỗ trợ đã được đóng trước đó.");
        }

        User user = getCurrentUser();
        // Check rule: only assigned staff can resolve ticket
        if (ticket.getAssignedEmployee() != null) {
            Employee employee = employeeRepository.findByUserId(user.getId()).orElse(null);
            if (employee == null || !employee.getId().equals(ticket.getAssignedEmployee().getId())) {
                throw new BusinessException("Chỉ nhân viên được phân công mới có quyền đóng và giải quyết phiếu hỗ trợ này.");
            }
        }

        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setResolution(request.getResolution());
        ticket.setClosedDate(LocalDateTime.now());

        SupportTicket saved = ticketRepository.save(ticket);
        return SupportTicketMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public SupportTicketDto.CommentResponse addComment(Long ticketId, SupportTicketDto.CommentRequest request) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket", ticketId));

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BusinessException("Không thể thêm bình luận vào phiếu hỗ trợ đã đóng.");
        }

        User user = getCurrentUser();

        SupportComment comment = SupportComment.builder()
                .ticket(ticket)
                .user(user)
                .comment(request.getComment())
                .build();

        SupportComment saved = commentRepository.save(comment);
        return SupportTicketMapper.toCommentResponseDto(saved);
    }
}
