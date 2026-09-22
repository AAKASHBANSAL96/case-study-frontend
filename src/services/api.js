const API_URL = import.meta.env.VITE_API_URL || "https://case-study-backend-production-36df.up.railway.app";

export async function request(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
