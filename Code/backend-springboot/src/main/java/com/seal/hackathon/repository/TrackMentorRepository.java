package com.seal.hackathon.repository;

import com.seal.hackathon.entity.TrackMentor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface TrackMentorRepository extends JpaRepository<TrackMentor, Integer> {

    // Lấy danh sách mentor của một hạng mục (track)
    List<TrackMentor> findByTrackId(Integer trackId);

    // Lấy các hạng mục mà mentor được phân công
    List<TrackMentor> findByMentorId(Integer mentorId);

    // Kiểm tra mentor đã được phân công vào track hay chưa
    boolean existsByTrackIdAndMentorId(
            Integer trackId,
            Integer mentorId
    );

    // Kiểm tra track đã có mentor được phân công hay chưa
    boolean existsByTrackId(Integer trackId);
}