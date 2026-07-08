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


// Đánh dấu JudgeAssignment là một Entity của JPA.
@Entity

// Chỉ định class này được ánh xạ với bảng "judge_assignments".
//
// uniqueConstraints tạo ràng buộc duy nhất trên bộ ba:
// roundId + trackId + judgeId.
//
// Nghĩa là cùng một Judge không thể bị gán trùng
// vào cùng một Round và cùng một Track.
@Table(
        name = "judge_assignments",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {
                        "roundId",
                        "trackId",
                        "judgeId"
                }
        )
)

// Khai báo class JudgeAssignment.
// Class này đại diện cho việc phân công Judge
// vào một vòng thi và một Track cụ thể.
public class JudgeAssignment {


    // Đánh dấu assignmentId là khóa chính của bảng.
    @Id

    // Cho phép database tự động sinh giá trị assignmentId.
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // ID duy nhất của bản ghi phân công Judge.
    public Integer assignmentId;


    // Cột roundId không được phép để null.
    @Column(nullable = false)

    // ID của vòng thi mà Judge được phân công.
    public Integer roundId;


    // Cột trackId không được phép để null.
    @Column(nullable = false)

    // ID của Track mà Judge được phân công chấm.
    public Integer trackId;


    // Cột judgeId không được phép để null.
    @Column(nullable = false)

    // ID của Judge được phân công.
    public Integer judgeId;


    // Cột assignedAt không được phép để null.
    @Column(nullable = false)

    // Thời điểm thực hiện việc phân công Judge.
    // Giá trị mặc định là thời gian hiện tại.
    public LocalDateTime assignedAt = LocalDateTime.now();
}