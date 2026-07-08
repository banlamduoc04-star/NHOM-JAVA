package com.seal.hackathon.entity;

// Import toàn bộ annotation của Jakarta Persistence.
// Dùng để ánh xạ class Java với bảng trong database.
import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


// Đánh dấu EventCriterion là một Entity của JPA.
// Class này sẽ được Hibernate/JPA quản lý.
@Entity

// Chỉ định class EventCriterion
// được ánh xạ với bảng "event_criteria" trong database.
@Table(name = "event_criteria")

// Khai báo class EventCriterion.
// Class này đại diện cho một tiêu chí chấm điểm
// được áp dụng cho một sự kiện Hackathon cụ thể.
public class EventCriterion {


    // Đánh dấu criterionId là khóa chính của bảng.
    @Id

    // Cho phép database tự động sinh giá trị criterionId.
    // GenerationType.IDENTITY nghĩa là ID được database tự tăng.
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // ID duy nhất của tiêu chí chấm điểm.
    public Integer criterionId;


    // Cấu hình cột eventId.
    // nullable = false nghĩa là không được phép để null.
    @Column(nullable = false)

    // ID của sự kiện mà tiêu chí này được áp dụng.
    // Dùng để liên kết logic EventCriterion với HackathonEvent.
    public Integer eventId;


    // Cấu hình cột criterionName:
    // nullable = false nghĩa là không được để null.
    // length = 150 nghĩa là độ dài tối đa 150 ký tự.
    @Column(nullable = false, length = 150)

    // Tên của tiêu chí chấm điểm.
    public String criterionName;


    // Cấu hình cột maxScore:
    // nullable = false nghĩa là không được để null.
    // precision = 8 nghĩa là tổng tối đa 8 chữ số.
    // scale = 2 nghĩa là có tối đa 2 chữ số sau dấu thập phân.
    @Column(nullable = false, precision = 8, scale = 2)

    // Điểm tối đa của tiêu chí.
    // Giá trị mặc định là BigDecimal.TEN, tức là 10.
    public BigDecimal maxScore = BigDecimal.TEN;


    // Cấu hình cột weight:
    // nullable = false nghĩa là không được để null.
    // precision = 8 nghĩa là tổng tối đa 8 chữ số.
    // scale = 2 nghĩa là có tối đa 2 chữ số sau dấu thập phân.
    @Column(nullable = false, precision = 8, scale = 2)

    // Trọng số của tiêu chí.
    // Giá trị mặc định là BigDecimal.ONE, tức là 1.
    public BigDecimal weight = BigDecimal.ONE;


    // Cấu hình cột isActive.
    // nullable = false nghĩa là không được để null.
    @Column(nullable = false)

    // Xác định tiêu chí có đang được sử dụng hay không.
    // Giá trị mặc định là true.
    public Boolean isActive = true;
}