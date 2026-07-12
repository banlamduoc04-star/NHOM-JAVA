'use client';

import { useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import useAuth from '@/hooks/useAuth';
import { viRole } from '@/constants/role';
import {
    getUsers,
    createStaff,
    approveUser,
    rejectUser,
    getJudgeAssignments,
    getMyJudgeAssignments,
    assignJudge,
    removeJudgeAssignment,
} from '@/services/judgeService';
import { getEvents } from '@/services/eventService';
import { getTracks } from '@/services/trackService';
import { getRounds } from '@/services/roundService';
import { getTeams } from '@/services/teamService';
import { getSubmissions } from '@/services/submissionService';
import { getCriteria } from '@/services/criteriaService';
import { submitScore } from '@/services/scoreService';
import { isAdminRole, roleOf } from '@/utils/rbac';

export default function JudgesPage() {
    const { user } = useAuth() as any;
    const role = roleOf(user);
    const isAdmin = isAdminRole(role);

    const [users, setUsers] = useState<any[]>([]),
        [assignments, setAssignments] = useState<any[]>([]),
        [events, setEvents] = useState<any[]>([]),
        [tracks, setTracks] = useState<any[]>([]),
        [rounds, setRounds] = useState<any[]>([]),
        [teams, setTeams] = useState<any[]>([]),
        [subs, setSubs] = useState<any[]>([]),
        [criteria, setCriteria] = useState<any[]>([]);

    const [eventId, setEventId] = useState(''),
        [trackId, setTrackId] = useState(''),
        [roundId, setRoundId] = useState(''),
        [judgeId, setJudgeId] = useState(''),
        [submissionId, setSubmissionId] = useState(''),
        [criterionId, setCriterionId] = useState('');

    const [staff, setStaff] = useState<any>({
            fullName: '',
            email: '',
            password: '',
            roleName: 'GuestJudge',
            userType: 'Staff',
        }),
        [score, setScore] = useState<any>({
            scoreValue: '',
            comment: '',
        });

    const [message, setMessage] = useState(''),
        [loading, setLoading] = useState(true);

    const judges = users.filter((u) => u.roleName !== 'TeamMember');
    const pending = users.filter((u) => !u.isApproved);

    const name = (id: any) =>
        users.find((u) => String(u.userId) === String(id))?.fullName ||
        `#${id}`;

    const roundName = (id: any) =>
        rounds.find((r) => String(r.roundId) === String(id))?.roundName ||
        `#${id}`;

    const trackName = (id: any) =>
        tracks.find((t) => String(t.trackId) === String(id))?.trackName ||
        `#${id}`;

    const eventName = (id: any) =>
        events.find((e) => String(e.eventId) === String(id))?.eventName ||
        `#${id}`;

    const teamName = (id: any) =>
        teams.find((t) => String(t.teamId) === String(id))?.teamName ||
        `#${id}`;

    const assignmentOptions = useMemo(
        () =>
            assignments.map((a) => ({
                ...a,
                round: rounds.find(
                    (r) => String(r.roundId) === String(a.roundId),
                ),
                track: tracks.find(
                    (t) => String(t.trackId) === String(a.trackId),
                ),
            })),
        [assignments, rounds, tracks],
    );

    async function load() {
        setLoading(true);

        try {
            const [ev, trAll, rdAll] = await Promise.all([
                getEvents(),
                getTracks(),
                getRounds(),
            ]);

            let us: any[] = [];
            let as: any[] = [];

            if (isAdmin) {
                [us, as] = await Promise.all([
                    getUsers(),
                    getJudgeAssignments(),
                ]);
            } else {
                as = await getMyJudgeAssignments();
            }

            const eid = eventId || ev?.[0]?.eventId || '';

            const tr = eid
                ? trAll.filter(
                    (t: any) => String(t.eventId) === String(eid),
                )
                : trAll;

            const rd = eid
                ? rdAll.filter(
                    (r: any) => String(r.eventId) === String(eid),
                )
                : rdAll;

            const selectedAssignment = as?.[0];

            const rid =
                roundId ||
                selectedAssignment?.roundId ||
                rd?.[0]?.roundId ||
                '';

            const tid =
                trackId ||
                selectedAssignment?.trackId ||
                tr?.[0]?.trackId ||
                '';

            const round = rdAll.find(
                (r: any) => String(r.roundId) === String(rid),
            );

            const scoringEventId = round?.eventId || eid;

            const [cr, tm, sb] = await Promise.all([
                scoringEventId ? getCriteria(scoringEventId, true) : [],
                getTeams(),
                rid ? getSubmissions({ roundId: rid }) : [],
            ]);

            const filteredSubs = sb.filter(
                (s: any) =>
                    !tid ||
                    String(
                        tm.find(
                            (t: any) =>
                                String(t.teamId) === String(s.teamId),
                        )?.trackId,
                    ) === String(tid),
            );

            setEvents(ev);
            setTracks(trAll);
            setRounds(rdAll);
            setUsers(us);
            setAssignments(as);
            setEventId(String(eid));
            setTrackId(String(tid));
            setRoundId(String(rid));
            setTeams(tm);
            setCriteria(cr);
            setCriterionId(
                String(
                    cr?.find((c: any) => c.isActive)?.criterionId || '',
                ),
            );
            setSubs(filteredSubs);
            setSubmissionId(
                String(filteredSubs?.[0]?.submissionId || ''),
            );
            setJudgeId(
                String(
                    us.find(
                        (u: any) => u.roleName !== 'TeamMember',
                    )?.userId || '',
                ),
            );
        } catch (e: any) {
            setMessage(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function reloadUsers() {
        if (isAdmin) setUsers(await getUsers());
    }

    async function reloadAssignments() {
        setAssignments(
            isAdmin
                ? await getJudgeAssignments()
                : await getMyJudgeAssignments(),
        );
    }

    async function reloadScoring(rid = roundId, tid = trackId) {
        if (!rid) return;

        const round = rounds.find(
            (r: any) => String(r.roundId) === String(rid),
        );

        const [sb, tm, cr] = await Promise.all([
            getSubmissions({ roundId: rid }),
            getTeams(),
            round?.eventId
                ? getCriteria(round.eventId, true)
                : Promise.resolve(criteria),
        ]);

        setTeams(tm);
        setCriteria(cr);
        setCriterionId(
            String(cr?.find((c: any) => c.isActive)?.criterionId || ''),
        );

        const filtered = sb.filter(
            (s: any) =>
                !tid ||
                String(
                    tm.find(
                        (t: any) =>
                            String(t.teamId) === String(s.teamId),
                    )?.trackId,
                ) === String(tid),
        );

        setSubs(filtered);
        setSubmissionId(String(filtered?.[0]?.submissionId || ''));
    }

    async function onCreateStaff(e: any) {
        e.preventDefault();

        try {
            await createStaff(staff);
            setMessage('Đã tạo tài khoản');
            setStaff({
                fullName: '',
                email: '',
                password: '',
                roleName: 'GuestJudge',
                userType: 'Staff',
            });
            reloadUsers();
        } catch (err: any) {
            setMessage(err.message);
        }
    }

    async function onApprove(id: any) {
        try {
            await approveUser(id);
            setMessage('Đã duyệt tài khoản');
            reloadUsers();
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    async function onReject(id: any) {
        try {
            await rejectUser(id);
            setMessage('Đã từ chối tài khoản');
            reloadUsers();
        } catch (e: any) {
            setMessage(e.message);
        }
    }

    async function onAssign(e: any) {
        e.preventDefault();

        try {
            await assignJudge({
                roundId: Number(roundId),
                trackId: Number(trackId),
                judgeId: Number(judgeId),
            });
            setMessage('Đã phân công giám khảo');
            reloadAssignments();
        } catch (err: any) {
            setMessage(err.message);
        }
    }

    async function onScore(e: any) {
        e.preventDefault();

        try {
            await submitScore({
                submissionId: Number(submissionId),
                criterionId: Number(criterionId),
                scoreValue: Number(score.scoreValue),
                comment: score.comment,
            });
            setMessage('Đã lưu điểm');
            setScore({
                scoreValue: '',
                comment: '',
            });
        } catch (err: any) {
            setMessage(err.message);
        }
    }

    useEffect(() => {
        load();
    }, [role]);

    useEffect(() => {
        if (eventId && isAdmin) {
            const tr = tracks.filter(
                (t: any) => String(t.eventId) === String(eventId),
            );

            const rd = rounds.filter(
                (r: any) => String(r.eventId) === String(eventId),
            );

            setTrackId(String(tr?.[0]?.trackId || ''));
            setRoundId(String(rd?.[0]?.roundId || ''));
        }
    }, [eventId]);

    useEffect(() => {
        reloadScoring().catch(() => {});
    }, [roundId, trackId]);

    if (loading) return <Loading />;

    return (
        <section className="grid">
            <div className="page-title">
                <div>
                    <h2>
                        {isAdmin
                            ? 'Assignments & Scoring'
                            : 'Scoring'}
                    </h2>

                    <p className="muted">
                        Judge chỉ thấy hạng mục/vòng được phân công và
                        chỉ nhập điểm, nhận xét.
                    </p>
                </div>

                <button onClick={load}>Làm mới</button>
            </div>

            {message && <div className="notice">{message}</div>}

            {isAdmin && (
                <section className="grid grid-2">
                    <div className="card">
                        <h2>Tạo tài khoản nhân sự</h2>

                        <form
                            className="form-grid"
                            onSubmit={onCreateStaff}
                        >
                            <label>
                                Họ tên
                                <input
                                    value={staff.fullName}
                                    onChange={(e) =>
                                        setStaff({
                                            ...staff,
                                            fullName: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Email
                                <input
                                    value={staff.email}
                                    onChange={(e) =>
                                        setStaff({
                                            ...staff,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Mật khẩu
                                <input
                                    type="password"
                                    value={staff.password}
                                    onChange={(e) =>
                                        setStaff({
                                            ...staff,
                                            password: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Vai trò
                                <select
                                    value={staff.roleName}
                                    onChange={(e) =>
                                        setStaff({
                                            ...staff,
                                            roleName: e.target.value,
                                        })
                                    }
                                >
                                    <option value="Mentor">
                                        Mentor
                                    </option>
                                    <option value="Judge">
                                        Judge
                                    </option>
                                    <option value="GuestJudge">
                                        GuestJudge
                                    </option>
                                    <option value="EventCoordinator">
                                        EventCoordinator
                                    </option>
                                </select>
                            </label>

                            <button>Tạo tài khoản</button>
                        </form>
                    </div>

                    <div className="card">
                        <h2>Phân công giám khảo</h2>

                        <form
                            className="form-grid"
                            onSubmit={onAssign}
                        >
                            <label>
                                Sự kiện
                                <select
                                    value={eventId}
                                    onChange={(e) =>
                                        setEventId(e.target.value)
                                    }
                                >
                                    {events.map((e) => (
                                        <option
                                            key={e.eventId}
                                            value={e.eventId}
                                        >
                                            {e.eventName}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Vòng
                                <select
                                    value={roundId}
                                    onChange={(e) =>
                                        setRoundId(e.target.value)
                                    }
                                >
                                    {rounds
                                        .filter(
                                            (r: any) =>
                                                String(r.eventId) ===
                                                String(eventId),
                                        )
                                        .map((r) => (
                                            <option
                                                key={r.roundId}
                                                value={r.roundId}
                                            >
                                                {r.roundName}
                                            </option>
                                        ))}
                                </select>
                            </label>

                            <label>
                                Hạng mục
                                <select
                                    value={trackId}
                                    onChange={(e) =>
                                        setTrackId(e.target.value)
                                    }
                                >
                                    {tracks
                                        .filter(
                                            (t: any) =>
                                                String(t.eventId) ===
                                                String(eventId),
                                        )
                                        .map((t) => (
                                            <option
                                                key={t.trackId}
                                                value={t.trackId}
                                            >
                                                {t.trackName}
                                            </option>
                                        ))}
                                </select>
                            </label>

                            <label>
                                Người chấm
                                <select
                                    value={judgeId}
                                    onChange={(e) =>
                                        setJudgeId(e.target.value)
                                    }
                                >
                                    {judges.map((j) => (
                                        <option
                                            key={j.userId}
                                            value={j.userId}
                                        >
                                            {j.fullName} ·{' '}
                                            {viRole(j.roleName)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <button>Phân công</button>
                        </form>

                        <p className="muted small">
                            Một người có thể Mentor ở hạng mục này và
                            Judge ở hạng mục khác vì quyền chấm dựa
                            trên Assignment.
                        </p>
                    </div>
                </section>
            )}

            {!isAdmin && (
                <section className="card">
                    <h2>Hạng mục / Vòng được phân công</h2>

                    <DataTable
                        columns={[
                            {
                                title: 'Event',
                                render: (r) =>
                                    eventName(
                                        rounds.find(
                                            (x: any) =>
                                                String(x.roundId) ===
                                                String(r.roundId),
                                        )?.eventId,
                                    ),
                            },
                            {
                                title: 'Hạng mục',
                                render: (r) =>
                                    trackName(r.trackId),
                            },
                            {
                                title: 'Vòng thi',
                                render: (r) =>
                                    roundName(r.roundId),
                            },
                        ]}
                        data={assignmentOptions}
                        rowKey="assignmentId"
                    />
                </section>
            )}

            {!isAdmin && (
                <section className="control-bar card">
                    <label>
                        Assignment
                        <select
                            value={`${roundId}-${trackId}`}
                            onChange={(e) => {
                                const [rid, tid] =
                                    e.target.value.split('-');

                                setRoundId(rid);
                                setTrackId(tid);
                            }}
                        >
                            {assignmentOptions.map((a) => (
                                <option
                                    key={`${a.roundId}-${a.trackId}`}
                                    value={`${a.roundId}-${a.trackId}`}
                                >
                                    {trackName(a.trackId)} ·{' '}
                                    {roundName(a.roundId)}
                                </option>
                            ))}
                        </select>
                    </label>
                </section>
            )}

            <section className="card">
                <h2>Danh sách đội thuộc phân công</h2>

                <DataTable
                    columns={[
                        {
                            title: 'Submission',
                            key: 'submissionId',
                        },
                        {
                            title: 'Đội',
                            render: (r) => teamName(r.teamId),
                        },
                        {
                            title: 'Hạng mục',
                            render: (r) =>
                                trackName(
                                    teams.find(
                                        (t) =>
                                            String(t.teamId) ===
                                            String(r.teamId),
                                    )?.trackId,
                                ),
                        },
                        {
                            title: 'Repo',
                            render: (r) =>
                                r.repositoryUrl ? (
                                    <a
                                        className="text-link"
                                        href={String(
                                            r.repositoryUrl,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View Submission
                                    </a>
                                ) : (
                                    '-'
                                ),
                        },
                    ]}
                    data={subs}
                    rowKey="submissionId"
                />
            </section>

            <section className="card">
                <h2>Nhập điểm và nhận xét</h2>

                <form className="form-grid" onSubmit={onScore}>
                    <label>
                        Bài nộp
                        <select
                            value={submissionId}
                            onChange={(e) =>
                                setSubmissionId(e.target.value)
                            }
                        >
                            {subs.map((s) => (
                                <option
                                    key={s.submissionId}
                                    value={s.submissionId}
                                >
                                    Submission #{s.submissionId} ·{' '}
                                    {teamName(s.teamId)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Tiêu chí
                        <select
                            value={criterionId}
                            onChange={(e) =>
                                setCriterionId(e.target.value)
                            }
                        >
                            {criteria
                                .filter((c) => c.isActive)
                                .map((c) => (
                                    <option
                                        key={c.criterionId}
                                        value={c.criterionId}
                                    >
                                        {c.criterionName} /{' '}
                                        {c.maxScore}
                                    </option>
                                ))}
                        </select>
                    </label>

                    <label>
                        Điểm
                        <input
                            type="number"
                            min="0"
                            step="0.25"
                            value={score.scoreValue}
                            onChange={(e) =>
                                setScore({
                                    ...score,
                                    scoreValue: e.target.value,
                                })
                            }
                        />
                    </label>

                    <label className="span-2">
                        Nhận xét
                        <textarea
                            value={score.comment}
                            onChange={(e) =>
                                setScore({
                                    ...score,
                                    comment: e.target.value,
                                })
                            }
                        />
                    </label>

                    <button>Lưu điểm</button>
                </form>
            </section>

            {isAdmin && (
                <section className="grid grid-2">
                    <div className="card">
                        <h2>Tài khoản chờ duyệt</h2>

                        <DataTable
                            columns={[
                                {
                                    title: 'Họ tên',
                                    key: 'fullName',
                                },
                                {
                                    title: 'Email',
                                    key: 'email',
                                },
                                {
                                    title: 'Vai trò',
                                    render: (r) =>
                                        viRole(r.roleName),
                                },
                                {
                                    title: 'Thao tác',
                                    render: (r) => (
                                        <div className="mini-actions">
                                            <button
                                                onClick={() =>
                                                    onApprove(
                                                        r.userId,
                                                    )
                                                }
                                            >
                                                Duyệt
                                            </button>

                                            <button
                                                className="secondary"
                                                onClick={() =>
                                                    onReject(
                                                        r.userId,
                                                    )
                                                }
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
                            data={pending}
                            rowKey="userId"
                        />
                    </div>

                    <div className="card">
                        <h2>Phân công</h2>

                        <DataTable
                            columns={[
                                {
                                    title: 'Vòng',
                                    render: (r) =>
                                        roundName(r.roundId),
                                },
                                {
                                    title: 'Hạng mục',
                                    render: (r) =>
                                        trackName(r.trackId),
                                },
                                {
                                    title: 'Người chấm',
                                    render: (r) =>
                                        name(r.judgeId),
                                },
                                {
                                    title: 'Xóa',
                                    render: (r) => (
                                        <button
                                            className="secondary"
                                            onClick={async () => {
                                                await removeJudgeAssignment(
                                                    r.assignmentId,
                                                );
                                                reloadAssignments();
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    ),
                                },
                            ]}
                            data={assignments}
                            rowKey="assignmentId"
                        />
                    </div>
                </section>
            )}
        </section>
    );
}