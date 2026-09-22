import { useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import DataManagementPage from "./pages/DataManagementPage";
import LoginPage from "./pages/LoginPage";
import RegisterViewerPage from "./pages/RegisterViewerPage";
import { useSession } from "./hooks/useSession";

const routes = { "/": DashboardPage, "/admin/register": RegisterViewerPage, "/admin/data": DataManagementPage };

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);
  useEffect(() => { const update = () => setPathname(window.location.pathname); window.addEventListener("popstate", update); return () => window.removeEventListener("popstate", update); }, []);
  return pathname;
}

export default function App() {
  const session = useSession();
  const Page = routes[usePathname()] || DashboardPage;
  return session.data ? <Page session={session.data} onLogout={session.clear} /> : <LoginPage onLogin={session.save} />;
}
