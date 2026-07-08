import type { EventSeason, EventStatus } from '@/types/event';
import type { TeamStatus } from '@/types/team';
import type { UserRole } from '@/types/user';

export const ROLE_LABELS: Record<string, string> = {
    EventCoordinator: 'Ban tổ chức',
    TeamMember: 'Thành viên đội',
    Mentor: 'Mentor',
    Judge: 'Giám khảo',
    GuestJudge: 'Giám khảo khách mời'
};

export function viRole(role?: UserRole | null): string {
    return role ? ROLE_LABELS[String(role)] || String(role) : '-';
}

export function viStatus(status?: EventStatus | TeamStatus | null): string {
    const map: Record<string, string> = {
        Draft: 'Bản nháp',
        Open: 'Đang mở',
        Closed: 'Đã đóng',
        Approved: 'Đã duyệt',
        Pending: 'Chờ duyệt',
        Rejected: 'Từ chối'
    };
    return status ? map[String(status)] || String(status) : '-';
}

export function seasonVi(season?: EventSeason | null): string {
    const map: Record<string, string> = {
        Spring: 'Mùa Xuân',
        Summer: 'Mùa Hè',
        Fall: 'Mùa Thu'
    };
    return season ? map[String(season)] || String(season) : '-';
}