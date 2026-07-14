package com.smartpark.domain.promotion.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.promotion.dto.VoucherRequestDto;
import com.smartpark.domain.promotion.dto.VoucherResponseDto;
import com.smartpark.domain.promotion.dto.VoucherRedeemRequestDto;
import com.smartpark.domain.promotion.entity.Voucher;
import com.smartpark.domain.promotion.entity.VoucherUsage;
import com.smartpark.domain.promotion.mapper.PromotionMapper;
import com.smartpark.domain.promotion.repository.VoucherRepository;
import com.smartpark.domain.promotion.repository.VoucherUsageRepository;
import com.smartpark.domain.promotion.service.impl.VoucherServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoucherServiceImplTest {

    @Mock
    private VoucherRepository voucherRepository;

    @Mock
    private VoucherUsageRepository voucherUsageRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private PromotionMapper promotionMapper;

    @InjectMocks
    private VoucherServiceImpl voucherService;

    private Voucher voucher;
    private Customer customer;
    private VoucherRequestDto requestDto;
    private VoucherResponseDto responseDto;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(100L);

        voucher = Voucher.builder()
                .id(1L)
                .code("VOUCH123")
                .voucherValue(BigDecimal.valueOf(500000))
                .remainingBalance(BigDecimal.valueOf(500000))
                .validFrom(LocalDate.now().minusDays(1))
                .validTo(LocalDate.now().plusDays(10))
                .customer(customer)
                .status(Voucher.VoucherStatus.ACTIVE)
                .build();

        requestDto = VoucherRequestDto.builder()
                .code("VOUCH123")
                .voucherValue(BigDecimal.valueOf(500000))
                .validFrom(LocalDate.now().minusDays(1))
                .validTo(LocalDate.now().plusDays(10))
                .customerId(100L)
                .status("ACTIVE")
                .build();

        responseDto = VoucherResponseDto.builder()
                .id(1L)
                .code("VOUCH123")
                .voucherValue(BigDecimal.valueOf(500000))
                .remainingBalance(BigDecimal.valueOf(500000))
                .validFrom(LocalDate.now().minusDays(1))
                .validTo(LocalDate.now().plusDays(10))
                .customerId(100L)
                .status("ACTIVE")
                .build();
    }

    @Test
    void findAll_ShouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Voucher> page = new PageImpl<>(Collections.singletonList(voucher));

        when(voucherRepository.findAllWithFilters(any(), any(), any(), eq(pageable))).thenReturn(page);
        when(promotionMapper.toResponse(any(Voucher.class))).thenReturn(responseDto);

        Page<VoucherResponseDto> result = voucherService.findAll("search", 100L, "ACTIVE", pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCode()).isEqualTo("VOUCH123");
    }

    @Test
    void findById_ShouldReturnVoucher() {
        when(voucherRepository.findById(1L)).thenReturn(Optional.of(voucher));
        when(promotionMapper.toResponse(voucher)).thenReturn(responseDto);

        VoucherResponseDto result = voucherService.findById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void create_ShouldSave_WhenValid() {
        when(voucherRepository.existsByCode("VOUCH123")).thenReturn(false);
        when(customerRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(promotionMapper.toEntity(requestDto, customer)).thenReturn(voucher);
        when(voucherRepository.save(voucher)).thenReturn(voucher);
        when(promotionMapper.toResponse(voucher)).thenReturn(responseDto);

        VoucherResponseDto result = voucherService.create(requestDto);

        assertThat(result).isNotNull();
        verify(voucherRepository).save(voucher);
    }

    @Test
    void create_ShouldThrow_WhenCodeExists() {
        when(voucherRepository.existsByCode("VOUCH123")).thenReturn(true);

        assertThatThrownBy(() -> voucherService.create(requestDto))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void update_ShouldSave_WhenValid() {
        when(voucherRepository.findById(1L)).thenReturn(Optional.of(voucher));
        when(customerRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(voucherRepository.save(voucher)).thenReturn(voucher);
        when(promotionMapper.toResponse(voucher)).thenReturn(responseDto);

        VoucherResponseDto result = voucherService.update(1L, requestDto);

        assertThat(result).isNotNull();
        verify(promotionMapper).updateEntity(voucher, requestDto, customer);
    }

    @Test
    void delete_ShouldSetDisabled() {
        when(voucherRepository.findById(1L)).thenReturn(Optional.of(voucher));

        voucherService.delete(1L);

        assertThat(voucher.getStatus()).isEqualTo(Voucher.VoucherStatus.DISABLED);
        verify(voucherRepository).save(voucher);
    }

    @Test
    void validate_ShouldReturnApplicableAmount_WhenValid() {
        when(voucherRepository.findByCode("VOUCH123")).thenReturn(Optional.of(voucher));

        BigDecimal applicable = voucherService.validate("VOUCH123", 100L, BigDecimal.valueOf(300000));

        assertThat(applicable).isEqualByComparingTo("300000");
    }

    @Test
    void validate_ShouldThrow_WhenInactive() {
        voucher.setStatus(Voucher.VoucherStatus.DISABLED);
        when(voucherRepository.findByCode("VOUCH123")).thenReturn(Optional.of(voucher));

        assertThatThrownBy(() -> voucherService.validate("VOUCH123", 100L, BigDecimal.valueOf(300000)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("không ở trạng thái hoạt động");
    }

    @Test
    void validate_ShouldThrow_WhenExpired() {
        voucher.setValidTo(LocalDate.now().minusDays(5));
        when(voucherRepository.findByCode("VOUCH123")).thenReturn(Optional.of(voucher));

        assertThatThrownBy(() -> voucherService.validate("VOUCH123", 100L, BigDecimal.valueOf(300000)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("hết hạn sử dụng");
    }

    @Test
    void validate_ShouldThrow_WhenWrongCustomer() {
        when(voucherRepository.findByCode("VOUCH123")).thenReturn(Optional.of(voucher));

        assertThatThrownBy(() -> voucherService.validate("VOUCH123", 200L, BigDecimal.valueOf(300000)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("không thuộc về khách hàng");
    }

    @Test
    void validate_ShouldThrow_WhenBalanceZero() {
        voucher.setRemainingBalance(BigDecimal.ZERO);
        when(voucherRepository.findByCode("VOUCH123")).thenReturn(Optional.of(voucher));

        assertThatThrownBy(() -> voucherService.validate("VOUCH123", 100L, BigDecimal.valueOf(300000)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("hết số dư");
    }

    @Test
    void redeem_ShouldReduceBalanceAndSaveUsage() {
        VoucherRedeemRequestDto redeemReq = VoucherRedeemRequestDto.builder()
                .code("VOUCH123")
                .customerId(100L)
                .redeemAmount(BigDecimal.valueOf(200000))
                .bookingId(1L)
                .build();

        when(voucherRepository.findByCode("VOUCH123")).thenReturn(Optional.of(voucher));
        when(customerRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(voucherRepository.save(voucher)).thenReturn(voucher);
        when(promotionMapper.toResponse(voucher)).thenReturn(responseDto);

        voucherService.redeem(redeemReq);

        assertThat(voucher.getRemainingBalance()).isEqualByComparingTo("300000");
        verify(voucherUsageRepository).save(any(VoucherUsage.class));
    }

    @Test
    void disable_ShouldSetDisabledStatus() {
        when(voucherRepository.findById(1L)).thenReturn(Optional.of(voucher));
        when(voucherRepository.save(voucher)).thenReturn(voucher);
        when(promotionMapper.toResponse(voucher)).thenReturn(responseDto);

        VoucherResponseDto result = voucherService.disable(1L);

        assertThat(voucher.getStatus()).isEqualTo(Voucher.VoucherStatus.DISABLED);
    }
}
