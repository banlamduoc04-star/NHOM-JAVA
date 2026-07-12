'use client';

import { useEffect, useState } from 'react';

import Loading from '@/components/common/Loading';
import DataTable from '@/components/table/DataTable';

import { getEvents } from '@/services/eventService';
import {
    getRounds,
    createRound,
    evaluateRound,
    getScoreCompleteness
} from '@/services/roundService';
import {
    getRoundRanking,
    getTeamsAdvance
} from '@/services/rankingService';

import {
    formatDate,
    formatNumber
} from '@/utils/formatDate';

export default function RoundsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [rounds, setRounds] = useState<any[]>([]);
    const [ranking, setRanking] = useState<any[]>([]);
    const [advance, setAdvance] = useState<any[]>([]);

    const [eventId, setEventId] = useState('');
    const [roundId, setRoundId] = useState('');
    const [complete, setComplete] = useState<any>({});

    const [form, setForm] = useState<any>({
        roundName: 'Vòng sơ khảo',
        roundOrder: '1',
        submissionDeadline: '2026-07-15T23:59',
        topNAdvance: '5',
        roundType: 'Competition',
        isCalibrationRound: false
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    async function load() {
        const ev = await getEvents();

        const eid = eventId || ev?.[0]?.eventId || '';
        const rd = eid ? await getRounds(eid) : [];
        const rid = roundId || rd?.[0]?.roundId || '';

        setEvents(ev);
        setEventId(eid);
        setRounds(rd);
        setRoundId(rid);
        setLoading(false);
    }

    async function loadRound(rid: any) {
        if (!rid) return;

        try {
            const [rk, av, cp] = await Promise.all([
                getRoundRanking(rid),
                getTeamsAdvance(rid),
                getScoreCompleteness(rid)
            ]);

            setRanking(rk);
            setAdvance(av);
            setComplete(cp || {});
        } catch {}
    }

    async function onCreate(e: any) {
        e.preventDefault();

        if (!eventId) {
            return setMessage('Chọn sự kiện trước');
        }

        await createRound({
            ...form,
            eventId: Number(eventId),
            roundOrder: Number(form.roundOrder),
            topNAdvance: Number(form.topNAdvance) || undefined
        });

        setMessage('Đã tạo vòng thi');
        load();
    }

    async function onEvaluate() {
        if (!roundId) return;

        await evaluateRound(roundId);

        setMessage(
            'Đã xem trước xếp hạng / đội dự kiến thăng vòng. Kết quả chưa được công bố.'
        );

        loadRound(roundId);
    }

    useEffect(() => {
        load().catch((e) => {
            setMessage(e.message);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (eventId) {
            getRounds(eventId).then((d) => {
                setRounds(d);
                setRoundId(d?.[0]?.roundId || '');
            });
        }
    }, [eventId]);

    useEffect(() => {
        loadRound(roundId);
    }, [roundId]);

    if (loading) return <Loading />;

    return (
        <section className="grid">
            <div className="page-title">
                <div>
                    <h2>Vòng thi</h2>
                    <p className="muted">
                        Tạo vòng, đặt hạn nộp và Top N thăng vòng.
                    </p>
                </div>

                <button
                    className="compact-button"
                    onClick={onEvaluate}
                >
                    Xem trước xếp hạng
                </button>
            </div>

            {message && (
                <div className="notice">
                    {message}
                </div>
            )}

            <section className="control-bar card">
                <label>
                    Sự kiện

                    <select
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
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
                        onChange={(e) => setRoundId(e.target.value)}
                    >
                        {rounds.map((r) => (
                            <option
                                key={r.roundId}
                                value={r.roundId}
                            >
                                {r.roundName}
                            </option>
                        ))}
                    </select>
                </label>
            </section>

            <section className="card">
                <h2>Tạo vòng thi</h2>

                <form
                    className="form-grid"
                    onSubmit={onCreate}
                >
                    <label>
                        Tên vòng

                        <input
                            value={form.roundName}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    roundName: e.target.value
                                })
                            }
                        />
                    </label>

                    <label>
                        Thứ tự

                        <input
                            value={form.roundOrder}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    roundOrder: e.target.value
                                })
                            }
                        />
                    </label>

                    <label>
                        Hạn nộp

                        <input
                            type="datetime-local"
                            value={form.submissionDeadline}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    submissionDeadline: e.target.value
                                })
                            }
                        />
                    </label>

                    <label>
                        Top N

                        <input
                            value={form.topNAdvance}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    topNAdvance: e.target.value
                                })
                            }
                        />
                    </label>

                    <label>
                        Loại vòng

                        <select
                            value={form.roundType}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    roundType: e.target.value
                                })
                            }
                        >
                            <option value="Competition">
                                Vòng thi chính
                            </option>

                            <option value="Calibration">
                                Vòng hiệu chuẩn
                            </option>
                        </select>
                    </label>

                    <label className="checkbox-line">
                        <input
                            type="checkbox"
                            checked={form.isCalibrationRound}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    isCalibrationRound: e.target.checked
                                })
                            }
                        />

                        Vòng hiệu chuẩn
                    </label>

                    <button>Tạo vòng</button>
                </form>
            </section>

            <section className="grid grid-2">
                <div className="card">
                    <h2>Danh sách vòng</h2>

                    <DataTable
                        columns={[
                            { title: 'ID', key: 'roundId' },
                            { title: 'Tên', key: 'roundName' },
                            { title: 'Thứ tự', key: 'roundOrder' },
                            {
                                title: 'Hạn nộp',
                                render: (r) =>
                                    formatDate(r.submissionDeadline)
                            },
                            { title: 'Top N', key: 'topNAdvance' }
                        ]}
                        data={rounds}
                        rowKey="roundId"
                    />
                </div>

                <div className="card">
                    <h2>Độ đầy đủ điểm</h2>

                    <div className="metric-row">
                        <div>
                            <strong>
                                {complete.submissionCount ?? 0}
                            </strong>
                            <span>Bài nộp</span>
                        </div>

                        <div>
                            <strong>
                                {complete.judgeAssignmentCount ?? 0}
                            </strong>
                            <span>Phân công</span>
                        </div>

                        <div>
                            <strong>
                                {complete.scoreCount ?? 0}
                            </strong>
                            <span>Điểm</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-2">
                <div className="card">
                    <h2>Xếp hạng</h2>

                    <DataTable
                        columns={[
                            { title: 'Hạng', key: 'rankNo' },
                            { title: 'Đội', key: 'teamName' },
                            {
                                title: 'Điểm',
                                render: (r) =>
                                    formatNumber(r.finalScore)
                            }
                        ]}
                        data={ranking}
                        rowKey={(r) =>
                            `${r.teamId}-${r.rankNo}`
                        }
                    />
                </div>

                <div className="card">
                    <h2>Thăng vòng</h2>

                    <DataTable
                        columns={[
                            { title: 'Hạng', key: 'rankNo' },
                            { title: 'Đội', key: 'teamName' },
                            {
                                title: 'Điểm',
                                render: (r) =>
                                    formatNumber(r.finalScore)
                            }
                        ]}
                        data={advance}
                        rowKey={(r) => `${r.teamId}-a`}
                    />
                </div>
            </section>
        </section>
    );
}