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


// Đánh dấu CriterionTemplateItem là một Entity của JPA.
@Entity

// Chỉ định class này được ánh xạ
// với bảng "criterion_template_items" trong database.
@Table(name = "criterion_template_items")

// Khai báo class CriterionTemplateItem.
// Class này đại diện cho một tiêu chí cụ thể
// nằm bên trong một mẫu bộ tiêu chí.
public class CriterionTemplateItem {


    // Đánh dấu templateItemId là khóa chính của bảng.
    @Id

    // Cho phép database tự động sinh giá trị templateItemId.
    // GenerationType.IDENTITY nghĩa là ID được database tự tăng.
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // ID duy nhất của một tiêu chí trong mẫu.
    public Integer templateItemId;


    // Cấu hình cột templateId.
    // nullable = false nghĩa là không được phép để null.
    @Column(nullable = false)

    // ID của CriterionTemplate mà item này thuộc về.
    // Dùng để liên kết logic với mẫu bộ tiêu chí.
    public Integer templateId;


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


    // Cấu hình cột displayOrder.
    // nullable = false nghĩa là không được để null.
    @Column(nullable = false)

    // Thứ tự hiển thị của tiêu chí trong mẫu.
    // Giá trị mặc định là 1.
    public Integer displayOrder = 1;
}