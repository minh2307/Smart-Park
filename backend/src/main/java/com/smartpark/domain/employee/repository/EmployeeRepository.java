package com.smartpark.domain.employee.repository;

import com.smartpark.domain.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByPhone(String phone);
    Optional<Employee> findByUserId(Long userId);
    List<Employee> findByStatus(Employee.EmployeeStatus status);
    long countByStatus(Employee.EmployeeStatus status);
}
