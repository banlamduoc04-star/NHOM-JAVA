package com.seal.hackathon.repository;

import com.seal.hackathon.entity.TeamPrize;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TeamPrizeRepository extends JpaRepository<TeamPrize, Integer> {
    List<TeamPrize> findByTeamId(Integer teamId);
    boolean existsByTeamIdAndPrizeId(Integer teamId, Integer prizeId);
}
