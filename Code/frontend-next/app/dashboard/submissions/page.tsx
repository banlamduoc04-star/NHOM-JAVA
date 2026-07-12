'use client';

import { useEffect, useMemo, useState } from 'react';

import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';

import useAuth from '@/hooks/useAuth';

import { getEvents } from '@/services/eventService';
import { getRounds } from '@/services/roundService';
import { getMyTeams, getTeams } from '@/services/teamService';
import {
    getSubmissions,
    createSubmission,
    eliminateSubmission
} from '@/services/submissionService';

import { formatDate } from '@/utils/formatDate';

import {
    canEliminateSubmission,
    canSubmitForTeam,
    isAdminRole,
    roleOf
} from '@/utils/rbac';


export default function SubmissionsPage() {

    const { user } = useAuth() as any;


    const role = roleOf(user);

    const isAdmin = isAdminRole(role);


    const [events, setEvents] =
        useState<any[]>([]);

    const [rounds, setRounds] =
        useState<any[]>([]);

    const [teams, setTeams] =
        useState<any[]>([]);

    const [subs, setSubs] =
        useState<any[]>([]);


    const [eventId, setEventId] =
        useState('');

    const [roundId, setRoundId] =
        useState('');

    const [teamId, setTeamId] =
        useState('');


    const [form, setForm] =
        useState<any>({
            repositoryUrl:
                'https://github.com/example/seal-project',

            demoUrl:
                'https://demo.example.com',

            reportUrl:
                'https://drive.google.com/example'
        });


    const [message, setMessage] =
        useState('');

    const [loading, setLoading] =
        useState(true);


    const selectedTeam =
        useMemo(
            () =>
                teams.find(
                    (t) =>
                        String(t.teamId)
                        === String(teamId)
                ),

            [
                teams,
                teamId
            ]
        );


    const canSubmit =
        canSubmitForTeam(
            user,
            selectedTeam
        );


    const teamName = (
        id: any
    ) =>
        teams.find(
            (t) =>
                String(t.teamId)
                === String(id)
        )?.teamName
        || `#${id}`;


    const roundName = (
        id: any
    ) =>
        rounds.find(
            (r) =>
                String(r.roundId)
                === String(id)
        )?.roundName
        || `#${id}`;


    const link = (
        url: any
    ) =>
        url

            ? (
                <a
                    className="text-link"
                    href={String(url)}
                    target="_blank"
                    rel="noreferrer"
                >
                    View Submission
                </a>
            )

            : '-';


    async function load() {

        setLoading(true);


        try {

            const ev =
                await getEvents();


            const eid =
                eventId
                || ev?.[0]?.eventId
                || '';


            const rd =
                eid
                    ? await getRounds(eid)
                    : [];


            const tm =
                role === 'TeamMember'
                    ? await getMyTeams()
                    : (
                        eid
                            ? await getTeams({
                                eventId: eid
                            })
                            : []
                    );


            const rid =
                roundId
                || rd?.[0]?.roundId
                || '';


            const tid =
                teamId
                || tm?.[0]?.teamId
                || '';


            const sb =
                rid
                    ? await getSubmissions({
                        roundId: rid
                    })

                    : await getSubmissions();


            setEvents(ev);

            setEventId(
                String(eid)
            );

            setRounds(rd);

            setRoundId(
                String(rid)
            );

            setTeams(tm);

            setTeamId(
                String(tid)
            );

            setSubs(sb);


        } catch (e: any) {

            setMessage(
                e.message
            );


        } finally {

            setLoading(false);
        }
    }


    async function reload(
        rid = roundId
    ) {

        try {

            setSubs(
                rid
                    ? await getSubmissions({
                        roundId: rid
                    })

                    : await getSubmissions()
            );


        } catch (e: any) {

            setMessage(
                e.message
            );
        }
    }


    async function onCreate(
        e: any
    ) {

        e.preventDefault();


        try {

            await createSubmission({
                ...form,
                teamId: Number(teamId),
                roundId: Number(roundId)
            });


            setMessage(
                'Đã lưu bài nộp'
            );


            reload();


        } catch (err: any) {

            setMessage(
                err.message
            );
        }
    }


    async function onEliminate(
        row: any
    ) {

        const reason =
            prompt(
                'Lý do loại bài nộp:',
                'Vi phạm quy chế'
            );


        if (!reason) {
            return;
        }


        try {

            await eliminateSubmission(
                row.submissionId,
                reason
            );


            setMessage(
                'Đã loại bài nộp'
            );


            reload();


        } catch (e: any) {

            setMessage(
                e.message
            );
        }
    }


    useEffect(
        () => {
            load();
        },
        [role]
    );


    useEffect(
        () => {

            if (eventId) {

                getRounds(eventId)

                    .then((rd) => {

                        setRounds(rd);

                        setRoundId(
                            String(
                                rd?.[0]?.roundId
                                || ''
                            )
                        );

                    })

                    .catch(() => {});


                if (isAdmin) {

                    getTeams({
                        eventId
                    })

                        .then((tm) => {

                            setTeams(tm);

                            setTeamId(
                                String(
                                    tm?.[0]?.teamId
                                    || ''
                                )
                            );

                        })

                        .catch(() => {});
                }
            }

        },
        [eventId]
    );


    useEffect(
        () => {
            reload(roundId);
        },
        [roundId]
    );


    if (loading) {
        return <Loading />;
    }


    return (
        <section className="grid">


            <div className="page-title">

                <div>

                    <h2>
                        Bài nộp
                    </h2>


                    <p className="muted">
                        Leader được Submit/Edit Submission.
                        Member, Mentor, Judge và Admin chỉ xem;
                        Admin có quyền loại bài nộp.
                    </p>

                </div>


                <button
                    className="compact-button"
                    onClick={load}
                >
                    Làm mới
                </button>

            </div>


            {
                message && (
                    <div className="notice">
                        {message}
                    </div>
                )
            }


            <section className="control-bar card">

                <label>
                    Sự kiện

                    <select
                        value={eventId}
                        onChange={(e) =>
                            setEventId(e.target.value)
                        }
                    >

                        {
                            events.map((e) =>
                                (
                                    <option
                                        key={e.eventId}
                                        value={e.eventId}
                                    >
                                        {e.eventName}
                                    </option>
                                )
                            )
                        }

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

                        {
                            rounds.map((r) =>
                                (
                                    <option
                                        key={r.roundId}
                                        value={r.roundId}
                                    >
                                        {r.roundName}
                                    </option>
                                )
                            )
                        }

                    </select>

                </label>

            </section>


            {
                canSubmit && (

                    <section className="card">

                        <h2>
                            Submit / Edit Submission
                        </h2>


                        <form
                            className="form-grid"
                            onSubmit={onCreate}
                        >

                            <label>
                                Đội

                                <select
                                    value={teamId}
                                    onChange={(e) =>
                                        setTeamId(e.target.value)
                                    }
                                >

                                    {
                                        teams.map((t) =>
                                            (
                                                <option
                                                    key={t.teamId}
                                                    value={t.teamId}
                                                >
                                                    {t.teamName}
                                                </option>
                                            )
                                        )
                                    }

                                </select>

                            </label>


                            <label>
                                Repository

                                <input
                                    value={form.repositoryUrl}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            repositoryUrl:
                                            e.target.value
                                        })
                                    }
                                />

                            </label>


                            <label>
                                Demo

                                <input
                                    value={form.demoUrl}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            demoUrl:
                                            e.target.value
                                        })
                                    }
                                />

                            </label>


                            <label>
                                Báo cáo

                                <input
                                    value={form.reportUrl}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            reportUrl:
                                            e.target.value
                                        })
                                    }
                                />

                            </label>


                            <button>
                                {
                                    subs.some(
                                        (s) =>
                                            String(s.teamId)
                                            === String(teamId)
                                            &&
                                            String(s.roundId)
                                            === String(roundId)
                                    )
                                        ? 'Edit Submission'
                                        : 'Submit'
                                }
                            </button>


                        </form>

                    </section>

                )
            }


            <section className="card">

                <h2>
                    Danh sách bài nộp
                </h2>


                <DataTable

                    columns={[
                        {
                            title: 'ID',
                            key: 'submissionId'
                        },

                        {
                            title: 'Đội',
                            render: (r) =>
                                teamName(r.teamId)
                        },

                        {
                            title: 'Vòng',
                            render: (r) =>
                                roundName(r.roundId)
                        },

                        {
                            title: 'Repo',
                            render: (r) =>
                                link(r.repositoryUrl)
                        },

                        {
                            title: 'Demo',
                            render: (r) =>
                                link(r.demoUrl)
                        },

                        {
                            title: 'Báo cáo',
                            render: (r) =>
                                link(r.reportUrl)
                        },

                        {
                            title: 'Nộp lúc',
                            render: (r) =>
                                formatDate(
                                    r.submittedAt
                                )
                        },

                        {
                            title: 'Trạng thái',
                            render: (r) => (

                                <span className="table-badge">

                                    {
                                        r.isEliminated
                                            ? 'Đã loại'
                                            : 'Hợp lệ'
                                    }

                                </span>

                            )
                        },

                        ...(
                            canEliminateSubmission(user)

                                ? [
                                    {
                                        title: 'Thao tác',

                                        render: (r: any) => (

                                            <button
                                                className="secondary"
                                                onClick={() =>
                                                    onEliminate(r)
                                                }
                                            >
                                                Loại
                                            </button>

                                        )
                                    }
                                ]

                                : []
                        )

                    ]}


                    data={subs}

                    rowKey="submissionId"

                />

            </section>


        </section>
    );
}