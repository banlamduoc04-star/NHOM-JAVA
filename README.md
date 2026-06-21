🔗 ĐỀ TÀI.<br>
 # 🚀 SEAL – Software Engineering Hackathon Management System
 (🎯Hệ thống quản lý cuộc thi SEAL Hackathon ngành Kỹ thuật Phần mềm).
 ----------------------------------------------------------                
📖 Giới thiệu
SEAL (Software Engineering Agile League) là hệ thống quản lý cuộc thi Hackathon được xây dựng nhằm hỗ trợ Ban tổ chức quản lý toàn bộ quy trình tổ chức cuộc thi từ đăng ký tham gia, quản lý đội thi, quản lý vòng thi, nộp bài dự thi, chấm điểm, xếp hạng đến công bố kết quả.
---------------------------------------------------------- 
🎯 Mục tiêu dự án
• Tự động hóa quy trình tổ chức Hackathon
• Quản lý đội thi và thành viên
• Quản lý Mentor và Judge
• Quản lý vòng thi
• Chấm điểm minh bạch
• Xếp hạng tự động
• Công bố kết quả nhanh chóng
---------------------------------------------------------- 
👥 Actor của hệ thống
Actor	                                      Vai trò
👨‍💼 Event Coordinator	                         Quản lý toàn bộ cuộc thi
👨‍👩‍👧 Team Leader	                               Quản lý đội thi
👤 Team Member	                               Thành viên đội thi
🎓 Mentor                                    	Hỗ trợ chuyên môn
🏅 Judge	                                     Chấm điểm và đánh giá
---------------------------------------------------------- 
⚙️ Chức năng chính
🔐 Authentication & Security
• Đăng ký tài khoản
• Đăng nhập
• JWT Authentication
• Phân quyền người dùng

📅 Event Management
• Tạo cuộc thi
• Cập nhật thông tin cuộc thi
• Quản lý trạng thái

🏷️ Track Management
• Quản lý chủ đề thi đấu
• Phân loại hạng mục

👨‍👩‍👧‍👦 Team Management
• Đăng ký đội
• Quản lý thành viên
• Theo dõi đội thi

📤 Submission Management
• Nộp bài dự thi
• Cập nhật bài nộp
• Lưu lịch sử nộp bài

📝 Scoring System
• Tạo tiêu chí chấm điểm
• Chấm điểm dự án
• Nhận xét bài dự thi

🏆 Ranking System
• Xếp hạng tự động
• Công bố kết quả
• Thống kê điểm số

🎁 Prize Management
• Quản lý giải thưởng
• Công bố giải thưởng

📊 Report & Export
• Xuất báo cáo
• Xuất bảng điểm
• Xuất kết quả cuộc thi 
• Công bố kết quả
---------------------------------------------------------- 
📁 Cấu trúc thư mục
seal-hackathon-management/
│
├── src/main/java/com/seal/hackathon/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   ├── security/
│   └── service/
│
├── src/main/resources/
│   ├── application.yml
│   └── application-sqlserver.yml
│
├── pom.xml
├── README.md
└── DOCX/
----------------------------------------------------------
🛠️ Công nghệ sử dụng
☕ Java 17
🌱 Spring Boot
🔒 Spring Security + JWT
🗄️ Spring Data JPA
📚 Swagger OpenAPI
📦 Maven
