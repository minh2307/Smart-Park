package com.smartpark.domain.complaint.service;

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
import com.smartpark.domain.complaint.repository.ComplaintHistoryRepository;
import com.smartpark.domain.complaint.repository.ComplaintRepository;
import com.smartpark.domain.complaint.service.impl.ComplaintServiceImpl;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock private ComplaintRepository complaintRepository;
    @Mock private ComplaintHistoryRepository historyRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private UserRepository userRepository;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks private ComplaintServiceImpl complaintService;

    private User user;
    private Customer customer;
    private Employee employee;
    private Complaint complaint;

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
        employee.setFullName("CSKH Agent");
        employee.setUserId(99L);

        complaint = new Complaint();
        complaint.setId(1L);
        complaint.setComplaintNumber("CP-12345");
        complaint.setCustomer(customer);
        complaint.setComplaintType("Double charge");
        complaint.setDescription("Charged twice for rental deposit.");
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setHistory(new ArrayList<>());
    }

    private void mockSecurityContext(String username) {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @SuppressWarnings("unchecked")
    void findAllComplaints_ShouldReturnPage() {
        Page<Complaint> page = new PageImpl<>(List.of(complaint));
        when(complaintRepository.findAll(any(Specification.class), any(PageRequest.class))).thenReturn(page);

        Page<ComplaintDto.Response> result = complaintService.findAllComplaints(
                "Double", "SUBMITTED", 20L, null, null, PageRequest.of(0, 10)
        );

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void createComplaint_ShouldSucceed_AndRecordInitialHistory() {
        mockSecurityContext("customer_user");
        when(userRepository.findByUsername("customer_user")).thenReturn(Optional.of(user));
        when(customerRepository.findByUserId(10L)).thenReturn(Optional.of(customer));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

        ComplaintDto.CreateRequest request = ComplaintDto.CreateRequest.builder()
                .complaintType("Double charge")
                .description("Charged twice for rental deposit.")
                .build();

        ComplaintDto.Response response = complaintService.createComplaint(request);
        assertThat(response).isNotNull();
        assertThat(response.getComplaintNumber()).isEqualTo("CP-12345");

        verify(historyRepository, times(1)).save(any(ComplaintHistory.class));
    }

    @Test
    void resolveComplaint_ShouldSucceed_WhenCSKHEmployee() {
        mockSecurityContext("cskh_user");

        User cskhUser = new User();
        cskhUser.setId(50L);
        cskhUser.setUsername("cskh_user");

        when(userRepository.findByUsername("cskh_user")).thenReturn(Optional.of(cskhUser));
        when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));
        when(employeeRepository.findByUserId(50L)).thenReturn(Optional.of(employee));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ComplaintDto.ResolveRequest resolveRequest = ComplaintDto.ResolveRequest.builder()
                .resolution("Refunded transaction fee.")
                .build();

        ComplaintDto.Response response = complaintService.resolveComplaint(1L, resolveRequest);
        assertThat(response.getStatus()).isEqualTo(ComplaintStatus.RESOLVED);
        assertThat(response.getResolution()).isEqualTo("Refunded transaction fee.");

        verify(historyRepository, times(1)).save(any(ComplaintHistory.class));
    }

    @Test
    void rejectComplaint_ShouldFail_WhenAlreadyResolved() {
        complaint.setStatus(ComplaintStatus.RESOLVED);

        when(complaintRepository.findById(1L)).thenReturn(Optional.of(complaint));

        ComplaintDto.RejectRequest rejectRequest = ComplaintDto.RejectRequest.builder()
                .reason("No double charge found.")
                .build();

        assertThatThrownBy(() -> complaintService.rejectComplaint(1L, rejectRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Khiếu nại đã kết thúc xử lý");
    }
}
