package com.seal.hackathon.repository;

import com.seal.hackathon.entity.AnnouncementRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface AnnouncementRecipientRepository extends JpaRepository<AnnouncementRecipient, Integer> {

    // Recipient Search
    List<AnnouncementRecipient> findByUserId(Integer userId);

    Optional<AnnouncementRecipient> findByAnnouncementIdAndUserId(
            Integer announcementId,
            Integer userId
    );
}