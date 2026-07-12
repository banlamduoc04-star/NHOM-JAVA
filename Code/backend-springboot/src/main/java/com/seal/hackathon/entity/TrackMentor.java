package com.seal.hackathon.entity;

// Import toàn bộ annotation của Jakarta Persistence.
// Dùng để ánh xạ class Java với bảng trong database.
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;


// Đánh dấu TrackMentor là một Entity của JPA.
@Entity

// Chỉ định class này được ánh xạ với bảng "track_mentors".
//
// uniqueConstraints tạo ràng buộc duy nhất trên bộ đôi:
// trackId + mentorId.
//
// Nghĩa là một Mentor không thể được phân công trùng
// nhiều lần vào cùng một Track.
@Table(
        name = "track_mentors",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {
                        "trackId",
                        "mentorId"
                }
        )
)

// Khai báo class TrackMentor.
// Class này đại diện cho việc phân công Mentor
// vào hỗ trợ một Track cụ thể.
public class TrackMentor {


    // Đánh dấu trackMentorId là khóa chính của bảng.
    @Id

    // Cho phép database tự động sinh giá trị trackMentorId.
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // ID duy nhất của bản ghi phân công Mentor.
    public Integer trackMentorId;


    // Cột trackId không được phép để null.
    @Column(nullable = false)

    // ID của Track mà Mentor được phân công hỗ trợ.
    public Integer trackId;


    // Cột mentorId không được phép để null.
    @Column(nullable = false)

    // ID của Mentor được phân công vào Track.
    public Integer mentorId;


    // Cột assignedAt không được phép để null.
    @Column(nullable = false)

    // Thời điểm Mentor được phân công.
    // Giá trị mặc định là thời gian hiện tại.
    public LocalDateTime assignedAt = LocalDateTime.now();
}