import type {
    AuthSession,
    MessageResponse,
    PasswordResetRequestResponse,
    RegisterPayload
} from '@/types/user';

const users: AuthSession[] = [
    {
        token: "token-1",
        userId: "1",
        email: "admin@seal.com",
        fullName: "Event Coordinator",
        role: "EventCoordinator",
        approved: true
    },
    {
        token: "token-2",
        userId: "2",
        email: "mentor@seal.com",
        fullName: "Mentor User",
        role: "Mentor",
        approved: true
    },
    {
        token: "token-3",
        userId: "3",
        email: "judge@seal.com",
        fullName: "Judge User",
        role: "Judge",
        approved: true
    },
    {
        token: "token-4",
        userId: "4",
        email: "member@seal.com",
        fullName: "Team Member",
        role: "TeamMember",
        approved: true
    }
];

export const login = async (
    email: string,
    password: string
): Promise<AuthSession> => {

    await new Promise(resolve => setTimeout(resolve, 500));

    const user = users.find(
        u => u.email === email && password === "123456"
    );

    if (!user) {
        throw new Error("Sai email hoặc mật khẩu");
    }

    return user;
};

export const register = async (
    payload: RegisterPayload
): Promise<MessageResponse> => {
    return { message: "Đăng ký thành công" };
};

export const requestPasswordReset = async (
    email: string
): Promise<PasswordResetRequestResponse> => {
    return {
        message: "Đã gửi email",
        resetCodeForDemo: "123456"
    };
};

export const resetPassword = async (): Promise<MessageResponse> => {
    return {
        message: "Đổi mật khẩu thành công"
    };
};