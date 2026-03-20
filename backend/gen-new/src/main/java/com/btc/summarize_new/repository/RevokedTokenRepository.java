package com.btc.summarize_new.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.btc.summarize_new.model.RevokedToken;


@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long>{
	
	boolean existsByToken(String token);
		
}
