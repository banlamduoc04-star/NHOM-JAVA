# TV: Hệ thống quản lý cuộc thi SEAL Hackathon ngành Kỹ thuật Phần mềm
# TA: SEAL – Software Engineering Hackathon Management System

**Mã đề tài:** SU26SWP04

## Công nghệ bắt buộc

- Ứng dụng web
- Backend: Java Spring Boot
- Frontend: React/Next.js

## Bối cảnh

Software Engineering Agile League (SEAL) là cuộc thi hackathon học thuật thường niên do Khoa Kỹ thuật Phần mềm phối hợp với PDP tổ chức tại Trường Đại học FPT TP.HCM. Mỗi năm, SEAL có thể tổ chức ba đợt hackathon: Spring, Summer và Fall. Mỗi sự kiện có thể gồm nhiều vòng thi như vòng sơ khảo, vòng chung kết và vòng hiệu chuẩn giám khảo.

Cuộc thi mở cho nhiều trường đại học tham gia. Đội thi có thể gồm toàn sinh viên FPT, sinh viên ngoài trường hoặc đội hỗn hợp. Mỗi đội đăng ký vào một hạng mục thi đấu và nộp sản phẩm qua các đường dẫn như repository, demo, báo cáo hoặc slide.

## Vấn đề hiện tại

Quy trình tổ chức hiện nay chủ yếu thực hiện thủ công nên dễ phát sinh sai sót dữ liệu, chậm tổng hợp điểm và thiếu minh bạch. Việc chấm điểm qua nhiều file Excel riêng lẻ làm Ban tổ chức phải thu thập, nhập lại và tổng hợp kết quả thủ công. Ngoài ra, hệ thống liên lạc giữa Ban tổ chức, mentor, giám khảo và đội thi còn hạn chế; các quyết định chấm điểm hoặc loại bài chưa có nhật ký kiểm tra đầy đủ.

Bên cạnh việc quản lý cuộc thi, hệ thống còn phục vụ nghiên cứu về độ tin cậy liên đánh giá viên trong chấm điểm hackathon, một yếu tố quan trọng đối với tính công bằng trong đánh giá kỹ thuật phần mềm.

## Tác nhân chính

- Thành viên đội thi
- Trưởng nhóm
- Mentor
- Giám khảo nội bộ
- Giám khảo khách mời
- Ban tổ chức / Điều phối viên sự kiện

## Chức năng chính

- Đăng ký tài khoản và đăng nhập bằng JWT.
- Phân loại sinh viên FPT và sinh viên ngoài trường khi đăng ký.
- Ban tổ chức phê duyệt tài khoản trước khi tham gia thi.
- Tạo và quản lý sự kiện SEAL theo mùa Spring/Summer/Fall.
- Cấu hình nhiều vòng thi trong một sự kiện.
- Thiết lập hạn nộp bài, tiêu chí chấm điểm, phân công giám khảo và quy tắc Top N thăng vòng.
- Quản lý hạng mục thi đấu trong từng sự kiện.
- Phân công mentor cho hạng mục.
- Thành lập đội thi từ 3 đến 5 thành viên.
- Nộp bài theo vòng bằng URL repository, demo, báo cáo/slide.
- Chấm điểm theo tiêu chí và lưu riêng điểm từng giám khảo.
- Tự động tính xếp hạng theo vòng, hạng mục và toàn sự kiện.
- Loại đội hoặc bài nộp vi phạm quy chế, kèm lý do và nhật ký kiểm tra.
- Quản lý giải thưởng và công bố kết quả.
- Gửi thông báo đến người tham gia.
- Xuất báo cáo điểm, bảng xếp hạng và dữ liệu nghiên cứu CSV.
- Dashboard RBL hiển thị phương sai điểm giữa các giám khảo theo từng tiêu chí.

## Thực thể chính

- Hackathon Event: Sự kiện hackathon
- Track: Hạng mục thi đấu
- Round: Vòng thi trong sự kiện
- Team: Đội thi
- Team Member: Thành viên đội
- Mentor: Người hướng dẫn
- Judge: Giám khảo
- Submission: Bài nộp
- Score/Ranking: Điểm và xếp hạng
- Prize: Giải thưởng
- Audit Log: Nhật ký kiểm tra
- Announcement: Thông báo

## Chủ đề RBL

**Độ tin cậy liên đánh giá viên trong chấm điểm Hackathon ngành Kỹ thuật Phần mềm.**

## Câu hỏi nghiên cứu đề xuất

1. Mức độ nhất quán giữa các giám khảo khi đánh giá bài nộp SEAL theo từng tiêu chí là như thế nào?
2. Những tiêu chí nào có phương sai điểm cao nhất giữa các giám khảo?
3. Vòng hiệu chuẩn có giúp giảm chênh lệch điểm và cải thiện độ tin cậy liên đánh giá viên không?
4. Dữ liệu chấm điểm đã ẩn danh có thể hỗ trợ tính công bằng và minh bạch trong đánh giá hackathon kỹ thuật phần mềm như thế nào?
