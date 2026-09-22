import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './admin.css';
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
function DataManagement() {
  const token = localStorage.getItem('health_token'); const user = JSON.parse(localStorage.getItem('health_user') || '{}');
  const [reason, setReason] = useState(''), [history, setHistory] = useState([]), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  async function loadHistory() { const response = await fetch(`${API}/data/clear-history`, { headers: { Authorization: `Bearer ${token}` } }); if (response.ok) setHistory(await response.json()); }
  useEffect(() => { if (token && user.role === 'admin') loadHistory(); }, []);
  if (!token || user.role !== 'admin') return <main className="adminPage"><section><h1>Admin access required</h1><a href="/">Return to sign in</a></section></main>;
  async function clearData() { if (!confirm('This permanently deletes all imported check logs and upload records. Continue?')) return; setBusy(true); setMessage(''); try { const response = await fetch(`${API}/data`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ reason }) }); const body = await response.json(); setMessage(response.ok ? `${body.deletedChecks} checks and ${body.deletedUploads} upload records cleared. The action was saved to MongoDB.` : body.message); setReason(''); loadHistory(); } finally { setBusy(false); } }
  return <main className="adminPage"><section><p>HEALTHCHECK OPS / ADMIN</p><h1>Data management</h1><span>Clear all imported monitoring data. The clear action itself remains saved as an audit record in MongoDB.</span><textarea placeholder="Optional reason for clearing the data" value={reason} onChange={e => setReason(e.target.value)} /><button disabled={busy} onClick={clearData}>{busy ? 'Clearing…' : 'Clear all monitoring data'}</button>{message && <div className="message">{message}</div>}<h2>Clear history</h2><div>{history.length ? history.map(x => <p key={x._id}><b>{x.deletedChecks} checks removed</b><br/><small>{new Date(x.createdAt).toLocaleString()} · {x.clearedByEmail}{x.reason ? ` · ${x.reason}` : ''}</small></p>) : <small>No clear actions recorded.</small>}</div><a href="/">Back to dashboard</a></section></main>;
}
createRoot(document.getElementById('root')).render(<DataManagement />);
