# SU26SWP04 - Hệ thống quản lý cuộc thi SEAL Hackathon

Đây là bản web application cho đề tài **TV: Hệ thống quản lý cuộc thi SEAL Hackathon ngành Kỹ thuật Phần mềm** / **TA: SEAL – Software Engineering Hackathon Management System**.

Phiên bản này đã được chỉnh giao diện sang tiếng Việt, bổ sung dashboard quản trị nhiều module và thêm dữ liệu demo tiếng Việt để dễ chạy thử, quay video demo và trình bày đồ án.

## Công nghệ sử dụng

- Backend: Java Spring Boot
- Frontend: Next.js / React / TypeScript
- Xác thực: Email/Mật khẩu + JWT
- Kiểu API: RESTful API
- Cơ sở dữ liệu demo: H2 in-memory
- Hồ sơ SQL Server: có sẵn file cấu hình `application-sqlserver.yml`
- Tài liệu API: Swagger/OpenAPI

## Tài khoản demo

Sau khi chạy backend, hệ thống tự khởi tạo tài khoản demo để phục vụ chạy thử và bảo vệ đồ án. Giao diện mới có nút chọn nhanh tài khoản demo; mật khẩu demo là `123456`.

```text
Ban tổ chức: coordinator@seal.edu.vn / 123456
Mentor: mentor@seal.edu.vn / 123456
Giám khảo nội bộ: judge@seal.edu.vn / 123456
Giám khảo khách mời: guestjudge@seal.edu.vn / 123456
Trưởng nhóm demo: leader1@seal.edu.vn / 123456
```


## Bản chỉnh mới: giao diện chạy trực tiếp trong Spring Boot

Mình đã bổ sung giao diện web tĩnh tại `backend-springboot/src/main/resources/static`. Vì vậy khi chạy `SealHackathonApplication` trên IntelliJ, hệ thống có thể mở trực tiếp tại:

```text
http://localhost:8080
```

Không bắt buộc chạy `frontend-next` để demo cơ bản. Phần Next.js cũ vẫn được giữ lại để nhóm có thể tham khảo hoặc phát triển tiếp nếu muốn tách frontend riêng.

Các chỉnh sửa chính:

- Thêm landing page + dashboard sạch, dễ nhìn, responsive.
- Dashboard chia tab rõ ràng: Tổng quan, Sự kiện & vòng, Đội thi & nộp bài, Chấm điểm, RBL, Tài khoản.
- Bổ sung thao tác trực tiếp trên giao diện: tạo sự kiện, track, vòng, tiêu chí, đội, nộp bài, duyệt tài khoản, phân công judge/mentor, chấm điểm, loại bài, tính xếp hạng.
- Bổ sung route `/dashboard` và `/login` forward về giao diện chính.
- Mở quyền truy cập static assets trong Spring Security.
- Cấu hình Hibernate naming strategy để tránh lỗi tên cột khi tạo unique constraint với H2/SQL Server.

Xem thêm file `HUONG_DAN_CHAY_INTELLIJ.md` để chạy nhanh trên IntelliJ.

## Chạy backend

```bash
cd backend-springboot
mvn spring-boot:run
```

Backend chạy tại:

```text
http://localhost:8080
```

Swagger:

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

## Chạy frontend

```bash
cd frontend-next
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:3000
```

Nếu backend chạy ở địa chỉ khác, tạo file `.env.local` trong thư mục `frontend-next`:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Các module đã có trên dashboard tiếng Việt

1. Quản lý sự kiện hackathon theo mùa Spring/Summer/Fall.
2. Quản lý vòng thi, hạn nộp bài, vòng hiệu chuẩn và quy tắc Top N thăng vòng.
3. Quản lý hạng mục thi đấu và mentor.
4. Quản lý mẫu tiêu chí, tiêu chí theo sự kiện, điểm tối đa và trọng số.
5. Quản lý đội thi 3–5 thành viên và trạng thái phê duyệt.
6. Nộp bài theo vòng bằng URL repository, demo, báo cáo/slide.
7. Quản lý tài khoản, phê duyệt sinh viên và tạo tài khoản mentor/giám khảo/giám khảo khách mời.
8. Phân công giám khảo theo vòng thi và hạng mục.
9. Tính xếp hạng, xét thăng vòng và hiển thị đội dự kiến vào vòng tiếp theo.
10. Loại bài nộp vi phạm quy chế và ghi nhật ký kiểm tra.
11. Quản lý giải thưởng, thông báo và công bố thông tin đến người tham gia.
12. Dashboard RBL: phương sai điểm giữa giám khảo, độ đầy đủ chấm điểm và xuất CSV ẩn danh.
13. Quên mật khẩu: tạo mã đặt lại có thời hạn 15 phút và cập nhật mật khẩu mới.
14. Dashboard bổ sung thao tác phân công mentor, thêm thành viên đội và chấm điểm trực tiếp theo tiêu chí.

## Một số endpoint chính

### Xác thực

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Quản trị tài khoản

- `GET /api/admin/users`
- `POST /api/admin/approveUser/{userId}`
- `POST /api/admin/rejectUser/{userId}`
- `POST /api/admin/create-staff-account`

### Sự kiện, hạng mục, vòng thi

- `GET /api/events`
- `POST /api/events`
- `GET /api/tracks?eventId=...`
- `POST /api/tracks`
- `GET /api/rounds?eventId=...`
- `POST /api/rounds`
- `GET /api/events/{eventId}/standings`

### Đội thi và bài nộp

- `GET /api/teams?eventId=...`
- `POST /api/teams`
- `PATCH /api/teams/{teamId}/status`
- `GET /api/team-members/{teamId}`
- `POST /api/team-members`
- `GET /api/submissions?roundId=...`
- `POST /api/submissions`
- `POST /api/submissions/{submissionId}/eliminate`

### Chấm điểm và xếp hạng

- `POST /api/judge-assignments`
- `GET /api/judge-assignments`
- `POST /api/scores`
- `GET /api/rankings/round?roundId=...`
- `GET /api/rankings/advance?roundId=...`
- `POST /api/rounds/{roundId}/evaluate-elimination`

### RBL / nghiên cứu

- `GET /api/research/event/{eventId}/judge-scores`
- `GET /api/research/event/{eventId}/judge-scores.csv`
- `GET /api/research/event/{eventId}/judge-variance`
- `GET /api/research/round/{roundId}/calibration-distribution`


## Nâng cấp RBL mới

- Bổ sung endpoint `GET /api/research/event/{eventId}/reliability-summary` để hiển thị thống kê độ tin cậy liên đánh giá viên.
- Dashboard RBL hiển thị ICC one-way xấp xỉ, Krippendorff’s alpha xấp xỉ, biên độ điểm trung bình, độ lệch giữa giám khảo nội bộ và giám khảo khách mời.
- File CSV RBL đã bổ sung trường `judgeType` để phục vụ câu hỏi nghiên cứu về sự khác biệt giữa SE Faculty/Judge và Guest Judge.
- Bổ sung tài liệu `Docs/DEFENSE_GUIDE_SEAL.md` để nhóm dùng khi demo/bảo vệ đề tài.

## Chủ đề RBL phù hợp với hệ thống

**Độ tin cậy liên đánh giá viên trong chấm điểm Hackathon ngành Kỹ thuật Phần mềm.**

Hệ thống lưu riêng điểm từng giám khảo theo từng tiêu chí, hỗ trợ vòng hiệu chuẩn, xuất dữ liệu CSV đã ẩn danh và hiển thị phương sai điểm để phân tích tính nhất quán trong đánh giá.

## Ghi chú nâng cấp mới

- Trang đăng nhập đã bỏ email/mật khẩu điền sẵn và bỏ ghi chú tài khoản mặc định dưới form.
- Bổ sung luồng quên mật khẩu gồm 2 bước: tạo mã đặt lại và đặt mật khẩu mới. Trong bản demo, mã được trả về trên giao diện để dễ trình bày; khi triển khai thật cần gửi mã qua email/SMTP và không trả mã trong response.
- Khi duyệt đội, backend kiểm tra đội phải có từ 3 đến 5 thành viên theo yêu cầu đề tài.
- Dashboard có thêm các thao tác bám sát nghiệp vụ SEAL: phân công mentor cho hạng mục, thêm thành viên vào đội, chấm điểm bài nộp theo tiêu chí.
