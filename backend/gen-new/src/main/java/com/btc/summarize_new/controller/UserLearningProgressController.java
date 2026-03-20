package com.btc.summarize_new.controller;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.btc.summarize_new.dto.UserLearningProgressRequest;
import com.btc.summarize_new.dto.UserLearningProgressResponse;
import com.btc.summarize_new.service.UserLearningProgressService;

@RestController
@RequestMapping("/api/v1/user-learning-progess")
@RequiredArgsConstructor
public class UserLearningProgressController {

    private final UserLearningProgressService service;

	@GetMapping
	public ResponseEntity<UserLearningProgressResponse> getProgress(@RequestParam(name = "userId") Long userId,
			@RequestParam(name = "lessonId") Long lessonId) {
		UserLearningProgressResponse response = service.getProgress(userId, lessonId);
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/user-progress")
	public ResponseEntity<List<UserLearningProgressResponse>> getByUserId() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		  // Nếu chưa login hoặc là Anonymous User (Spring Security mặc định)
		Long userId = -1l;
	    if (!(auth instanceof AnonymousAuthenticationToken)) {
	    	userId =  Long.valueOf(auth.getPrincipal().toString());
	    } 
		return ResponseEntity.ok(service.getByUserId(userId));
	}

	@PostMapping("/upsert")
	@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
	public ResponseEntity<UserLearningProgressResponse> createOrUpate(@RequestBody UserLearningProgressRequest request) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		Long userId = Long.valueOf(auth.getPrincipal().toString());
		request.setUserId(userId);
		return new ResponseEntity<>(service.createOrUpdate(request), HttpStatus.CREATED);
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> delete(@PathVariable(name = "id") Long id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}


}
