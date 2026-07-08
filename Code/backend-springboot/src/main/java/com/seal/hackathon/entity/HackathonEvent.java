package com.seal.hackathon.entity;

// Import các annotation của Jakarta Persistence.
// Dùng để ánh xạ class Java với bảng trong database.
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


// Đánh dấu HackathonEvent là một Entity của JPA.
// Entity này sẽ được ánh xạ với một bảng trong database.
@Entity

// Chỉ định tên bảng trong database là hackathon_events.
@Table(name = "hackathon_events")

// Khai báo class HackathonEvent.
// Class này đại diện cho thông tin một sự kiện Hackathon.
public class HackathonEvent {


    // Đánh dấu eventId là khóa chính của bảng.
    @Id

    // Giá trị eventId được database tự động tăng.
    // GenerationType.IDENTITY thường dùng cho cột IDENTITY tự tăng.
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // ID của sự kiện Hackathon.
    public Integer eventId;


    // Cột eventName:
    // nullable = false nghĩa là không được phép để null.
    // length = 150 nghĩa là độ dài tối đa là 150 ký tự.
    @Column(nullable = false, length = 150)

    // Tên của sự kiện Hackathon.
    public String eventName;


    // Cột season:
    // không được để null
    // và có độ dài tối đa 30 ký tự.
    @Column(nullable = false, length = 30)

    // Mùa tổ chức của sự kiện.
    // Ví dụ: Spring, Summer hoặc Fall.
    public String season;


    // Cột eventYear không được để null.
    @Column(nullable = false)

    // Năm tổ chức sự kiện.
    public Integer eventYear;


    // Ngày bắt đầu sự kiện.
    public LocalDate startDate;


    // Ngày kết thúc sự kiện.
    public LocalDate endDate;


    // Cột status:
    // không được để null
    // và có độ dài tối đa 30 ký tự.
    @Column(nullable = false, length = 30)

    // Trạng thái của sự kiện.
    // Giá trị mặc định ban đầu là "Draft".
    public String status = "Draft";


    // Cột description có độ dài tối đa 2000 ký tự.
    @Column(length = 2000)

    // Phần mô tả chi tiết của sự kiện.
    public String description;


    // ID của người đã tạo sự kiện.
    public Integer createdBy;


    // Cột createdAt không được để null.
    @Column(nullable = false)

    // Thời điểm tạo sự kiện.
    // Khi tạo object mới, giá trị mặc định là thời gian hiện tại.
    public LocalDateTime createdAt = LocalDateTime.now();
}