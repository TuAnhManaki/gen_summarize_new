package com.btc.summarize_new.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.btc.summarize_new.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);
	boolean existsByEmail(String email); 
}
