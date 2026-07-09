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

        var authorities = user.getRoles().stream()
                .flatMap(role -> {
                    var roleAuthority = new SimpleGrantedAuthority("ROLE_" + role.getCode());
                    var permAuthorities = role.getPermissions().stream()
                            .map(p -> new SimpleGrantedAuthority(p.getCode()));
                    return java.util.stream.Stream.concat(java.util.stream.Stream.of(roleAuthority), permAuthorities);
                })
                .collect(Collectors.toSet());

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
