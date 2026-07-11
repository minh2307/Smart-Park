package com.smartpark.domain.employee.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.employee.entity.Employee;
import com.smartpark.domain.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public Page<Employee> findAll(Pageable pageable) {
        return employeeRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Employee findById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Nhân viên không tồn tại: " + id));
    }

    @Transactional
    public Employee create(Employee employee) {
        if (employee.getPhone() != null && employeeRepository.findByPhone(employee.getPhone()).isPresent()) {
            throw new BusinessException("Số điện thoại '" + employee.getPhone() + "' đã được sử dụng.");
        }
        return employeeRepository.save(employee);
    }

    @Transactional
    public void softDelete(Long id) {
        Employee employee = findById(id);
        employee.setStatus(Employee.EmployeeStatus.RESIGNED);
        employeeRepository.save(employee);
    }
}
