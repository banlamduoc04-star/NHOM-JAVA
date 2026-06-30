const state = {
  token: localStorage.getItem('seal_token') || '',
  user: readJson(localStorage.getItem('seal_user')),
  activeTab: 'overview',
  selectedEventId: null,
  selectedRoundId: null,
  data: {
    events: [], tracks: [], rounds: [], teams: [], submissions: [], criteria: [], users: [], assignments: [], rankings: [], variance: [], reliability: null, auditLogs: [], prizes: [], announcements: []
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function readJson(value) {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: value.includes('T') ? 'short' : undefined });
}

function badge(value) {
  const text = String(value || 'N/A');
  const cls = /approved|open|advanced|published/i.test(text) ? 'success' : /pending|draft|calibration/i.test(text) ? 'warn' : /reject|eliminated|closed/i.test(text) ? 'danger' : '';
  return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const text = await response.text();
    let message = `HTTP ${response.status}`;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || text || message;
    } catch { message = text || message; }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

function notify(targetId, message, type = 'success') {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.className = `notice ${type}`;
  target.textContent = message;
  target.classList.remove('hidden');
  window.setTimeout(() => target.classList.add('hidden'), type === 'error' ? 7000 : 4200);
}

function currentRole() { return state.user?.role || ''; }
function isCoordinator() { return currentRole() === 'EventCoordinator'; }
function isJudge() { return ['Judge', 'GuestJudge'].includes(currentRole()); }
function isTeamMember() { return currentRole() === 'TeamMember'; }

function setAuthVisibility() {
  const loggedIn = Boolean(state.token && state.user);
  const landingSections = ['#home', '#features', '#research'];

  // Chưa đăng nhập: chỉ hiển thị landing page/form đăng nhập, ẩn dashboard.
  // Đã đăng nhập: ẩn toàn bộ landing page, chỉ hiển thị workspace dashboard.
  landingSections.forEach(selector => $(selector)?.classList.toggle('hidden', loggedIn));
  $('#dashboard')?.classList.toggle('hidden', !loggedIn);
  $('#logoutBtn')?.classList.toggle('hidden', !loggedIn);

  const dashboardLink = $('#dashboardLink');
  if (dashboardLink) {
    dashboardLink.textContent = 'Dashboard';
    dashboardLink.classList.toggle('hidden', !loggedIn);
  }

  $$('.topnav a').forEach(link => {
    if (link.id !== 'dashboardLink') link.classList.toggle('hidden', loggedIn);
  });

  const brand = $('.brand');
  if (brand) brand.setAttribute('href', loggedIn ? '#dashboard' : '#home');

  if (loggedIn) {
    $('#userLine').innerHTML = `${escapeHtml(state.user.fullName)} · ${badge(state.user.role)} · ${escapeHtml(state.user.email)}`;
  }
}

function setAuthTab(tab) {
  $$('[data-auth-tab]').forEach(btn => btn.classList.toggle('active', btn.dataset.authTab === tab));
  $$('[data-auth-panel]').forEach(panel => panel.classList.toggle('hidden', panel.dataset.authPanel !== tab));
}

function table(headers, rows, empty = 'Chưa có dữ liệu.') {
  if (!rows || rows.length === 0) return `<div class="empty-state">${empty}</div>`;
  return `<div class="scroll-table"><table><thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

function optionList(items, idKey, labelKey, selectedId) {
  return items.map(item => `<option value="${item[idKey]}" ${String(item[idKey]) === String(selectedId) ? 'selected' : ''}>${escapeHtml(item[labelKey])}</option>`).join('');
}

function mapBy(items, key) {
  const out = new Map();
  items.forEach(item => out.set(item[key], item));
  return out;
}

async function loadDashboard() {
  if (!state.token) return;
  try {
    const events = await api('/api/events');
    state.data.events = events || [];
    if (!state.selectedEventId && events.length) state.selectedEventId = events[0].eventId;
    await loadEventScopedData();
    renderDashboard();
    setAuthVisibility();
  } catch (err) {
    notify('dashboardNotice', err.message || 'Không thể tải dữ liệu dashboard', 'error');
  }
}

async function loadEventScopedData() {
  const eventId = state.selectedEventId;
  if (!eventId) return;
  const [tracks, rounds, teams, criteria, prizes, announcements] = await Promise.all([
    api(`/api/tracks?eventId=${eventId}`),
    api(`/api/rounds?eventId=${eventId}`),
    api(`/api/teams?eventId=${eventId}`),
    api(`/api/event-criteria/event/${eventId}`),
    api(`/api/prizes?eventId=${eventId}`),
    api(`/api/announcements/event/${eventId}`).catch(() => [])
  ]);
  state.data.tracks = tracks || [];
  state.data.rounds = rounds || [];
  state.data.teams = teams || [];
  state.data.criteria = criteria || [];
  state.data.prizes = prizes || [];
  state.data.announcements = announcements || [];
  if (!state.selectedRoundId || !state.data.rounds.some(r => String(r.roundId) === String(state.selectedRoundId))) {
    const competitionRound = state.data.rounds.find(r => !r.isCalibrationRound) || state.data.rounds[0];
    state.selectedRoundId = competitionRound?.roundId || null;
  }

  const roundId = state.selectedRoundId;
  const extraCalls = [
    roundId ? api(`/api/submissions?roundId=${roundId}`) : Promise.resolve([]),
    roundId ? api(`/api/rankings/round?roundId=${roundId}`) : Promise.resolve([]),
    api(`/api/research/event/${eventId}/judge-variance`).catch(() => []),
    api(`/api/research/event/${eventId}/reliability-summary`).catch(() => null),
    api('/api/judge-assignments').catch(() => []),
    api('/api/audit-logs').catch(() => [])
  ];
  if (isCoordinator()) extraCalls.push(api('/api/admin/users').catch(() => []));
  const [submissions, rankings, variance, reliability, assignments, auditLogs, users = []] = await Promise.all(extraCalls);
  state.data.submissions = submissions || [];
  state.data.rankings = rankings || [];
  state.data.variance = variance || [];
  state.data.reliability = reliability;
  state.data.assignments = assignments || [];
  state.data.auditLogs = auditLogs || [];
  state.data.users = users || [];
}

function renderDashboard() {
  renderSelectors();
  renderStats();
  renderOverview();
  renderEvents();
  renderTeams();
  renderScoring();
  renderRbl();
  renderAdmin();
}

function renderSelectors() {
  $('#eventSelect').innerHTML = state.data.events.map(e => `<option value="${e.eventId}" ${String(e.eventId) === String(state.selectedEventId) ? 'selected' : ''}>${escapeHtml(e.eventName)} · ${escapeHtml(e.season)} ${e.eventYear}</option>`).join('');
  $('#roundSelect').innerHTML = state.data.rounds.map(r => `<option value="${r.roundId}" ${String(r.roundId) === String(state.selectedRoundId) ? 'selected' : ''}>${escapeHtml(r.roundName)}</option>`).join('');
}

function renderStats() {
  const pendingUsers = state.data.users.filter(u => !u.isApproved).length;
  const approvedTeams = state.data.teams.filter(t => /approved/i.test(t.status)).length;
  const overall = state.data.reliability?.overall || {};
  $('#statGrid').innerHTML = [
    stat('Sự kiện', state.data.events.length, 'Spring · Summer · Fall'),
    stat('Đội thi', state.data.teams.length, `${approvedTeams} đội đã duyệt`),
    stat('Bài nộp vòng này', state.data.submissions.length, 'Repo · Demo · Report URL'),
    stat('RBL Alpha', overall.krippendorffAlphaApprox ?? 'N/A', `${overall.ratingCount ?? 0} lượt chấm`),
    ...(isCoordinator() ? [stat('Tài khoản chờ duyệt', pendingUsers, 'Ban tổ chức xử lý')] : [])
  ].join('');
}
function stat(label, value, note) { return `<div class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></div>`; }

function renderOverview() {
  const event = state.data.events.find(e => String(e.eventId) === String(state.selectedEventId));
  const trackMap = mapBy(state.data.tracks, 'trackId');
  const rows = state.data.rankings.map(r => `<tr><td>${r.rankNo}</td><td><strong>${escapeHtml(r.teamName)}</strong><br><small>${escapeHtml(trackMap.get(r.trackId)?.trackName || 'Không rõ hạng mục')}</small></td><td>${escapeHtml(r.finalScore ?? '—')}</td><td>${badge(r.isAdvanced ? 'Advanced' : 'Ranking')}</td></tr>`);
  const timeline = state.data.rounds.map((r, index) => `
    <div class="timeline-item">
      <div class="timeline-index">${index + 1}</div>
      <div class="timeline-box">
        <h4>${escapeHtml(r.roundName)} ${r.isCalibrationRound ? badge('Calibration') : ''}</h4>
        <small>Hạn nộp: ${formatDate(r.submissionDeadline)} · Top N: ${escapeHtml(r.topNAdvance ?? '—')}</small>
      </div>
    </div>`).join('') || '<div class="empty-state">Chưa có vòng thi.</div>';

  $('#tab-overview').innerHTML = `
    <div class="card-grid">
      <div class="card">
        <h3>${escapeHtml(event?.eventName || 'Chưa chọn sự kiện')}</h3>
        <p>${escapeHtml(event?.description || 'Mô tả sự kiện sẽ hiển thị tại đây.')}</p>
        <div class="details-grid">
          <div class="mini-card"><span>Season</span><strong>${escapeHtml(event?.season || '—')} ${escapeHtml(event?.eventYear || '')}</strong></div>
          <div class="mini-card"><span>Trạng thái</span><strong>${badge(event?.status || '—')}</strong></div>
          <div class="mini-card"><span>Bắt đầu</span><strong>${formatDate(event?.startDate)}</strong></div>
          <div class="mini-card"><span>Kết thúc</span><strong>${formatDate(event?.endDate)}</strong></div>
        </div>
      </div>
      <div class="card">
        <h3>Lộ trình vòng thi</h3>
        <div class="timeline">${timeline}</div>
      </div>
    </div>
    <div class="card">
      <div class="table-title"><div><h3>Xếp hạng vòng đang chọn</h3><p>Hệ thống tính theo điểm từng tiêu chí và trọng số.</p></div><span class="badge">Round ranking</span></div>
      ${table(['Rank', 'Đội thi', 'Điểm', 'Trạng thái'], rows, 'Chưa có điểm/xếp hạng cho vòng này.')}
    </div>
    <div class="card-grid three">
      ${state.data.announcements.slice(0, 3).map(a => `<div class="mini-card"><strong>${escapeHtml(a.title)}</strong><p>${escapeHtml(a.content)}</p><span>${badge(a.targetRole || 'All')}</span></div>`).join('') || '<div class="empty-state">Chưa có thông báo.</div>'}
    </div>`;
}

function renderEvents() {
  const eventRows = state.data.events.map(e => `<tr><td><strong>${escapeHtml(e.eventName)}</strong><br><small>${escapeHtml(e.description || '')}</small></td><td>${escapeHtml(e.season)} ${e.eventYear}</td><td>${formatDate(e.startDate)} → ${formatDate(e.endDate)}</td><td>${badge(e.status)}</td></tr>`);
  const roundRows = state.data.rounds.map(r => `<tr><td><strong>${escapeHtml(r.roundName)}</strong></td><td>${r.roundOrder}</td><td>${badge(r.roundType)} ${r.isCalibrationRound ? badge('Calibration') : ''}</td><td>${formatDate(r.submissionDeadline)}</td><td>${escapeHtml(r.topNAdvance ?? '—')}</td></tr>`);
  const trackRows = state.data.tracks.map(t => `<tr><td><strong>${escapeHtml(t.trackName)}</strong></td><td>${escapeHtml(t.description || '')}</td></tr>`);
  const criterionRows = state.data.criteria.map(c => `<tr><td>${escapeHtml(c.criterionName)}</td><td>${escapeHtml(c.maxScore)}</td><td>${escapeHtml(c.weight)}</td><td>${badge(c.isActive ? 'Active' : 'Inactive')}</td></tr>`);

  $('#tab-events').innerHTML = `
    <div class="card-grid">
      <div class="card"><h3>Sự kiện</h3>${table(['Tên sự kiện', 'Mùa', 'Thời gian', 'Trạng thái'], eventRows)}</div>
      <div class="card"><h3>Hạng mục thi đấu</h3>${table(['Hạng mục', 'Mô tả'], trackRows, 'Chưa có hạng mục.')}</div>
    </div>
    <div class="card"><h3>Vòng thi</h3>${table(['Tên vòng', 'Thứ tự', 'Loại vòng', 'Hạn nộp', 'Top N'], roundRows, 'Chưa có vòng thi.')}</div>
    <div class="card"><h3>Rubric / tiêu chí chấm</h3>${table(['Tiêu chí', 'Điểm tối đa', 'Trọng số', 'Trạng thái'], criterionRows, 'Chưa có tiêu chí.')}</div>
    ${isCoordinator() ? coordinatorEventForms() : '<div class="empty-state">Chỉ tài khoản Ban tổ chức mới được tạo/sửa sự kiện, hạng mục, vòng thi và tiêu chí.</div>'}`;
  bindCoordinatorEventForms();
}

function coordinatorEventForms() {
  return `<div class="card"><h3>Thao tác Ban tổ chức</h3><div class="details-grid">
    <details open><summary>Tạo sự kiện</summary>
      <form class="form-stack" id="createEventForm">
        <input name="eventName" required placeholder="SEAL Summer 2026" />
        <div class="form-grid two"><input name="season" required placeholder="Summer" /><input name="eventYear" type="number" required value="2026" /></div>
        <div class="form-grid two"><label>Bắt đầu<input name="startDate" type="date" /></label><label>Kết thúc<input name="endDate" type="date" /></label></div>
        <select name="status"><option>Draft</option><option selected>Open</option><option>Closed</option></select>
        <textarea name="description" placeholder="Mô tả sự kiện"></textarea><button class="btn" type="submit">Tạo sự kiện</button>
      </form>
    </details>
    <details><summary>Tạo hạng mục</summary>
      <form class="form-stack" id="createTrackForm"><input name="trackName" required placeholder="Ứng dụng Web" /><textarea name="description" placeholder="Mô tả hạng mục"></textarea><button class="btn" type="submit">Tạo hạng mục</button></form>
    </details>
    <details><summary>Tạo vòng thi</summary>
      <form class="form-stack" id="createRoundForm"><input name="roundName" required placeholder="Vòng sơ khảo" /><div class="form-grid three"><input name="roundOrder" type="number" required value="1" /><input name="topNAdvance" type="number" value="5" /><select name="roundType"><option>Competition</option><option>Calibration</option></select></div><label>Hạn nộp<input name="submissionDeadline" type="datetime-local" /></label><label class="check"><input name="isCalibrationRound" type="checkbox" /> Vòng hiệu chuẩn</label><button class="btn" type="submit">Tạo vòng thi</button></form>
    </details>
    <details><summary>Thêm tiêu chí</summary>
      <form class="form-stack" id="createCriterionForm"><input name="criterionName" required placeholder="Hiện thực kỹ thuật" /><div class="form-grid two"><input name="maxScore" type="number" step="0.1" value="10" /><input name="weight" type="number" step="0.01" value="0.25" /></div><button class="btn" type="submit">Thêm tiêu chí</button></form>
    </details>
  </div></div>`;
}

function renderTeams() {
  const trackMap = mapBy(state.data.tracks, 'trackId');
  const teamRows = state.data.teams.map(t => `<tr><td><strong>${escapeHtml(t.teamName)}</strong><br><small>ID: ${t.teamId} · Leader: ${t.leaderId}</small></td><td>${escapeHtml(trackMap.get(t.trackId)?.trackName || '—')}</td><td>${badge(t.status)}</td><td>${formatDate(t.createdAt)}</td><td>${isCoordinator() ? `<div class="action-row"><button class="btn secondary" data-approve-team="${t.teamId}" type="button">Duyệt</button><button class="btn danger" data-reject-team="${t.teamId}" type="button">Từ chối</button></div>` : '—'}</td></tr>`);
  const teamMap = mapBy(state.data.teams, 'teamId');
  const submissionRows = state.data.submissions.map(s => `<tr><td>${s.submissionId}</td><td><strong>${escapeHtml(teamMap.get(s.teamId)?.teamName || `Team ${s.teamId}`)}</strong></td><td><a class="code-link" href="${escapeHtml(s.repositoryUrl || '#')}" target="_blank">Repository</a><br><a class="code-link" href="${escapeHtml(s.demoUrl || '#')}" target="_blank">Demo</a><br><a class="code-link" href="${escapeHtml(s.reportUrl || '#')}" target="_blank">Report</a></td><td>${formatDate(s.submittedAt)}</td><td>${s.isEliminated ? badge('Eliminated') : badge('Valid')}</td></tr>`);

  $('#tab-teams').innerHTML = `
    <div class="card"><h3>Đội thi theo sự kiện</h3>${table(['Đội', 'Hạng mục', 'Trạng thái', 'Ngày tạo', 'Thao tác'], teamRows, 'Chưa có đội thi.')}</div>
    <div class="card"><h3>Bài nộp vòng đang chọn</h3>${table(['ID', 'Đội', 'URL nộp bài', 'Thời gian nộp', 'Trạng thái'], submissionRows, 'Chưa có bài nộp.')}</div>
    <div class="card"><h3>Thao tác đội thi / nộp bài</h3><div class="details-grid">
      ${isTeamMember() || isCoordinator() ? `<details open><summary>Tạo đội mới</summary><form class="form-stack" id="createTeamForm"><select name="trackId" required>${optionList(state.data.tracks, 'trackId', 'trackName')}</select><input name="teamName" required placeholder="Tên đội thi" /><button class="btn" type="submit">Tạo đội</button></form></details>` : ''}
      ${(isTeamMember() || isCoordinator()) ? `<details open><summary>Nộp bài theo vòng</summary><form class="form-stack" id="submitWorkForm"><select name="teamId" required>${optionList(state.data.teams, 'teamId', 'teamName')}</select><select name="roundId" required>${optionList(state.data.rounds, 'roundId', 'roundName', state.selectedRoundId)}</select><input name="repositoryUrl" placeholder="GitHub/GitLab repository URL" /><input name="demoUrl" placeholder="Demo URL" /><input name="reportUrl" placeholder="Report/Slide URL" /><button class="btn" type="submit">Lưu bài nộp</button></form></details>` : ''}
      ${isCoordinator() ? `<details><summary>Thêm thành viên đội</summary><form class="form-stack" id="addMemberForm"><select name="teamId" required>${optionList(state.data.teams, 'teamId', 'teamName')}</select><select name="userId" required>${optionList(state.data.users.filter(u => u.roleName === 'TeamMember'), 'userId', 'fullName')}</select><select name="memberRole"><option>Member</option><option>Leader</option></select><button class="btn" type="submit">Thêm thành viên</button></form></details><details><summary>Loại bài nộp vi phạm</summary><form class="form-stack" id="eliminateSubmissionForm"><select name="submissionId" required>${optionList(state.data.submissions, 'submissionId', 'submissionId')}</select><textarea name="reason" required placeholder="Lý do loại bài"></textarea><button class="btn danger" type="submit">Loại bài nộp</button></form></details>` : ''}
    </div></div>`;
  bindTeamForms();
}

function renderScoring() {
  const criterionOptions = optionList(state.data.criteria, 'criterionId', 'criterionName');
  const submissionOptions = state.data.submissions.map(s => `<option value="${s.submissionId}">#${s.submissionId} · Team ${s.teamId}</option>`).join('');
  const assignmentRows = state.data.assignments.map(a => `<tr><td>${a.assignmentId}</td><td>${escapeHtml(state.data.rounds.find(r => r.roundId === a.roundId)?.roundName || a.roundId)}</td><td>${escapeHtml(state.data.tracks.find(t => t.trackId === a.trackId)?.trackName || a.trackId)}</td><td>${escapeHtml(state.data.users.find(u => u.userId === a.judgeId)?.fullName || a.judgeId)}</td></tr>`);
  const rankingRows = state.data.rankings.map(r => `<tr><td>${r.rankNo}</td><td>${escapeHtml(r.teamName)}</td><td>${escapeHtml(r.finalScore)}</td><td>${badge(r.isAdvanced ? 'Advanced' : 'Not advanced')}</td></tr>`);

  $('#tab-scoring').innerHTML = `
    <div class="card-grid">
      <div class="card"><h3>Phân công giám khảo</h3>${table(['ID', 'Vòng', 'Hạng mục', 'Giám khảo'], assignmentRows, 'Chưa có phân công.')}</div>
      <div class="card"><h3>Kết quả xếp hạng</h3>${table(['Rank', 'Đội', 'Điểm', 'Kết quả'], rankingRows, 'Chưa có xếp hạng.')}</div>
    </div>
    <div class="card"><h3>Thao tác chấm điểm</h3><div class="details-grid">
      ${isJudge() ? `<details open><summary>Chấm điểm bài nộp</summary><form class="form-stack" id="scoreForm"><select name="submissionId" required>${submissionOptions}</select><select name="criterionId" required>${criterionOptions}</select><input name="scoreValue" type="number" min="0" max="10" step="0.1" required placeholder="Điểm" /><textarea name="comment" placeholder="Nhận xét"></textarea><button class="btn" type="submit">Lưu điểm</button></form></details>` : '<div class="empty-state">Chỉ Judge hoặc Guest Judge mới được chấm điểm.</div>'}
      ${isCoordinator() ? `<details open><summary>Gán giám khảo vào vòng/hạng mục</summary><form class="form-stack" id="assignJudgeForm"><select name="roundId" required>${optionList(state.data.rounds, 'roundId', 'roundName', state.selectedRoundId)}</select><select name="trackId" required>${optionList(state.data.tracks, 'trackId', 'trackName')}</select><select name="judgeId" required>${optionList(state.data.users.filter(u => ['Judge','GuestJudge'].includes(u.roleName)), 'userId', 'fullName')}</select><button class="btn" type="submit">Phân công giám khảo</button></form></details><details><summary>Tính kết quả thăng vòng</summary><button class="btn" id="evaluateRoundBtn" type="button">Tính xếp hạng & thăng vòng</button></details>` : ''}
    </div></div>`;
  bindScoringForms();
}

function renderRbl() {
  const summary = state.data.reliability || {};
  const overall = summary.overall || {};
  const criteria = summary.byCriterion || [];
  const judgeTypeRows = (summary.judgeTypeAverageScores || []).map(j => `<tr><td>${badge(j.judgeType)}</td><td>${j.scoreCount}</td><td>${j.averageScore}</td></tr>`);
  const criterionRows = criteria.map(c => `<tr><td>${escapeHtml(c.criterionName)}</td><td>${escapeHtml(c.eligibleUnitCount)}</td><td>${escapeHtml(c.iccOneWayApprox ?? 'N/A')}</td><td>${escapeHtml(c.krippendorffAlphaApprox ?? 'N/A')}</td><td>${escapeHtml(c.averageRange ?? 'N/A')}</td></tr>`);
  const varianceRows = state.data.variance.map(v => `<tr><td>${escapeHtml(v.roundName)}</td><td>${escapeHtml(v.trackName)}</td><td>${escapeHtml(v.criterionName)}</td><td>${escapeHtml(v.judgeCount)}</td><td>${escapeHtml(v.averageScore)}</td><td>${escapeHtml(v.scoreRange)}</td><td>${escapeHtml(v.scoreVariance)}</td></tr>`);
  const varianceMax = Math.max(1, ...state.data.variance.map(v => Number(v.scoreVariance || 0)));
  const bars = state.data.variance.slice(0, 8).map(v => {
    const width = Math.round((Number(v.scoreVariance || 0) / varianceMax) * 100);
    return `<div class="kpi-row"><span>${escapeHtml(v.criterionName)}</span><div class="progress-bar"><span style="--w:${width}%"></span></div><b>${escapeHtml(v.scoreVariance)}</b></div>`;
  }).join('') || '<div class="empty-state">Chưa đủ dữ liệu phương sai.</div>';

  $('#tab-rbl').innerHTML = `
    <div class="card-grid three">
      <div class="mini-card"><span>ICC one-way xấp xỉ</span><strong>${escapeHtml(overall.iccOneWayApprox ?? 'N/A')}</strong><p>${escapeHtml(overall.interpretation || 'Chưa đủ dữ liệu.')}</p></div>
      <div class="mini-card"><span>Krippendorff’s α xấp xỉ</span><strong>${escapeHtml(overall.krippendorffAlphaApprox ?? 'N/A')}</strong><p>${escapeHtml(overall.ratingCount ?? 0)} lượt chấm hợp lệ.</p></div>
      <div class="mini-card"><span>Judge type gap</span><strong>${escapeHtml(summary.judgeTypeScoreGap ?? 'N/A')}</strong><p>So sánh SE Faculty/Judge và Guest Judge.</p></div>
    </div>
    <div class="card"><h3>Phương sai điểm giữa giám khảo</h3><div class="kpi-stack">${bars}</div></div>
    <div class="card-grid">
      <div class="card"><h3>Độ tin cậy theo tiêu chí</h3>${table(['Tiêu chí', 'Unit', 'ICC', 'Alpha', 'Range'], criterionRows, 'Chưa đủ dữ liệu theo tiêu chí.')}</div>
      <div class="card"><h3>Điểm trung bình theo loại giám khảo</h3>${table(['Loại giám khảo', 'Số lượt chấm', 'Điểm TB'], judgeTypeRows, 'Chưa có dữ liệu.')}</div>
    </div>
    <div class="card"><div class="table-title"><h3>Dataset phương sai</h3><a class="btn small secondary" href="/api/research/event/${state.selectedEventId}/judge-scores.csv" target="_blank">Tải CSV ẩn danh</a></div>${table(['Vòng', 'Track', 'Tiêu chí', 'Số judge', 'TB', 'Range', 'Variance'], varianceRows, 'Chưa có dữ liệu RBL.')}</div>`;
}

function renderAdmin() {
  if (!isCoordinator()) {
    $('#tab-admin').innerHTML = '<div class="empty-state">Tab này dành cho Event Coordinator / PDP Staff.</div>';
    return;
  }
  const userRows = state.data.users.map(u => `<tr><td><strong>${escapeHtml(u.fullName)}</strong><br><small>${escapeHtml(u.email)}</small></td><td>${badge(u.roleName)}</td><td>${escapeHtml(u.userType)}</td><td>${u.isApproved ? badge('Approved') : badge('Pending')}</td><td>${u.fptStudentCode || u.externalStudentCode || '—'}<br><small>${escapeHtml(u.universityName || '')}</small></td><td><div class="action-row"><button class="btn secondary" data-approve-user="${u.userId}" type="button">Duyệt</button><button class="btn danger" data-reject-user="${u.userId}" type="button">Từ chối</button></div></td></tr>`);
  const mentorRows = state.data.assignments.length;
  const auditRows = state.data.auditLogs.slice().reverse().slice(0, 25).map(l => `<tr><td>${formatDate(l.createdAt)}</td><td>${escapeHtml(l.actionName)}</td><td>${escapeHtml(l.entityName)} #${escapeHtml(l.entityId ?? '')}</td><td>${escapeHtml(l.newValue || '')}</td></tr>`);
  $('#tab-admin').innerHTML = `
    <div class="card"><h3>Quản lý tài khoản & phê duyệt</h3>${table(['Người dùng', 'Vai trò', 'Loại', 'Duyệt', 'Mã SV/Trường', 'Thao tác'], userRows, 'Chưa có người dùng.')}</div>
    <div class="card-grid">
      <div class="card"><h3>Tạo tài khoản staff / guest judge</h3><form class="form-stack" id="createStaffForm"><div class="form-grid two"><input name="fullName" required placeholder="Họ tên" /><input name="email" type="email" required placeholder="email@seal.edu.vn" /></div><div class="form-grid two"><input name="password" required value="123456" /><select name="roleName"><option>Mentor</option><option>Judge</option><option>GuestJudge</option><option>EventCoordinator</option></select></div><button class="btn" type="submit">Tạo tài khoản</button></form></div>
      <div class="card"><h3>Phân công mentor cho hạng mục</h3><form class="form-stack" id="assignMentorForm"><select name="trackId" required>${optionList(state.data.tracks, 'trackId', 'trackName')}</select><select name="mentorId" required>${optionList(state.data.users.filter(u => u.roleName === 'Mentor'), 'userId', 'fullName')}</select><button class="btn" type="submit">Gán mentor</button></form><p>Phân công hiện có của giám khảo: <b>${mentorRows}</b> assignment.</p></div>
    </div>
    <div class="card"><h3>Audit log gần nhất</h3>${table(['Thời gian', 'Hành động', 'Đối tượng', 'Giá trị mới'], auditRows, 'Chưa có audit log.')}</div>`;
  bindAdminForms();
}

function bindCoordinatorEventForms() {
  $('#createEventForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const payload = {
      eventName: f.get('eventName'),
      season: f.get('season'),
      eventYear: Number(f.get('eventYear')),
      startDate: f.get('startDate') || null,
      endDate: f.get('endDate') || null,
      status: f.get('status') || 'Draft',
      description: f.get('description') || ''
    };
    await submitAction(() => api('/api/events', { method: 'POST', body: JSON.stringify(payload) }), 'Đã tạo sự kiện.');
  });
  $('#createTrackForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    await submitAction(() => api('/api/tracks', { method: 'POST', body: JSON.stringify({ eventId: Number(state.selectedEventId), trackName: f.get('trackName'), description: f.get('description') }) }), 'Đã tạo hạng mục.');
  });
  $('#createRoundForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    const payload = { eventId: Number(state.selectedEventId), roundName: f.get('roundName'), roundOrder: Number(f.get('roundOrder')), topNAdvance: Number(f.get('topNAdvance') || 0), roundType: f.get('roundType'), isCalibrationRound: Boolean(f.get('isCalibrationRound')), submissionDeadline: f.get('submissionDeadline') || null };
    await submitAction(() => api('/api/rounds', { method: 'POST', body: JSON.stringify(payload) }), 'Đã tạo vòng thi.');
  });
  $('#createCriterionForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    await submitAction(() => api('/api/event-criteria', { method: 'POST', body: JSON.stringify({ eventId: Number(state.selectedEventId), criterionName: f.get('criterionName'), maxScore: Number(f.get('maxScore')), weight: Number(f.get('weight')) }) }), 'Đã thêm tiêu chí.');
  });
}

function bindTeamForms() {
  $('#createTeamForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    await submitAction(() => api('/api/teams', { method: 'POST', body: JSON.stringify({ eventId: Number(state.selectedEventId), trackId: Number(f.get('trackId')), teamName: f.get('teamName') }) }), 'Đã tạo đội, chờ phê duyệt.');
  });
  $('#submitWorkForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    await submitAction(() => api('/api/submissions', { method: 'POST', body: JSON.stringify({ teamId: Number(f.get('teamId')), roundId: Number(f.get('roundId')), repositoryUrl: f.get('repositoryUrl'), demoUrl: f.get('demoUrl'), reportUrl: f.get('reportUrl') }) }), 'Đã lưu bài nộp.');
  });
  $('#addMemberForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    await submitAction(() => api('/api/team-members', { method: 'POST', body: JSON.stringify({ teamId: Number(f.get('teamId')), userId: Number(f.get('userId')), memberRole: f.get('memberRole') }) }), 'Đã thêm thành viên.');
  });
  $('#eliminateSubmissionForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    await submitAction(() => api(`/api/submissions/${f.get('submissionId')}/eliminate`, { method: 'POST', body: JSON.stringify({ reason: f.get('reason') }) }), 'Đã loại bài nộp và ghi audit log.');
  });
  $$('[data-approve-team]').forEach(btn => btn.addEventListener('click', () => submitAction(() => api(`/api/teams/${btn.dataset.approveTeam}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Approved', reason: 'Đủ điều kiện 3–5 thành viên' }) }), 'Đã duyệt đội.')));
  $$('[data-reject-team]').forEach(btn => btn.addEventListener('click', () => submitAction(() => api(`/api/teams/${btn.dataset.rejectTeam}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Rejected', reason: 'Không đủ điều kiện/vi phạm quy chế' }) }), 'Đã cập nhật trạng thái đội.')));
}

function bindScoringForms() {
  $('#scoreForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    await submitAction(() => api('/api/scores', { method: 'POST', body: JSON.stringify({ submissionId: Number(f.get('submissionId')), criterionId: Number(f.get('criterionId')), scoreValue: Number(f.get('scoreValue')), comment: f.get('comment') }) }), 'Đã lưu điểm chấm.');
  });
  $('#assignJudgeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    await submitAction(() => api('/api/judge-assignments', { method: 'POST', body: JSON.stringify({ roundId: Number(f.get('roundId')), trackId: Number(f.get('trackId')), judgeId: Number(f.get('judgeId')) }) }), 'Đã phân công giám khảo.');
  });
  $('#evaluateRoundBtn')?.addEventListener('click', () => submitAction(() => api(`/api/rounds/${state.selectedRoundId}/evaluate-elimination`, { method: 'POST' }), 'Đã tính kết quả vòng.'));
}

function bindAdminForms() {
  $$('[data-approve-user]').forEach(btn => btn.addEventListener('click', () => submitAction(() => api(`/api/admin/approveUser/${btn.dataset.approveUser}`, { method: 'POST' }), 'Đã duyệt tài khoản.')));
  $$('[data-reject-user]').forEach(btn => btn.addEventListener('click', () => submitAction(() => api(`/api/admin/rejectUser/${btn.dataset.rejectUser}`, { method: 'POST', body: JSON.stringify({ reason: 'Không đủ điều kiện tham gia' }) }), 'Đã từ chối tài khoản.')));
  $('#createStaffForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    await submitAction(() => api('/api/admin/create-staff-account', { method: 'POST', body: JSON.stringify({ fullName: f.get('fullName'), email: f.get('email'), password: f.get('password'), roleName: f.get('roleName'), userType: 'Staff' }) }), 'Đã tạo tài khoản staff.');
  });
  $('#assignMentorForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    await submitAction(() => api('/api/track-mentors', { method: 'POST', body: JSON.stringify({ trackId: Number(f.get('trackId')), mentorId: Number(f.get('mentorId')) }) }), 'Đã gán mentor cho hạng mục.');
  });
}

async function submitAction(action, successMessage) {
  try {
    await action();
    notify('dashboardNotice', successMessage, 'success');
    await loadDashboard();
  } catch (err) {
    notify('dashboardNotice', err.message || 'Thao tác không thành công', 'error');
  }
}

function bindGlobalEvents() {
  $$('[data-auth-tab]').forEach(btn => btn.addEventListener('click', () => setAuthTab(btn.dataset.authTab)));
  $$('[data-demo]').forEach(btn => btn.addEventListener('click', () => {
    $('#loginEmail').value = btn.dataset.demo;
    $('#loginPassword').value = '123456';
  }));
  $('#studentType')?.addEventListener('change', (e) => {
    const isExternal = e.target.value === 'EXTERNAL';
    $('#fptFields').classList.toggle('hidden', isExternal);
    $('#externalFields').classList.toggle('hidden', !isExternal);
  });
  $('#loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: $('#loginEmail').value.trim(), password: $('#loginPassword').value }) });
      state.token = data.token; state.user = data;
      localStorage.setItem('seal_token', data.token); localStorage.setItem('seal_user', JSON.stringify(data));
      notify('authNotice', `Đăng nhập thành công: ${data.fullName}`, 'success');
      setAuthVisibility();
      await loadDashboard();
      location.hash = '#dashboard';
    } catch (err) { notify('authNotice', err.message || 'Đăng nhập thất bại', 'error'); }
  });
  $('#registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const st = $('#studentType').value;
    const payload = { fullName: $('#regFullName').value.trim(), email: $('#regEmail').value.trim(), password: $('#regPassword').value, studentType: st, fptStudentCode: $('#fptStudentCode').value.trim(), externalStudentCode: $('#externalStudentCode').value.trim(), universityName: $('#universityName').value.trim() };
    try { await api('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }); notify('authNotice', 'Đăng ký thành công. Tài khoản đang chờ Ban tổ chức phê duyệt.', 'success'); setAuthTab('login'); } catch (err) { notify('authNotice', err.message || 'Đăng ký thất bại', 'error'); }
  });
  $('#forgotForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try { const data = await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: $('#forgotEmail').value.trim() }) }); $('#resetCode').value = data.resetCodeForDemo || ''; notify('authNotice', data.resetCodeForDemo ? `${data.message} Mã demo: ${data.resetCodeForDemo}` : data.message, 'success'); } catch (err) { notify('authNotice', err.message || 'Không thể tạo mã đặt lại', 'error'); }
  });
  $('#resetPasswordBtn')?.addEventListener('click', async () => {
    try { const data = await api('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email: $('#forgotEmail').value.trim(), resetCode: $('#resetCode').value.trim(), newPassword: $('#newPassword').value }) }); notify('authNotice', data.message, 'success'); setAuthTab('login'); } catch (err) { notify('authNotice', err.message || 'Không thể đặt lại mật khẩu', 'error'); }
  });
  $('#logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('seal_token');
    localStorage.removeItem('seal_user');
    state.token = '';
    state.user = null;
    state.data = { events: [], tracks: [], rounds: [], teams: [], submissions: [], criteria: [], users: [], assignments: [], rankings: [], variance: [], reliability: null, auditLogs: [], prizes: [], announcements: [] };
    setAuthVisibility();
    location.hash = '#home';
  });
  $('#reloadBtn')?.addEventListener('click', loadDashboard);
  $('#eventSelect')?.addEventListener('change', async (e) => { state.selectedEventId = Number(e.target.value); state.selectedRoundId = null; await loadEventScopedData(); renderDashboard(); });
  $('#roundSelect')?.addEventListener('change', async (e) => { state.selectedRoundId = Number(e.target.value); await loadEventScopedData(); renderDashboard(); });
  $$('.side-link').forEach(btn => btn.addEventListener('click', () => {
    state.activeTab = btn.dataset.tab;
    $$('.side-link').forEach(b => b.classList.toggle('active', b.dataset.tab === state.activeTab));
    $$('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `tab-${state.activeTab}`));
  }));
  $('#themeToggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? '' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('seal_theme', next);
  });
}

function boot() {
  document.documentElement.dataset.theme = localStorage.getItem('seal_theme') || '';
  bindGlobalEvents();
  if (state.token && !state.user) {
    localStorage.removeItem('seal_token');
    state.token = '';
  }
  setAuthVisibility();
  if (state.token && state.user) loadDashboard();
}

document.addEventListener('DOMContentLoaded', boot);
