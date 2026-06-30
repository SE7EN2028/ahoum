import { Route, Routes } from "react-router-dom";
import { AppProvider } from "./auth/AppContext";
import Home from "./pages/Home";
import SessionDetail from "./pages/SessionDetail";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import Overlays from "./components/Overlays";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Overlays />
    </AppProvider>
  );
}
