package com.smartpark.security;

import com.smartpark.domain.auth.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

/**
 * UserDetailsService implementation — nạp thông tin người dùng từ DB cho Spring Security.
 * MODULE 1: Authentication - dùng để đối chiếu JWT và xác thực đăng nhập.
 * Vai trò được chuyển thành GrantedAuthority dạng "ROLE_<code>" cho Spring RBAC.
 */
@Service
@RequiredArgsConstructor
public class SmartParkUserDetailsService implements UserDetailsService {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = entityManager.createQuery(
                        "SELECT u FROM User u LEFT JOIN FETCH u.roles r LEFT JOIN FETCH r.permissions WHERE u.username = :username",
                        User.class)
                .setParameter("username", username)
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        java.util.List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .flatMap(role -> {
                    java.util.List<SimpleGrantedAuthority> list = new java.util.ArrayList<>();
                    list.add(new SimpleGrantedAuthority("ROLE_" + role.getCode()));
                    if ("SYSTEM_ADMIN".equals(role.getCode())) {
                        list.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                        list.add(new SimpleGrantedAuthority("ADMIN"));
                    } else if ("PARK_MANAGER".equals(role.getCode())) {
                        list.add(new SimpleGrantedAuthority("ROLE_MANAGER"));
                        list.add(new SimpleGrantedAuthority("MANAGER"));
                    } else if ("GATE_STAFF".equals(role.getCode())) {
                        list.add(new SimpleGrantedAuthority("ROLE_NHAN_VIEN"));
                        list.add(new SimpleGrantedAuthority("NHAN_VIEN"));
                    }
                    role.getPermissions().forEach(p -> list.add(new SimpleGrantedAuthority(p.getCode())));
                    return list.stream();
                })
                .collect(Collectors.toList());

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .authorities(authorities)
                .accountLocked(user.getStatus() == User.UserStatus.LOCKED
                        || (user.getLockedUntil() != null && user.getLockedUntil().isAfter(java.time.LocalDateTime.now())))
                .disabled(user.getStatus() == User.UserStatus.DISABLED)
                .build();
    }
}
