package com.seal.hackathon.repository;

// Import entity HackathonRound.
// Repository này sẽ thao tác với dữ liệu của HackathonRound.
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.HackathonRound;


// Khai báo interface HackathonRoundRepository.
//
// Repository này dùng để thao tác với dữ liệu
// của các vòng thi Hackathon trong database.
public interface HackathonRoundRepository
        extends JpaRepository<HackathonRound, Integer> {


    // Tìm danh sách các vòng thi theo eventId.
    //
    // Sau khi tìm, kết quả được sắp xếp
    // theo trường roundOrder theo thứ tự tăng dần.
    //
    // Asc nghĩa là Ascending, tức tăng dần.
    //
    // eventId là ID của sự kiện cần lấy danh sách vòng thi.
    //
    // Kết quả trả về là List<HackathonRound>.
    List<HackathonRound> findByEventIdOrderByRoundOrderAsc(
            Integer eventId
    );
}