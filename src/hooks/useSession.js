import { useState } from "react";

const TOKEN_KEY = "health_token";
const USER_KEY = "health_user";
function getStoredSession() { const token = localStorage.getItem(TOKEN_KEY); if (!token) return null; try { return { token, user: JSON.parse(localStorage.getItem(USER_KEY) || "{}") }; } catch { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); return null; } }
export function useSession() { const [data, setData] = useState(getStoredSession); function save(session) { localStorage.setItem(TOKEN_KEY, session.token); localStorage.setItem(USER_KEY, JSON.stringify(session.user)); setData(session); } function clear() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setData(null); } return { data, save, clear }; }
