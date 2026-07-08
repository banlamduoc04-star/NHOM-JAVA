package com.seal.hackathon.controller;

// Import ResourceNotFoundException.
// Dùng để báo lỗi khi không tìm thấy dữ liệu cần thiết.
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seal.hackathon.config.GlobalExceptionHandler.ResourceNotFoundException;
import com.seal.hackathon.dto.CommonDtos.*;
import com.seal.hackathon.dto.CommonDtos.CreateEventRequest;
import com.seal.hackathon.dto.CommonDtos.UpdateEventRequest;
import com.seal.hackathon.entity.HackathonEvent;
import com.seal.hackathon.repository.HackathonEventRepository;
import com.seal.hackathon.security.SecurityUtil;
import com.seal.hackathon.service.AuditService;

import jakarta.validation.Valid;


// Đánh dấu class này là một REST Controller.
@RestController

// Khai báo đường dẫn chung cho toàn bộ API trong Controller.
//
// Ví dụ:
// GET  /api/events
// GET  /api/events/1
// POST /api/events
@RequestMapping("/api/events")

// Khai báo class EventsController.
// Controller này quản lý các API liên quan đến sự kiện Hackathon.
public class EventsController {


    // Repository dùng để thao tác với dữ liệu HackathonEvent.
    private final HackathonEventRepository events;


    // Service dùng để ghi lịch sử thao tác.
    private final AuditService audit;


    // Constructor Injection.
    // Spring sẽ tự động truyền HackathonEventRepository
    // và AuditService vào Controller.
    public EventsController(
            HackathonEventRepository events,
            AuditService audit
    ) {

        // Gán repository được Spring truyền vào
        // cho biến events.
        this.events = events;

        // Gán AuditService được Spring truyền vào
        // cho biến audit.
        this.audit = audit;
    }


    // API GET:
    // GET /api/events
    //
    // Dùng để lấy toàn bộ danh sách sự kiện.
    @GetMapping

    // Method trả về List<HackathonEvent>.
    public List<HackathonEvent> getEvents() {

        // Gọi findAll() của JpaRepository
        // để lấy toàn bộ sự kiện trong database.
        return events.findAll();
    }


    // API GET:
    // GET /api/events/{eventId}
    //
    // Dùng để tìm một sự kiện theo ID.
    @GetMapping("/{eventId}")

    // Method trả về một HackathonEvent.
    public HackathonEvent getEventById(

            // Lấy eventId từ đường dẫn URL.
            @PathVariable Integer eventId
    ) {

        // Tìm sự kiện theo eventId.
        return events.findById(eventId)

                // Nếu không tìm thấy sự kiện,
                // ném ResourceNotFoundException.
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Không tìm thấy sự kiện"
                        )
                );
    }


    // API POST:
    // POST /api/events
    //
    // Dùng để tạo một sự kiện Hackathon mới.
    @PostMapping

    // Chỉ người có role EventCoordinator
    // mới được phép tạo sự kiện.
    @PreAuthorize("hasRole('EventCoordinator')")

    // Method tạo sự kiện mới.
    public HackathonEvent createEvent(

            // @RequestBody:
            // nhận dữ liệu JSON từ request.
            //
            // @Valid:
            // kiểm tra dữ liệu theo validation trong CreateEventRequest.
            @Valid @RequestBody CreateEventRequest request
    ) {

        // Tạo một đối tượng HackathonEvent mới trong bộ nhớ.
        HackathonEvent e = new HackathonEvent();


        // Gán tên sự kiện từ request.
        e.eventName = request.eventName();

        // Gán mùa tổ chức từ request.
        e.season = request.season();

        // Gán năm tổ chức từ request.
        e.eventYear = request.eventYear();


        // Gán ngày bắt đầu sự kiện.
        e.startDate = request.startDate();

        // Gán ngày kết thúc sự kiện.
        e.endDate = request.endDate();

        // Gán trạng thái sự kiện bằng toán tử 3 ngôi.
        //
        // Nếu request.status() == null:
        // dùng giá trị mặc định "Draft".
        //
        // Nếu khác null:
        // sử dụng trạng thái được gửi lên.
        e.status = request.status() == null
                ? "Draft"
                : request.status();


        // Gán mô tả sự kiện.
        e.description = request.description();

        // Lấy ID của người đang đăng nhập
        // và gán làm người tạo sự kiện.
        e.createdBy = SecurityUtil.currentUserId();


        // Lưu sự kiện mới xuống database.
        HackathonEvent saved = events.save(e);


        // Ghi lại lịch sử tạo sự kiện.
        audit.log(

                // ID người đang thực hiện thao tác.
                SecurityUtil.currentUserId(),

                // Tên hành động.
                "CREATE_EVENT",

                // Loại đối tượng bị tác động.
                "HackathonEvent",

                // ID của sự kiện vừa được tạo.
                saved.eventId,

                // Giá trị cũ không có vì đây là thao tác tạo mới.
                null,

                // Giá trị mới được ghi vào log là tên sự kiện.
                saved.eventName
        );


        // Trả về sự kiện sau khi lưu.
        return saved;
    }


    // API PUT:
    // PUT /api/events/{eventId}
    //
    // Dùng để cập nhật thông tin sự kiện.
    @PutMapping("/{eventId}")

    // Chỉ người có role EventCoordinator
    // mới được phép cập nhật sự kiện.
    @PreAuthorize("hasRole('EventCoordinator')")

    // Method cập nhật một HackathonEvent.
    public HackathonEvent updateEvent(

            // Lấy eventId từ đường dẫn URL.
            @PathVariable Integer eventId,

            // Nhận dữ liệu cập nhật từ body request.
            @RequestBody UpdateEventRequest request
    ) {

        // Gọi method getEventById()
        // để lấy sự kiện hiện tại theo eventId.
        //
        // Nếu không tìm thấy,
        // getEventById() sẽ ném ResourceNotFoundException.
        HackathonEvent e = getEventById(eventId);


        // Nếu eventName được gửi lên
        // thì cập nhật tên sự kiện.
        if (request.eventName() != null) {
            e.eventName = request.eventName();
        }


        // Nếu season được gửi lên
        // thì cập nhật mùa tổ chức.
        if (request.season() != null) {
            e.season = request.season();
        }


        // Nếu eventYear được gửi lên
        // thì cập nhật năm tổ chức.
        if (request.eventYear() != null) {
            e.eventYear = request.eventYear();
        }


        // Nếu startDate được gửi lên
        // thì cập nhật ngày bắt đầu.
        if (request.startDate() != null) {
            e.startDate = request.startDate();
        }


        // Nếu endDate được gửi lên
        // thì cập nhật ngày kết thúc.
        if (request.endDate() != null) {
            e.endDate = request.endDate();
        }


        // Nếu status được gửi lên
        // thì cập nhật trạng thái sự kiện.
        if (request.status() != null) {
            e.status = request.status();
        }


        // Nếu description được gửi lên
        // thì cập nhật mô tả sự kiện.
        if (request.description() != null) {
            e.description = request.description();
        }


        // Lưu sự kiện đã cập nhật xuống database.
        HackathonEvent saved = events.save(e);


        // Ghi lại lịch sử cập nhật sự kiện.
        audit.log(

                // ID của người đang thực hiện thao tác.
                SecurityUtil.currentUserId(),

                // Tên hành động.
                "UPDATE_EVENT",

                // Loại đối tượng bị tác động.
                "HackathonEvent",

                // ID của sự kiện vừa cập nhật.
                saved.eventId,

                // Giá trị cũ không được truyền vào.
                null,

                // Giá trị mới lưu trong log là tên sự kiện.
                saved.eventName
        );


        // Trả về sự kiện sau khi cập nhật.
        return saved;
    }
}