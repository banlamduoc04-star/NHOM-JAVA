'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import DashboardCard from '@/components/card/DashboardCard';
import Loading from '@/components/common/Loading';
import DataTable from '@/components/table/DataTable';

import { useTeamContext } from '@/contexts/TeamContext';

import useAuth from '@/hooks/useAuth';

import { getEvents, getEventStandings } from '@/services/eventService';
import { getRoundRanking } from '@/services/rankingService';
import { getRounds } from '@/services/roundService';
import { getSubmissions } from '@/services/submissionService';
import { getTeams } from '@/services/teamService';
import { getTracks } from '@/services/trackService';

import { formatNumber } from '@/utils/formatDate';
import { isAdminRole, roleOf } from '@/utils/rbac';

export default function DashboardPage() {
    const { user } = useAuth() as any;

    const role = roleOf(user);

    const {
        memberState,
        myTeams,
        pendingRequests,
        isLeader,
        teamVersion,
        refreshTeamState
    } = useTeamContext();

    const [data, setData] = useState<any>({
        loading: true,
        events: [],
        tracks: [],
        rounds: [],
        teams: [],
        submissions: [],
        standings: {},
        ranking: [],
        message: ''
    });

    async function load() {
        try {
            const events = await getEvents();

            const eventId = events?.[0]?.eventId;

            const [
                tracks,
                rounds,
                teams,
                submissions,
                standings
            ] = await Promise.all([
                eventId ? getTracks(eventId) : [],
                eventId ? getRounds(eventId) : [],
                eventId ? getTeams({ eventId }) : [],
                getSubmissions({}),
                eventId ? getEventStandings(eventId) : {}
            ]);

            const latestRoundId =
                rounds?.[rounds.length - 1]?.roundId;

            const ranking = latestRoundId
                ? await getRoundRanking(latestRoundId)
                : [];

            setData({
                loading: false,
                events,
                tracks,
                rounds,
                teams,
                submissions,
                standings,
                ranking,
                message: ''
            });
        } catch (err: any) {
            setData((old: any) => ({
                ...old,
                loading: false,
                message: err.message
            }));
        }
    }

    useEffect(() => {
        load();
    }, [teamVersion]);

    if (data.loading) {
        return <Loading />;
    }

    if (role === 'TeamMember') {
        return (
            <section className="grid">
                {data.message && (
                    <div className="notice error">
                        {data.message}
                    </div>
                )}

                <div className="page-title">
                    <div>
                        <h2>
                            {isLeader
                                ? 'Dashboard Leader'
                                : 'Dashboard Member'}
                        </h2>
                    </div>

                    <button
                        className="compact-button"
                        onClick={() => {
                            refreshTeamState();
                            load();
                        }}
                    >
                        Làm mới
                    </button>
                </div>

                <div className="grid grid-4">
                    <DashboardCard
                        label="Member state"
                        value={memberState}
                    />

                    <DashboardCard
                        label="Team của tôi"
                        value={myTeams.length}
                        note={
                            myTeams[0]?.teamName ||
                            'Chưa vào đội'
                        }
                    />

                    <DashboardCard
                        label="Pending request"
                        value={pendingRequests.length}
                        note="Yêu cầu đang chờ Leader duyệt"
                    />

                    <DashboardCard
                        label="Submission xem được"
                        value={data.submissions.length}
                        note="Theo quyền hiện tại"
                    />
                </div>

                {isLeader ? (
                    <section className="grid grid-3">
                        <Link
                            className="card action-card"
                            href="/dashboard/teams"
                        >
                            <h2>Pending requests</h2>
                            <p className="muted">
                                Duyệt hoặc từ chối yêu cầu tham gia
                                đội.
                            </p>
                        </Link>

                        <Link
                            className="card action-card"
                            href="/dashboard/teams"
                        >
                            <h2>Manage members</h2>
                            <p className="muted">
                                Xem và quản lý thành viên trong đội.
                            </p>
                        </Link>

                        <Link
                            className="card action-card"
                            href="/dashboard/submissions"
                        >
                            <h2>Submit project</h2>
                            <p className="muted">
                                Nộp hoặc cập nhật
                                repo/demo/report cho vòng thi.
                            </p>
                        </Link>
                    </section>
                ) : (
                    <section className="grid grid-2">
                        <Link
                            className="card action-card"
                            href="/dashboard/teams"
                        >
                            <h2>View team</h2>
                            <p className="muted">
                                Xem đội hiện tại hoặc gửi/hủy yêu cầu
                                tham gia đội.
                            </p>
                        </Link>

                        <Link
                            className="card action-card"
                            href="/dashboard/submissions"
                        >
                            <h2>View submission</h2>
                            <p className="muted">
                                Xem bài nộp của đội. Nút Submit/Edit
                                chỉ hiển thị với Leader.
                            </p>
                        </Link>
                    </section>
                )}

                <section className="card">
                    <div className="section-title">
                        <h2>Bài nộp có thể xem</h2>
                        <span>{data.submissions.length} bài</span>
                    </div>

                    <DataTable
                        columns={[
                            {
                                title: 'ID',
                                key: 'submissionId'
                            },
                            {
                                title: 'Team ID',
                                key: 'teamId'
                            },
                            {
                                title: 'Round ID',
                                key: 'roundId'
                            },
                            {
                                title: 'Trạng thái',
                                render: (r) => (
                                    <span className="table-badge">
                                        {r.isEliminated
                                            ? 'Đã loại'
                                            : 'Hợp lệ'}
                                    </span>
                                )
                            }
                        ]}
                        data={data.submissions.slice(0, 10)}
                        rowKey="submissionId"
                    />
                </section>
            </section>
        );
    }

    return (
        <section className="grid">
            {data.message && (
                <div className="notice error">
                    {data.message}
                </div>
            )}

            <div className="page-title">
                <div>
                    <h2>Tổng quan</h2>

                    <p className="muted">
                        Các số liệu chính của hệ thống SEAL
                        Hackathon.
                    </p>
                </div>

                {isAdminRole(role) && (
                    <Link
                        className="button-link"
                        href="/dashboard/events/create"
                    >
                        Tạo sự kiện
                    </Link>
                )}
            </div>

            <div className="grid grid-4">
                <DashboardCard
                    label="Sự kiện"
                    value={data.events.length}
                    note="Tổng số event"
                />

                <DashboardCard
                    label="Hạng mục"
                    value={data.tracks.length}
                    note="Track theo event"
                />

                <DashboardCard
                    label="Vòng thi"
                    value={data.rounds.length}
                    note="Round đang có"
                />

                <DashboardCard
                    label="Đội thi"
                    value={data.teams.length}
                    note={`${data.teams.filter(
                        (t: any) => t.status === 'Approved'
                    ).length} đội đã duyệt`}
                />
            </div>

            <section className="card">
                <div className="section-title">
                    <h2>Xếp hạng mới nhất</h2>
                    <span>{data.ranking.length} đội</span>
                </div>

                <DataTable
                    columns={[
                        {
                            title: 'Hạng',
                            key: 'rankNo'
                        },
                        {
                            title: 'Đội',
                            key: 'teamName'
                        },
                        {
                            title: 'Track ID',
                            key: 'trackId'
                        },
                        {
                            title: 'Average',
                            render: (r) =>
                                formatNumber(r.averageScore)
                        },
                        {
                            title: 'Final',
                            render: (r) =>
                                formatNumber(r.finalScore)
                        }
                    ]}
                    data={data.ranking.slice(0, 10)}
                    rowKey={(r) =>
                        `${r.teamId}-${r.rankNo}`
                    }
                />
            </section>
        </section>
    );
}