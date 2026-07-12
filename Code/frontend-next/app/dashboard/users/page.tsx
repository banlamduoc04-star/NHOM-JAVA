'use client';

import { useEffect, useMemo, useState } from 'react';

import DataTable from '@/components/table/DataTable';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import useAuth from '@/hooks/useAuth';

import {
    approveUser,
    createStaff,
    getUsers,
    lockUser,
    rejectUser,
    unlockUser,
    updateUser
} from '@/services/judgeService';

import { isAdminRole, roleOf } from '@/utils/rbac';
import { viRole } from '@/constants/role';
import { formatDate } from '@/utils/formatDate';


const EMPTY_STAFF = {
    fullName: '',
    email: '',
    password: '',
    roleName: 'Mentor'
};


type TabName = 'staff' | 'pending' | 'all';


export default function UsersPage() {

    const { user } = useAuth() as any;

    const isAdmin = isAdminRole(
        roleOf(user)
    );


    const [users, setUsers] = useState<any[]>([]);

    const [tab, setTab] = useState<TabName>('staff');

    const [staffForm, setStaffForm] =
        useState<any>(EMPTY_STAFF);

    const [selected, setSelected] =
        useState<any | null>(null);

    const [editForm, setEditForm] =
        useState<any>(EMPTY_STAFF);

    const [modal, setModal] =
        useState<'detail' | 'edit' | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState('');


    const statusOf = (item: any) =>
        item.accountStatus
        || (item.isApproved ? 'Active' : 'Pending');


    const staffAccounts = useMemo(
        () =>
            users.filter(
                (item) => item.roleName !== 'TeamMember'
            ),
        [users]
    );


    const pendingAccounts = useMemo(
        () =>
            users.filter(
                (item) => statusOf(item) === 'Pending'
            ),
        [users]
    );


    async function load(
        clearMessage = true
    ) {

        setLoading(true);


        if (clearMessage) {
            setMessage('');
        }


        try {

            setUsers(
                await getUsers()
            );

        } catch (error: any) {

            setMessage(
                error.message
            );

        } finally {

            setLoading(false);
        }
    }
    async function onCreateStaff(
        event: React.FormEvent
    ) {

        event.preventDefault();


        try {

            await createStaff(
                staffForm
            );


            setStaffForm(
                EMPTY_STAFF
            );


            setMessage(
                'Đã tạo tài khoản nhân sự.'
            );


            await load(false);


        } catch (error: any) {

            setMessage(
                error.message
            );
        }
    }


    function openDetail(
        row: any
    ) {

        setSelected(row);

        setModal('detail');
    }


    function openEdit(
        row: any
    ) {

        setSelected(row);


        setEditForm({
            fullName: row.fullName || '',
            email: row.email || '',
            password: '',
            roleName: row.roleName || 'Mentor'
        });


        setModal('edit');
    }


    async function onUpdate(
        event: React.FormEvent
    ) {

        event.preventDefault();


        try {

            await updateUser(
                selected.userId,
                editForm
            );


            setMessage(
                'Đã cập nhật tài khoản.'
            );


            setModal(null);


            await load(false);


        } catch (error: any) {

            setMessage(
                error.message
            );
        }
    }


    async function onApprove(
        id: any
    ) {

        try {

            await approveUser(id);


            setMessage(
                'Đã duyệt tài khoản.'
            );


            await load(false);


        } catch (error: any) {

            setMessage(
                error.message
            );
        }
    }


    async function onReject(
        id: any
    ) {

        try {

            await rejectUser(id);


            setMessage(
                'Đã từ chối tài khoản.'
            );


            await load(false);


        } catch (error: any) {

            setMessage(
                error.message
            );
        }
    }


    async function toggleLock(
        row: any
    ) {

        try {

            if (statusOf(row) === 'Locked') {

                await unlockUser(
                    row.userId
                );


                setMessage(
                    'Đã mở khóa tài khoản.'
                );


            } else {

                await lockUser(
                    row.userId
                );


                setMessage(
                    'Đã khóa tài khoản.'
                );
            }


            await load(false);


        } catch (error: any) {

            setMessage(
                error.message
            );
        }
    }


    useEffect(
        () => {
            load();
        },
        [isAdmin]
    );


    if (loading) {
        return <Loading />;
    }


    if (!isAdmin) {
        return (
            <section className="card forbidden-card">

                <h2>
                    Không có quyền truy cập
                </h2>


                <p className="muted">
                    Chỉ Admin/Điều phối viên được quản lý người dùng.
                </p>

            </section>
        );
    }


    const accountActions = (
        row: any,
        allowEdit = false
    ) => (

        <div className="mini-actions">

            <button
                className="secondary"
                onClick={() => openDetail(row)}
            >
                Chi tiết
            </button>


            {
                allowEdit && (
                    <button
                        className="secondary"
                        onClick={() => openEdit(row)}
                    >
                        Sửa
                    </button>
                )
            }


            <button
                className={
                    statusOf(row) === 'Locked'
                        ? 'secondary'
                        : 'danger-button'
                }
                onClick={() => toggleLock(row)}
            >

                {
                    statusOf(row) === 'Locked'
                        ? 'Mở khóa'
                        : 'Khóa'
                }

            </button>

        </div>
    );
    return (
        <section className="grid">

            <div className="page-title">

                <div>

                    <h2>
                        Quản lý User
                    </h2>


                    <p className="muted">
                        Tách riêng tài khoản nhân sự,
                        tài khoản chờ duyệt và toàn bộ người dùng.
                    </p>

                </div>


                <button
                    className="compact-button"
                    onClick={() => load()}
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


            <div
                className="tabs"
                role="tablist"
            >

                <button
                    className={
                        tab === 'staff'
                            ? 'active'
                            : ''
                    }
                    onClick={() => setTab('staff')}
                >
                    Staff Accounts

                    <span>
                        {staffAccounts.length}
                    </span>

                </button>


                <button
                    className={
                        tab === 'pending'
                            ? 'active'
                            : ''
                    }
                    onClick={() => setTab('pending')}
                >
                    Pending Approval

                    <span>
                        {pendingAccounts.length}
                    </span>

                </button>


                <button
                    className={
                        tab === 'all'
                            ? 'active'
                            : ''
                    }
                    onClick={() => setTab('all')}
                >
                    All Users

                    <span>
                        {users.length}
                    </span>

                </button>

            </div>


            {
                tab === 'staff' && (

                    <>

                        <section className="card">

                            <h2>
                                Tạo tài khoản nhân sự
                            </h2>


                            <form
                                className="form-grid"
                                onSubmit={onCreateStaff}
                            >

                                <label>
                                    Họ tên

                                    <input
                                        required
                                        value={staffForm.fullName}
                                        onChange={(event) =>
                                            setStaffForm({
                                                ...staffForm,
                                                fullName: event.target.value
                                            })
                                        }
                                    />

                                </label>


                                <label>
                                    Email

                                    <input
                                        required
                                        type="email"
                                        value={staffForm.email}
                                        onChange={(event) =>
                                            setStaffForm({
                                                ...staffForm,
                                                email: event.target.value
                                            })
                                        }
                                    />

                                </label>


                                <label>
                                    Mật khẩu

                                    <input
                                        type="password"
                                        minLength={6}
                                        placeholder="Mặc định 123456 nếu để trống"
                                        value={staffForm.password}
                                        onChange={(event) =>
                                            setStaffForm({
                                                ...staffForm,
                                                password: event.target.value
                                            })
                                        }
                                    />

                                </label>


                                <label>
                                    Vai trò

                                    <select
                                        value={staffForm.roleName}
                                        onChange={(event) =>
                                            setStaffForm({
                                                ...staffForm,
                                                roleName: event.target.value
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
                                            Guest Judge
                                        </option>

                                        <option value="EventCoordinator">
                                            Điều phối viên
                                        </option>

                                    </select>

                                </label>


                                <button className="compact-button">
                                    Tạo tài khoản
                                </button>

                            </form>

                        </section>
                        <section className="card">

                            <div className="section-title">

                                <h2>
                                    Staff Accounts
                                </h2>


                                <span>
                                    {staffAccounts.length} tài khoản
                                </span>

                            </div>


                            <DataTable
                                columns={[
                                    {
                                        title: 'Họ tên',
                                        key: 'fullName'
                                    },

                                    {
                                        title: 'Email',
                                        key: 'email'
                                    },

                                    {
                                        title: 'Vai trò',
                                        render: (row) =>
                                            viRole(row.roleName)
                                    },

                                    {
                                        title: 'Trạng thái',
                                        render: (row) => (
                                            <span className="table-badge">
                                                {statusOf(row)}
                                            </span>
                                        )
                                    },

                                    {
                                        title: 'Thao tác',
                                        render: (row) =>
                                            accountActions(
                                                row,
                                                true
                                            )
                                    }
                                ]}

                                data={staffAccounts}

                                rowKey="userId"
                            />

                        </section>

                    </>

                )
            }


            {
                tab === 'pending' && (

                    <section className="card">

                        <div className="section-title">

                            <h2>
                                Pending Approval
                            </h2>


                            <span>
                                {pendingAccounts.length} chờ duyệt
                            </span>

                        </div>


                        <DataTable

                            columns={[
                                {
                                    title: 'Họ tên',
                                    key: 'fullName'
                                },

                                {
                                    title: 'Email',
                                    key: 'email'
                                },

                                {
                                    title: 'Vai trò',
                                    render: (row) =>
                                        viRole(row.roleName)
                                },

                                {
                                    title: 'Ngày tạo',
                                    render: (row) =>
                                        formatDate(
                                            row.createdAt
                                        )
                                },

                                {
                                    title: 'Thao tác',
                                    render: (row) => (

                                        <div className="mini-actions">

                                            <button
                                                onClick={() =>
                                                    onApprove(
                                                        row.userId
                                                    )
                                                }
                                            >
                                                Duyệt
                                            </button>


                                            <button
                                                className="danger-button"
                                                onClick={() =>
                                                    onReject(
                                                        row.userId
                                                    )
                                                }
                                            >
                                                Từ chối
                                            </button>

                                        </div>

                                    )
                                }
                            ]}


                            data={pendingAccounts}

                            rowKey="userId"

                        />

                    </section>

                )
            }
            {
                tab === 'all' && (

                    <section className="card">

                        <div className="section-title">

                            <h2>
                                All Users
                            </h2>


                            <span>
                                {users.length} người dùng
                            </span>

                        </div>


                        <DataTable

                            columns={[
                                {
                                    title: 'Họ tên',
                                    key: 'fullName'
                                },

                                {
                                    title: 'Email',
                                    key: 'email'
                                },

                                {
                                    title: 'Vai trò',
                                    render: (row) =>
                                        viRole(row.roleName)
                                },

                                {
                                    title: 'Trạng thái',
                                    render: (row) => (
                                        <span className="table-badge">
                                            {statusOf(row)}
                                        </span>
                                    )
                                },

                                {
                                    title: 'Ngày tạo',
                                    render: (row) =>
                                        formatDate(
                                            row.createdAt
                                        )
                                },

                                {
                                    title: 'Thao tác',
                                    render: (row) =>
                                        accountActions(row)
                                }
                            ]}


                            data={users}

                            rowKey="userId"

                        />

                    </section>

                )
            }


            <Modal
                open={modal === 'detail'}
                title="Chi tiết tài khoản"
                onClose={() => setModal(null)}
            >

                {
                    selected && (

                        <div className="detail-grid">

                            <div>
                                <span>
                                    Họ tên
                                </span>

                                <strong>
                                    {selected.fullName}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Email
                                </span>

                                <strong>
                                    {selected.email}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Vai trò
                                </span>

                                <strong>
                                    {viRole(selected.roleName)}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Loại tài khoản
                                </span>

                                <strong>
                                    {selected.userType || '-'}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Trạng thái
                                </span>

                                <strong>
                                    {statusOf(selected)}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Ngày tạo
                                </span>

                                <strong>
                                    {formatDate(selected.createdAt)}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    MSSV FPT
                                </span>

                                <strong>
                                    {selected.fptStudentCode || '-'}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Trường
                                </span>

                                <strong>
                                    {selected.universityName || '-'}
                                </strong>
                            </div>

                        </div>

                    )
                }

            </Modal>


            <Modal
                open={modal === 'edit'}
                title="Chỉnh sửa tài khoản nhân sự"
                onClose={() => setModal(null)}
            >

                <form
                    className="form-grid"
                    onSubmit={onUpdate}
                >

                    <label>
                        Họ tên

                        <input
                            required
                            value={editForm.fullName}
                            onChange={(event) =>
                                setEditForm({
                                    ...editForm,
                                    fullName: event.target.value
                                })
                            }
                        />

                    </label>


                    <label>
                        Email

                        <input
                            required
                            type="email"
                            value={editForm.email}
                            onChange={(event) =>
                                setEditForm({
                                    ...editForm,
                                    email: event.target.value
                                })
                            }
                        />

                    </label>


                    <label>
                        Mật khẩu mới

                        <input
                            type="password"
                            minLength={6}
                            placeholder="Để trống nếu không đổi"
                            value={editForm.password}
                            onChange={(event) =>
                                setEditForm({
                                    ...editForm,
                                    password: event.target.value
                                })
                            }
                        />

                    </label>


                    <label>
                        Vai trò

                        <select
                            value={editForm.roleName}
                            onChange={(event) =>
                                setEditForm({
                                    ...editForm,
                                    roleName: event.target.value
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
                                Guest Judge
                            </option>


                            <option value="EventCoordinator">
                                Điều phối viên
                            </option>

                        </select>

                    </label>


                    <button className="compact-button">
                        Lưu thay đổi
                    </button>

                </form>

            </Modal>

        </section>
    );
}