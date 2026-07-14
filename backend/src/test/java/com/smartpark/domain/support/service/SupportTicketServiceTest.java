package com.smartpark.domain.support.service;

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
import com.smartpark.domain.support.repository.SupportCommentRepository;
import com.smartpark.domain.support.repository.SupportTicketRepository;
import com.smartpark.domain.support.service.impl.SupportTicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupportTicketServiceTest {

    @Mock private SupportTicketRepository ticketRepository;
    @Mock private SupportCommentRepository commentRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private UserRepository userRepository;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks private SupportTicketServiceImpl ticketService;

    private User user;
    private Customer customer;
    private Employee employee;
    private SupportTicket ticket;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(10L);
        user.setUsername("customer_user");

        customer = new Customer();
        customer.setId(20L);
        customer.setFullName("Customer Full Name");
        customer.setUserId(user.getId());

        employee = new Employee();
        employee.setId(30L);
        employee.setFullName("Support Agent");
        employee.setUserId(99L);

        ticket = new SupportTicket();
        ticket.setId(1L);
        ticket.setTicketNumber("TK-12345");
        ticket.setCustomer(customer);
        ticket.setSubject("Locker won't open");
        ticket.setDescription("Tried scanning QR but locker is locked.");
        ticket.setPriority(TicketPriority.MEDIUM);
        ticket.setStatus(TicketStatus.OPEN);
    }

    private void mockSecurityContext(String username) {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAllTickets_ShouldReturnPage() {
        Page<SupportTicket> page = new PageImpl<>(List.of(ticket));
        when(ticketRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);

        Page<SupportTicketDto.Response> result = ticketService.findAllTickets(
                "Locker", "OPEN", "MEDIUM", 20L, null, null, null, PageRequest.of(0, 10)
        );

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void createTicket_ShouldSucceed_WhenUserIsCustomer() {
        mockSecurityContext("customer_user");
        when(userRepository.findByUsername("customer_user")).thenReturn(Optional.of(user));
        when(customerRepository.findByUserId(10L)).thenReturn(Optional.of(customer));
        when(ticketRepository.save(any(SupportTicket.class))).thenReturn(ticket);

        SupportTicketDto.CreateRequest request = SupportTicketDto.CreateRequest.builder()
                .subject("Locker won't open")
                .description("Tried scanning QR but locker is locked.")
                .priority(TicketPriority.MEDIUM)
                .build();

        SupportTicketDto.Response response = ticketService.createTicket(request);
        assertThat(response).isNotNull();
        assertThat(response.getTicketNumber()).isEqualTo("TK-12345");
    }

    @Test
    void assignTicket_ShouldChangeStatusToInProgress() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(employeeRepository.findById(30L)).thenReturn(Optional.of(employee));
        when(ticketRepository.save(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupportTicketDto.AssignRequest assignRequest = SupportTicketDto.AssignRequest.builder()
                .employeeId(30L)
                .build();

        SupportTicketDto.Response response = ticketService.assignTicket(1L, assignRequest);
        assertThat(response.getStatus()).isEqualTo(TicketStatus.IN_PROGRESS);
        assertThat(response.getAssignedEmployeeId()).isEqualTo(30L);
    }

    @Test
    void closeTicket_ShouldFail_WhenClosedByUnassignedEmployee() {
        mockSecurityContext("other_employee");

        User otherUser = new User();
        otherUser.setId(100L);
        otherUser.setUsername("other_employee");

        Employee otherEmployee = new Employee();
        otherEmployee.setId(40L);
        otherEmployee.setUserId(otherUser.getId());

        ticket.setAssignedEmployee(employee);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        when(userRepository.findByUsername("other_employee")).thenReturn(Optional.of(otherUser));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(employeeRepository.findByUserId(100L)).thenReturn(Optional.of(otherEmployee));

        SupportTicketDto.CloseRequest closeRequest = SupportTicketDto.CloseRequest.builder()
                .resolution("Fixed problem")
                .build();

        assertThatThrownBy(() -> ticketService.closeTicket(1L, closeRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Chỉ nhân viên được phân công mới có quyền đóng");
    }

    @Test
    void closeTicket_ShouldSucceed_WhenClosedByAssignedEmployee() {
        mockSecurityContext("agent_user");

        User agentUser = new User();
        agentUser.setId(50L);
        agentUser.setUsername("agent_user");
        employee.setUserId(agentUser.getId());

        ticket.setAssignedEmployee(employee);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        when(userRepository.findByUsername("agent_user")).thenReturn(Optional.of(agentUser));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(employeeRepository.findByUserId(50L)).thenReturn(Optional.of(employee));
        when(ticketRepository.save(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupportTicketDto.CloseRequest closeRequest = SupportTicketDto.CloseRequest.builder()
                .resolution("Fixed locker door lock manually.")
                .build();

        SupportTicketDto.Response response = ticketService.closeTicket(1L, closeRequest);
        assertThat(response.getStatus()).isEqualTo(TicketStatus.CLOSED);
        assertThat(response.getResolution()).isEqualTo("Fixed locker door lock manually.");
    }

    @Test
    void addComment_ShouldFail_WhenTicketIsClosed() {
        ticket.setStatus(TicketStatus.CLOSED);

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        SupportTicketDto.CommentRequest request = SupportTicketDto.CommentRequest.builder()
                .comment("New comment")
                .build();

        assertThatThrownBy(() -> ticketService.addComment(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Không thể thêm bình luận vào phiếu hỗ trợ đã đóng");
    }
}
