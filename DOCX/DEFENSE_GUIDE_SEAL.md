# Gợi ý bảo vệ đề tài SU26SWP04 - SEAL Hackathon Management System

## 1. Kết luận về mức độ đúng đề tài

Đề tài hiện tại đi đúng yêu cầu SU26SWP04 vì hệ thống không chỉ quản lý một cuộc thi hackathon thông thường mà còn bám đúng bối cảnh SEAL của ngành Kỹ thuật Phần mềm: mỗi năm có nhiều mùa Spring/Summer/Fall, mỗi sự kiện có nhiều vòng thi, nhiều hạng mục, đội thi có thể đến từ FPT hoặc trường đối tác, và kết quả được chấm bởi nhiều loại giám khảo.

Điểm mạnh để bảo vệ là hệ thống xử lý được hai lớp mục tiêu:

1. Mục tiêu nghiệp vụ: số hóa quy trình đăng ký, duyệt tài khoản, lập đội, nộp bài, phân công mentor/giám khảo, chấm điểm, xếp hạng, xét thăng vòng, loại bài vi phạm, trao giải và thông báo.
2. Mục tiêu nghiên cứu RBL: lưu riêng điểm của từng giám khảo theo từng tiêu chí, xuất dữ liệu ẩn danh và hỗ trợ quan sát mức độ nhất quán giữa các giám khảo.

## 2. Bảng mapping yêu cầu đề tài và phần đã có trong hệ thống

| Yêu cầu đề tài | Trạng thái | Module/API chính |
|---|---:|---|
| Quản lý sự kiện SEAL theo mùa | Đã có | EventsController, Dashboard |
| Nhiều vòng thi trong mỗi sự kiện | Đã có | RoundsController |
| Cấu hình hạn nộp bài, Top N thăng vòng | Đã có | RoundsController, RankingService |
| Quản lý hạng mục thi đấu | Đã có | TracksController |
| Phân công mentor theo hạng mục | Đã có | TrackMentorsController |
| Đăng ký tài khoản, JWT, duyệt tài khoản | Đã có | AuthController, AdminController |
| Phân loại sinh viên FPT/sinh viên ngoài trường | Đã có | AuthController, AppUser |
| Đội thi 3-5 thành viên | Đã có kiểm tra khi duyệt đội | TeamsController, TeamMembersController |
| Nộp repository/demo/report URL theo vòng | Đã có | SubmissionsController |
| Chấm điểm theo tiêu chí, lưu riêng từng giám khảo | Đã có | ScoresController |
| Phân công giám khảo nội bộ/khách mời | Đã có | JudgeAssignmentsController |
| Tự động xếp hạng và xét thăng vòng | Đã có | RankingService |
| Loại bài/đội vi phạm kèm lý do | Đã có | SubmissionsController |
| Nhật ký kiểm tra | Đã có | AuditService, AuditLogsController |
| Xuất CSV dữ liệu RBL ẩn danh | Đã có | ResearchDataController |
| Dashboard phương sai điểm | Đã có | Dashboard RBL |
| ICC/Krippendorff’s alpha | Đã bổ sung xấp xỉ | /api/research/event/{eventId}/reliability-summary |
| So sánh giám khảo nội bộ và khách mời | Đã bổ sung thống kê nền | reliability-summary |
| GitHub/GitLab metadata | Optional, chưa bắt buộc | Có thể nêu là hướng mở rộng |

## 3. Cách trình bày khi hội đồng hỏi “hệ thống khác gì CRUD?”

Hệ thống không chỉ CRUD vì có các nghiệp vụ tính toán và kiểm soát minh bạch:

- Tính điểm tổng hợp dựa trên nhiều tiêu chí có trọng số.
- Lưu riêng từng điểm theo giám khảo để tránh mất dữ liệu gốc.
- Tính xếp hạng theo vòng và theo hạng mục.
- Áp dụng quy tắc Top N để xác định đội thăng vòng.
- Kiểm tra điều kiện đội có 3-5 thành viên trước khi duyệt.
- Ghi audit log cho thao tác nhạy cảm như chấm điểm, duyệt/từ chối, loại bài.
- Xuất dataset ẩn danh phục vụ phân tích nghiên cứu.
- Có dashboard RBL thể hiện phương sai, ICC/Krippendorff alpha xấp xỉ và chênh lệch giữa nhóm giám khảo.

## 4. Cách bảo vệ phần RBL

Câu nói nên dùng:

> Điểm mới của đề tài là hệ thống không chỉ phục vụ tổ chức cuộc thi mà còn biến quá trình chấm điểm thành dữ liệu nghiên cứu. Thay vì chỉ lưu điểm cuối cùng của đội, hệ thống lưu từng điểm thành phần theo giám khảo, tiêu chí, vòng thi và bài nộp. Nhờ đó, ban tổ chức có thể đánh giá độ nhất quán giữa các giám khảo, xác định tiêu chí nào có độ lệch cao, và cải thiện rubric hoặc tổ chức vòng hiệu chuẩn trước khi chấm chính thức.

Khi hỏi về ICC/Krippendorff’s alpha:

> Trong bản demo, hệ thống có endpoint tính xấp xỉ ICC one-way và Krippendorff’s alpha cho dữ liệu chấm điểm. Vì dữ liệu hackathon thực tế có thể không cân bằng, ví dụ mỗi bài có số giám khảo khác nhau, hệ thống vẫn ưu tiên xuất CSV ẩn danh để nhóm có thể phân tích sâu hơn bằng Python hoặc R trong báo cáo nghiên cứu chính thức.

## 5. Các chức năng nên nêu là giới hạn/hướng phát triển

- Tích hợp GitHub/GitLab API để tự động lấy metadata repository như số commit, ngôn ngữ, contributor, thời điểm cập nhật.
- Gửi email thật cho quên mật khẩu và thông báo thay vì trả reset code demo trên giao diện.
- Phân quyền giao diện chi tiết hơn theo vai trò: Team Leader, Mentor, Judge, Event Coordinator.
- Tạo trang riêng cho giám khảo chỉ thấy bài được phân công.
- Tạo trang riêng cho đội thi chỉ thấy đội, vòng, hạn nộp và feedback của mình.
- Bổ sung biểu đồ trực quan cho phân bố điểm, heatmap độ lệch giám khảo và tiêu chí có độ bất đồng cao.
- Bổ sung import/export Excel cho ban tổ chức.
- Bổ sung notification realtime bằng WebSocket hoặc email.

## 6. Kịch bản demo ngắn

1. Đăng nhập bằng tài khoản Event Coordinator.
2. Mở dashboard và chọn sự kiện SEAL Summer 2026.
3. Tạo hoặc kiểm tra hạng mục thi đấu.
4. Tạo vòng thi và cấu hình Top N thăng vòng.
5. Kiểm tra tiêu chí chấm điểm và trọng số.
6. Duyệt tài khoản/đội thi đủ 3-5 thành viên.
7. Phân công giám khảo cho vòng và hạng mục.
8. Đăng nhập bằng tài khoản giám khảo và chấm điểm theo tiêu chí.
9. Quay lại Event Coordinator để tính xếp hạng, xét thăng vòng.
10. Mở khu vực RBL để xem phương sai, ICC/Krippendorff alpha và xuất CSV ẩn danh.

## 7. Câu trả lời mẫu cho câu hỏi phản biện

**Hỏi: Vì sao cần vòng hiệu chuẩn?**

Vì các tiêu chí như sáng tạo, thuyết trình hoặc tính khả thi có tính chủ quan cao. Vòng hiệu chuẩn giúp giám khảo cùng chấm bài mẫu, so sánh phân bố điểm và thống nhất cách hiểu rubric trước khi chấm chính thức.

**Hỏi: Vì sao phải lưu điểm từng giám khảo thay vì chỉ lưu điểm trung bình?**

Nếu chỉ lưu điểm trung bình thì không thể kiểm tra độ lệch giữa giám khảo. Lưu điểm gốc giúp truy vết, phân tích phương sai, tính độ tin cậy liên đánh giá viên và tăng tính minh bạch của kết quả.

**Hỏi: Hệ thống xử lý công bằng như thế nào?**

Hệ thống áp dụng cùng bộ tiêu chí và trọng số cho các đội trong cùng sự kiện, chỉ cho giám khảo được phân công chấm đúng vòng/hạng mục, ghi nhật ký thao tác chấm điểm và loại bài, đồng thời xuất dữ liệu ẩn danh để kiểm tra độ nhất quán.

**Hỏi: Nếu giám khảo khách mời chấm lệch so với giám khảo nội bộ thì sao?**

Dashboard RBL có thống kê chênh lệch điểm trung bình theo loại giám khảo. Nếu phát hiện khoảng cách lớn, ban tổ chức có thể điều chỉnh rubric, tổ chức hiệu chuẩn lại hoặc tăng số lượng giám khảo để giảm thiên lệch cá nhân.
