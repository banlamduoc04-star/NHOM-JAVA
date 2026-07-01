package com.seal.hackathon.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Integer> {
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
    List<AppUser> findByIsApproved(Boolean isApproved);
    List<AppUser> findByRoleName(String roleName);
    List<AppUser> findByIsApprovedAndRoleName(Boolean isApproved, String roleName);
}