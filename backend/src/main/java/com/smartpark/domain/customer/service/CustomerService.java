package com.smartpark.domain.customer.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public Page<Customer> findAll(Pageable pageable) {
        return customerRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khách hàng không tồn tại: " + id));
    }

    @Transactional
    public Customer create(Customer customer) {
        if (customer.getPhone() != null && customerRepository.existsByPhone(customer.getPhone())) {
            throw new BusinessException("Số điện thoại '" + customer.getPhone() + "' đã được sử dụng.");
        }
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer update(Long id, Customer updated) {
        Customer existing = findById(id);
        existing.setFullName(updated.getFullName());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        existing.setGender(updated.getGender());
        existing.setBirthDate(updated.getBirthDate());
        if (updated.getStatus() != null) {
            existing.setStatus(updated.getStatus());
        }
        return customerRepository.save(existing);
    }

    @Transactional
    public void softDelete(Long id) {
        Customer customer = findById(id);
        customer.setStatus(Customer.CustomerStatus.INACTIVE);
        customerRepository.save(customer);
    }
}
