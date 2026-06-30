# Hướng dẫn chạy SEAL SU26SWP04 trên IntelliJ

## 1. Mở project

Mở IntelliJ IDEA → **File → Open** → chọn thư mục:

```text
SEAL_SU26SWP04_REBUILT/backend-springboot
```

IntelliJ sẽ nhận đây là Maven Spring Boot project qua file `pom.xml`.

## 2. Cấu hình JDK

Chọn JDK 17 trở lên:

```text
File → Project Structure → Project SDK → JDK 17 hoặc JDK 21
```

## 3. Chạy backend + giao diện web

Mở file:

```text
src/main/java/com/seal/hackathon/SealHackathonApplication.java
```

Bấm nút Run màu xanh ở hàm `main`.

Sau khi console báo Spring Boot đã chạy ở port 8080, mở trình duyệt:

```text
http://localhost:8080
```

Giao diện mới nằm trực tiếp trong Spring Boot nên **không bắt buộc chạy frontend Next.js**.

## 4. Tài khoản demo

```text
Ban tổ chức: coordinator@seal.edu.vn / 123456
Mentor: mentor@seal.edu.vn / 123456
Giám khảo nội bộ: judge@seal.edu.vn / 123456
Giám khảo khách mời: guestjudge@seal.edu.vn / 123456
Trưởng nhóm demo: leader1@seal.edu.vn / 123456
```

## 5. Trang phụ trợ

Swagger API:

```text
http://localhost:8080/swagger-ui.html
```

H2 Console:

```text
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:sealdb
Username: sa
Password: để trống
```

## 6. Ghi chú cho demo bảo vệ

- Chạy một lệnh trong IntelliJ là có cả API và giao diện.
- Dữ liệu demo tự khởi tạo khi app chạy lần đầu.
- Dashboard có các tab: Tổng quan, Sự kiện & vòng, Đội thi & nộp bài, Chấm điểm, RBL, Tài khoản.
- RBL có ICC xấp xỉ, Krippendorff’s alpha xấp xỉ, phương sai theo tiêu chí và nút xuất CSV ẩn danh.
