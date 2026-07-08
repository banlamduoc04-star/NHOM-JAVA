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


// Đánh dấu HackathonRound là một Entity của JPA.
@Entity

// Chỉ định bảng tương ứng trong database là "hackathon_rounds".
@Table(name = "hackathon_rounds")

// Khai báo class HackathonRound.
// Class này đại diện cho một vòng thi trong sự kiện Hackathon.
public class HackathonRound {


    // Đánh dấu roundId là khóa chính của bảng.
    @Id

    // Cho phép database tự động sinh giá trị roundId.
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // ID duy nhất của vòng thi.
    public Integer roundId;


    // Cột eventId không được phép để null.
    @Column(nullable = false)

    // ID của sự kiện mà vòng thi này thuộc về.
    // Dùng để liên kết logic HackathonRound với HackathonEvent.
    public Integer eventId;


    // Cột roundName:
    // nullable = false nghĩa là không được để null.
    // length = 150 nghĩa là độ dài tối đa 150 ký tự.
    @Column(nullable = false, length = 150)

    // Tên của vòng thi.
    public String roundName;


    // Cột roundOrder không được phép để null.
    @Column(nullable = false)

    // Thứ tự của vòng thi trong sự kiện.
    // Ví dụ: vòng 1, vòng 2, vòng 3.
    public Integer roundOrder;


    // Thời hạn cuối cùng để nộp bài cho vòng thi.
    public LocalDateTime submissionDeadline;


    // Số lượng đội cao nhất được đi tiếp vào vòng sau.
    public Integer topNAdvance;


    // Cột roundType:
    // không được phép để null.
    // Có độ dài tối đa 30 ký tự.
    @Column(nullable = false, length = 30)

    // Loại của vòng thi.
    // Giá trị mặc định là "Competition".
    public String roundType = "Competition";


    // Cột isCalibrationRound không được phép để null.
    @Column(nullable = false)

    // Xác định vòng thi có phải là vòng hiệu chuẩn hay không.
    // Giá trị mặc định là false.
    public Boolean isCalibrationRound = false;


    // Thời gian bắt đầu của vòng thi.
    public LocalDateTime startTime;


    // Thời gian kết thúc của vòng thi.
    public LocalDateTime endTime;
}