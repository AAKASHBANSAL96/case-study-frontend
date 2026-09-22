import { useState } from "react";
import { request } from "../services/api";

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState(null); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState("");
  async function submit(event) { event.preventDefault(); setError(""); try { onLogin(await request("/auth/role-login", { method: "POST", body: JSON.stringify({ email, password, expectedRole: role }) })); } catch (requestError) { setError(requestError.message); } }
  if (!role) return <main className="login"><div className="rolePicker"><p className="eyebrow">HEALTHCHECK OPS</p><h1>Choose your workspace</h1><p>Administrators upload data and create viewer accounts. Viewers can review dashboard data.</p><button onClick={() => setRole("admin")}>Admin login</button><button className="ghost" onClick={() => setRole("viewer")}>Viewer login</button></div></main>;
  return <main className="login"><form onSubmit={submit}><button type="button" className="back" onClick={() => setRole(null)}>← Back</button><p className="eyebrow">{role.toUpperCase()} WORKSPACE</p><h1>{role === "admin" ? "Admin login" : "Viewer login"}</h1><p>Enter the credentials for this role.</p><input type="email" placeholder="Email" required value={email} onChange={(event) => setEmail(event.target.value)} /><input type="password" placeholder="Password" required value={password} onChange={(event) => setPassword(event.target.value)} />{error && <p className="error">{error}</p>}<button>Sign in</button></form></main>;
}
