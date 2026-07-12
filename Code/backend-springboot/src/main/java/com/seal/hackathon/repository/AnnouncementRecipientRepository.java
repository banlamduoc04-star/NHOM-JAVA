package com.seal.hackathon.repository;

import com.seal.hackathon.entity.AnnouncementRecipient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface AnnouncementRecipientRepository extends JpaRepository<AnnouncementRecipient, Integer> {

    // Lấy danh sách thông báo của một người dùng
    List<AnnouncementRecipient> findByUserId(Integer userId);

    // Tìm trạng thái đã đọc của người dùng đối với một thông báo
    Optional<AnnouncementRecipient> findByAnnouncementIdAndUserId(
            Integer announcementId,
            Integer userId
    );
}