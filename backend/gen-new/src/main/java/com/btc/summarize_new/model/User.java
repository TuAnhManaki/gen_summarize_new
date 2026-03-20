package com.btc.summarize_new.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter @Setter
public class User implements UserDetails{

	private static final long serialVersionUID = 1L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;

    @Column(nullable = false)
    private String password;

    private String role; // USER / ADMIN

    // --- CÁC METHOD CỦA USERDETAILS ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Chuyển string role thành SimpleGrantedAuthority
        // Lưu ý: Nên thêm tiền tố ROLE_ để dùng được hasRole('ADMIN')
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
    }

    @Override
    public String getUsername() {
        return this.email; // Spring Security coi email là username để định danh
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Tài khoản không hết hạn
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Tài khoản không bị khóa
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Mật khẩu không hết hạn
    }

    @Override
    public boolean isEnabled() {
        return true; // Tài khoản đang hoạt động
    }
}
