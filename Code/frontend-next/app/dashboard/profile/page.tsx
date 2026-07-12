'use client';

import { useEffect, useState } from 'react';

import useAuth from '@/hooks/useAuth';
import { viRole } from '@/constants/role';
import { getMyTeams } from '@/services/teamService';
import { roleOf, userIdOf } from '@/utils/rbac';
import { formatDate } from '@/utils/formatDate';


export default function ProfilePage() {

    const { user, logout } = useAuth() as any;


    const [teamName, setTeamName] =
        useState('-');

    const [teamRole, setTeamRole] =
        useState('-');


    useEffect(() => {

        getMyTeams()

            .then((teams: any[]) => {

                const team = teams?.[0];


                if (!team) {
                    return;
                }


                setTeamName(
                    team.teamName || '-'
                );


                setTeamRole(
                    Number(team.leaderId) === userIdOf(user)
                        ? 'Leader'
                        : 'Member'
                );

            })

            .catch(() => {});

    }, [user?.userId]);


    const approved =
        user?.isApproved ?? user?.approved;


    const avatar =
        user?.fullName?.charAt(0)?.toUpperCase()
        || 'U';


    return (
        <section className="grid">


            <div className="page-title">

                <div>

                    <h2>
                        Hồ sơ
                    </h2>


                    <p className="muted">
                        Thông tin tài khoản đang đăng nhập.
                    </p>

                </div>


                <button
                    className="secondary"
                    onClick={logout}
                >
                    Đăng xuất
                </button>

            </div>


            <section className="profile-card card">


                <div className="profile-header">


                    <div className="profile-avatar">
                        {avatar}
                    </div>


                    <div>

                        <h2>
                            {user?.fullName || 'Người dùng'}
                        </h2>


                        <p className="muted">
                            {user?.email || '-'}
                        </p>

                    </div>

                </div>


                <div className="profile-grid">


                    <div>
                        <span>
                            Email
                        </span>

                        <strong>
                            {user?.email || '-'}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Vai trò hệ thống
                        </span>

                        <strong>
                            {viRole(roleOf(user))}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Trạng thái
                        </span>

                        <strong>
                            {approved ? 'Approved' : 'Pending'}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Ngày tham gia
                        </span>

                        <strong>
                            {formatDate(user?.createdAt as any) || '-'}
                        </strong>
                    </div>


                    <div>
                        <span>
                            ID người dùng
                        </span>

                        <strong>
                            {user?.userId || user?.id || '-'}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Tên đội
                        </span>

                        <strong>
                            {teamName}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Vai trò trong Team
                        </span>

                        <strong>
                            {teamRole}
                        </strong>
                    </div>


                </div>


                <div className="inline-actions soft-gap">


                    <button
                        className="secondary"
                        type="button"
                        disabled
                    >
                        Edit Profile
                    </button>


                    <button
                        className="secondary"
                        type="button"
                        disabled
                    >
                        Change Password
                    </button>


                </div>


            </section>


        </section>
    );
}