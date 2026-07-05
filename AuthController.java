@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AppUserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        AppUser user = userRepository
                .findByEmail(request.email().trim().toLowerCase())
                .orElse(null);

        if (user == null ||
            !passwordEncoder.matches(request.password(), user.passwordHash)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiError.of("SE40101",
                    "Email hoặc mật khẩu không đúng"));
        }

        return ResponseEntity.ok(
                new LoginResponse(
                        jwtUtil.generateToken(user),
                        user.email,
                        user.roleName,
                        user.userId,
                        user.fullName,
                        user.isApproved
                )
        );
    }
}