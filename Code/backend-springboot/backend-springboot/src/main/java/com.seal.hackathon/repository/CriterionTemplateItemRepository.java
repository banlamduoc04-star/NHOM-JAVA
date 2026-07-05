package com.seal.hackathon.repository;

import com.seal.hackathon.entity.CriterionTemplateItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CriterionTemplateItemRepository extends JpaRepository<CriterionTemplateItem, Integer> {
    List<CriterionTemplateItem> findByTemplateIdOrderByDisplayOrderAsc(Integer templateId);
    void deleteByTemplateId(Integer templateId);
}
