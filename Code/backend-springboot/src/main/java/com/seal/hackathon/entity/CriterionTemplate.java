package com.seal.hackathon.entity;

// Import toàn bộ annotation của Jakarta Persistence.
// Dùng để ánh xạ class Java với bảng trong database.
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


// Đánh dấu CriterionTemplate là một Entity của JPA.
// Class này sẽ được Hibernate/JPA quản lý.
@Entity

// Chỉ định class CriterionTemplate
// được ánh xạ với bảng "criterion_templates" trong database.
@Table(name = "criterion_templates")

// Khai báo class CriterionTemplate.
// Class này đại diện cho một mẫu bộ tiêu chí chấm điểm.
public class CriterionTemplate {


    // Đánh dấu templateId là khóa chính của bảng.
    @Id

    // Cho phép database tự động sinh giá trị templateId.
    // GenerationType.IDENTITY nghĩa là ID được database tự tăng.
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // ID duy nhất của mẫu tiêu chí.
    public Integer templateId;


    // Cấu hình cột templateName:
    // nullable = false nghĩa là không được để null.
    // length = 150 nghĩa là độ dài tối đa 150 ký tự.
    @Column(nullable = false, length = 150)

    // Tên của mẫu bộ tiêu chí.
    public String templateName;


    // Cấu hình cột description.
    // Nội dung có độ dài tối đa 1000 ký tự.
    @Column(length = 1000)

    // Nội dung mô tả của mẫu bộ tiêu chí.
    public String description;


    // Cấu hình cột isActive.
    // nullable = false nghĩa là không được để null.
    @Column(nullable = false)

    // Xác định mẫu tiêu chí có đang hoạt động hay không.
    // Giá trị mặc định khi tạo object là true.
    public Boolean isActive = true;
}