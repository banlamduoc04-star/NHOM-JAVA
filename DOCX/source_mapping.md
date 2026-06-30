# Bảng đối chiếu mã nguồn

Tài liệu này mô tả nhanh cách các module nghiệp vụ của SEAL được tổ chức trong bản Spring Boot + Next.js.

| Nhóm chức năng | Backend Spring Boot | Frontend Next.js |
|---|---|---|
| Xác thực, đăng ký, đăng nhập JWT | `controller/AuthController.java` | `app/page.tsx`, `lib/api.ts` |
| Phê duyệt tài khoản và tạo tài khoản nhân sự | `controller/AdminController.java` | `app/dashboard/page.tsx` |
| Quản lý sự kiện | `controller/EventsController.java`, `controller/EventDashboardController.java` | `app/dashboard/page.tsx` |
| Quản lý vòng thi, xét thăng vòng Top N | `controller/RoundsController.java`, `controller/RoundEvaluationController.java`, `service/RankingService.java` | `app/dashboard/page.tsx` |
| Quản lý hạng mục thi đấu | `controller/TracksController.java` | `app/dashboard/page.tsx` |
| Quản lý đội thi và thành viên | `controller/TeamsController.java`, `controller/TeamMembersController.java` | `app/dashboard/page.tsx` |
| Nộp bài và loại bài vi phạm | `controller/SubmissionsController.java` | `app/dashboard/page.tsx` |
| Phân công giám khảo | `controller/JudgeAssignmentsController.java` | `app/dashboard/page.tsx` |
| Chấm điểm theo tiêu chí | `controller/ScoresController.java` | API phục vụ dashboard/chấm điểm |
| Mẫu tiêu chí và tiêu chí sự kiện | `controller/CriterionTemplatesController.java`, `controller/EventCriteriaController.java` | `app/dashboard/page.tsx` |
| Mentor theo hạng mục | `controller/TrackMentorsController.java`, `controller/MentorController.java` | API phục vụ dashboard mentor |
| Xếp hạng và kết quả vòng thi | `controller/RankingsController.java`, `controller/RoundResultsController.java`, `service/RankingService.java` | `app/dashboard/page.tsx` |
| Giải thưởng | `controller/PrizesController.java` | `app/dashboard/page.tsx` |
| Thông báo | `controller/AnnouncementsController.java` | `app/dashboard/page.tsx` |
| Nhật ký kiểm tra | `controller/AuditLogsController.java`, `service/AuditService.java` | `app/dashboard/page.tsx` |
| Dữ liệu nghiên cứu RBL, CSV ẩn danh, phương sai, ICC/Krippendorff alpha xấp xỉ | `controller/ResearchDataController.java` | `app/dashboard/page.tsx` |

## Ghi chú nghiệp vụ

- `RankingService.java` tính điểm tổng hợp theo trọng số tiêu chí và xếp hạng đội theo vòng/hạng mục.
- Điểm của từng giám khảo được lưu riêng trong bảng `scores`, không gộp chung, nhằm phục vụ phân tích độ tin cậy liên đánh giá viên.
- Các hành động nhạy cảm như loại bài, duyệt tài khoản và cập nhật điểm được ghi vào `audit_logs` để tăng minh bạch.

- `ResearchDataController.java` đã bổ sung endpoint `/api/research/event/{eventId}/reliability-summary` để hỗ trợ bảo vệ RBL: ICC one-way xấp xỉ, Krippendorff alpha xấp xỉ, thống kê theo tiêu chí và so sánh loại giám khảo.
