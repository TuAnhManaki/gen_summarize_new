package com.btc.summarize_new.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.btc.summarize_new.model.Source;


@Repository
public interface SourceRepository extends JpaRepository<Source, Long>{
	
}
