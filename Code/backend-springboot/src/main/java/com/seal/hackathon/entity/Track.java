package com.seal.hackathon.entity;

// Import toàn bộ annotation và thành phần của Jakarta Persistence.
// Dùng để ánh xạ class Java với bảng trong database.
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


// Đánh dấu Track là một Entity của JPA.
// Entity này sẽ được ánh xạ với một bảng trong database.
@Entity

// Chỉ định tên bảng tương ứng trong database là "tracks".
@Table(name = "tracks")

// Khai báo class Track.
// Class này đại diện cho một chủ đề hoặc lĩnh vực thi trong sự kiện Hackathon.
public class Track {


    // Đánh dấu trackId là khóa chính của bảng tracks.
    @Id

    // Cho phép database tự động sinh giá trị trackId.
    // GenerationType.IDENTITY thường tương ứng với cột ID tự tăng.
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // ID duy nhất của Track.
    public Integer trackId;


    // Cột eventId không được phép để null.
    @Column(nullable = false)

    // ID của sự kiện mà Track này thuộc về.
    // Dùng để liên kết logic Track với HackathonEvent.
    public Integer eventId;


    // Cột trackName:
    // nullable = false nghĩa là không được để null.
    // length = 150 nghĩa là độ dài tối đa là 150 ký tự.
    @Column(nullable = false, length = 150)

    // Tên của Track.
    public String trackName;


    // Cột description có độ dài tối đa 1000 ký tự.
    @Column(length = 1000)

    // Nội dung mô tả chi tiết của Track.
    public String description;
}