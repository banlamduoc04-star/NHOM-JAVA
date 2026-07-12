package com.seal.hackathon.repository;

import com.seal.hackathon.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface AppUserRepository extends JpaRepository<AppUser, Integer> {

    // Authentication
    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);


    // User Management
    List<AppUser> findByIsApproved(Boolean isApproved);

    List<AppUser> findByRoleName(String roleName);

    List<AppUser> findByIsApprovedAndRoleName(
            Boolean isApproved,
            String roleName
    );
}