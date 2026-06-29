import { Route, Routes } from "react-router-dom";
import { AppProvider } from "./auth/AppContext";
import Home from "./pages/Home";
import AuthCallback from "./pages/AuthCallback";

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </AppProvider>
  );
}
