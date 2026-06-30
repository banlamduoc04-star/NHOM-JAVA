package com.seal.hackathon.repository;

import com.seal.hackathon.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Integer> {
    List<TeamMember> findByTeamId(Integer teamId);
    Optional<TeamMember> findByTeamIdAndUserId(Integer teamId, Integer userId);
    boolean existsByTeamIdAndUserId(Integer teamId, Integer userId);
    long countByTeamId(Integer teamId);
    void deleteByTeamIdAndUserId(Integer teamId, Integer userId);
    List<TeamMember> findByUserId(Integer userId);
}
