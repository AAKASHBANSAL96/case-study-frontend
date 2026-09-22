import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './admin.css';
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
function Register() {
  const token = localStorage.getItem('health_token'); const user = JSON.parse(localStorage.getItem('health_user') || '{}');
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [message, setMessage] = useState('');
  if (!token || user.role !== 'admin') return <main className="adminPage"><section><h1>Admin access required</h1><a href="/">Return to sign in</a></section></main>;
  async function submit(e) { e.preventDefault(); setMessage(''); const response = await fetch(`${API}/auth/users`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, password, role: 'viewer' }) }); const body = await response.json(); setMessage(response.ok ? `Viewer account created: ${body.email}` : body.message); if (response.ok) { setEmail(''); setPassword(''); } }
  return <main className="adminPage"><section><p>HEALTHCHECK OPS / ADMIN</p><h1>Register viewer</h1><span>Viewers can use the separate Viewer Login page to access logs and statistics.</span><form onSubmit={submit}><input type="email" required placeholder="Viewer email" value={email} onChange={e => setEmail(e.target.value)} /><input type="password" required minLength="8" placeholder="Temporary password" value={password} onChange={e => setPassword(e.target.value)} /><button>Create viewer account</button></form>{message && <div className="message">{message}</div>}<a href="/">Back to dashboard</a></section></main>;
}
createRoot(document.getElementById('root')).render(<Register />);
