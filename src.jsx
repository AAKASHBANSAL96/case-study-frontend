import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import "./dashboardExtras.css";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
async function request(path, options = {}, token) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
function Login({ onLogin }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, role: "admin" }),
      });
      localStorage.setItem("health_token", data.token);
      localStorage.setItem("health_user", JSON.stringify(data.user));
      onLogin(data);
    } catch (x) {
      setError(x.message);
    }
  }
  return (
    <main className="login">
      <form onSubmit={submit}>
        <p className="eyebrow">HEALTHCHECK OPS</p>
        <h1>Sign in</h1>
        <p>Review reliability signals and CSV imports.</p>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button>Sign in</button>
      </form>
    </main>
  );
}
function RoleLogin({ onLogin }) {
  const [role, setRole] = useState(null), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState('');
  async function submit(e) { e.preventDefault(); try { const data = await request('/auth/role-login', { method: 'POST', body: JSON.stringify({ email, password, expectedRole: role }) }); localStorage.setItem('health_token', data.token); localStorage.setItem('health_user', JSON.stringify(data.user)); onLogin(data); } catch (x) { setError(x.message); } }
  if (!role) return <main className="login"><div className="rolePicker"><p className="eyebrow">HEALTHCHECK OPS</p><h1>Choose your workspace</h1><p>Administrators upload data and create viewer accounts. Viewers can review dashboard data.</p><button onClick={() => setRole('admin')}>Admin login</button><button className="ghost" onClick={() => setRole('viewer')}>Viewer login</button></div></main>;
  return <main className="login"><form onSubmit={submit}><button type="button" className="back" onClick={() => setRole(null)}>← Back</button><p className="eyebrow">{role.toUpperCase()} WORKSPACE</p><h1>{role === 'admin' ? 'Admin login' : 'Viewer login'}</h1><p>Enter the credentials for this role.</p><input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} /><input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />{error && <p className="error">{error}</p>}<button>Sign in</button></form></main>;
}
function ViewerRegistration({ token }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [notice, setNotice] = useState('');
  async function submit(e) { e.preventDefault(); try { await request('/auth/users', { method: 'POST', body: JSON.stringify({ email, password, role: 'viewer' }) }, token); setNotice(`Viewer account created for ${email}`); setEmail(''); setPassword(''); } catch (x) { setNotice(x.message); } }
  return <section className="panel viewerRegister"><div><h2>Register a viewer</h2><span>Viewer accounts can access dashboards and logs, but cannot upload CSV files.</span></div><form onSubmit={submit}><input type="email" required placeholder="Viewer email" value={email} onChange={e => setEmail(e.target.value)} /><input type="password" required minLength="8" placeholder="Temporary password" value={password} onChange={e => setPassword(e.target.value)} /><button>Create viewer</button></form>{notice && <p className="notice">{notice}</p>}</section>;
}
function App() {
  const [session, setSession] = useState(() =>
    localStorage.getItem("health_token")
      ? {
          token: localStorage.getItem("health_token"),
          user: JSON.parse(localStorage.getItem("health_user") || "{}"),
        }
      : null,
  );
  const [stats, setStats] = useState(null),
    [logs, setLogs] = useState([]),
    [services, setServices] = useState([]),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [service, setService] = useState(""),
    [collapsed, setCollapsed] = useState(false),
    [message, setMessage] = useState(""),
    [loading, setLoading] = useState(false);
  const query = () =>
    new URLSearchParams(
      Object.fromEntries(
        Object.entries({ start, end, service }).filter(([, v]) => v),
      ),
    ).toString();
  async function load() {
    if (!session) return;
    try {
      const q = query();
      const [s, l] = await Promise.all([
        request(`/stats?${q}`, {}, session.token),
        request(`/checks?${q}`, {}, session.token),
      ]);
      setStats(s);
      setLogs(l.items);
      setServices(l.services);
    } catch (x) {
      setMessage(x.message);
      if (x.message === "Authentication required") {
        localStorage.removeItem("health_token");
        setSession(null);
      }
    }
  }
  useEffect(() => {
    load();
  }, [session, start, end, service]);
  async function upload(file) {
    setLoading(true);
    setMessage("");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let text = "";
      for (const b of bytes) text += String.fromCharCode(b);
      const result = await request(
        "/uploads",
        {
          method: "POST",
          body: JSON.stringify({ filename: file.name, csvBase64: btoa(text) }),
        },
        session.token,
      );
      setMessage(
        `Imported ${result.acceptedRows}/${result.totalRows} records. Rejected: ${result.rejectedRows}. ${Object.entries(
          result.rejectionReasons,
        )
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")}`,
      );
      load();
    } catch (x) {
      setMessage(x.message);
    } finally {
      setLoading(false);
    }
  }
if (!session) return <RoleLogin onLogin={setSession} />;
  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">HEALTHCHECK OPS</p>
          <h1>Service reliability</h1>
        </div>
        <div className="headerActions">
          {session.user?.role === "admin" && (
            <>
              <a className="button" href="/admin-register.html">Register viewer</a>
              <a className="ghost navLink" href="/data-management.html">Manage data</a>
              <label className="button">
                {loading ? "Importing…" : "Upload CSV"}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  disabled={loading}
                  onChange={(e) => e.target.files[0] && upload(e.target.files[0])}
                />
              </label>
            </>
          )}
          <button
            className="ghost"
            onClick={() => {
              localStorage.removeItem("health_token");
              localStorage.removeItem("health_user");
              setSession(null);
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      {message && <p className="notice">{message}</p>}
      <section className="panel">
        <div className="panelHead">
          <div>
            <h2>Operational snapshot</h2>
            <span>Calculated from the selected monitoring period</span>
          </div>
          <button className="ghost" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>
        {!collapsed && (
          <>
            <div className="cards">
              <Metric
                label="Availability"
                value={`${stats?.availability ?? 0}%`}
                tone="good"
              />
              <Metric
                label="Failed checks"
                value={stats?.failures ?? 0}
                tone="bad"
              />
              <Metric
                label="Average latency"
                value={`${stats?.avgLatency ?? 0} ms`}
              />
              <Metric label="P95 latency" value={`${stats?.p95 ?? 0} ms`} />
              <Metric label="Total checks" value={stats?.total ?? 0} />
            </div>
            <div className="serviceList">
              {stats?.services.map((x) => (
                <div key={x._id}>
                  <strong>{x._id}</strong>
                  <span>
                    {x.checks - x.failures}/{x.checks} successful ·{" "}
                    {Math.round(x.avgLatency)} ms avg
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      <section className="panel">
        <div className="panelHead">
          <div>
            <h2>Check logs</h2>
            <span>{logs.length} most recent matching records</span>
          </div>
        </div>
        <div className="filters">
          <label>
            From
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <label>
            Service
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="">All services</option>
              {services.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <button
            className="ghost"
            onClick={() => {
              setStart("");
              setEnd("");
              setService("");
            }}
          >
            Clear
          </button>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Service</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Agent / region</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((x) => (
                <tr key={x._id}>
                  <td>{new Date(x.checkedAt).toLocaleString()}</td>
                  <td>{x.service}</td>
                  <td>
                    <span
                      className={
                        x.statusCode >= 400 ? "status bad" : "status good"
                      }
                    >
                      {x.statusCode}
                    </span>
                  </td>
                  <td>{x.latencyMs} ms</td>
                  <td>
                    {x.agent} / {x.region}
                  </td>
                </tr>
              ))}
              {!logs.length && (
                <tr>
                  <td colSpan="5" className="empty">
                    No monitoring checks match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
function Metric({ label, value, tone = "" }) {
  return (
    <div className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
