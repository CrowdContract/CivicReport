import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import { ThemeProvider } from "./context/theme";
import { SocketProvider } from "./context/socket";
import ModernNav from "./components/nav/ModernNav";
import { Toaster } from "react-hot-toast";

// Import modern styles
import "./styles/modern.css";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ModernDashboard from "./pages/ModernDashboard";
import ModernCreateReport from "./pages/ModernCreateReport";
import AIReportCreate from "./pages/AIReportCreate";
import ReportView from "./pages/ReportView";
import Reports from "./pages/Reports";
import PrivateRoute from "./components/routes/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <ModernNav />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-color)',
                },
              }}
            />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/" element={<PrivateRoute />}>
                <Route path="dashboard" element={<ModernDashboard />} />
                <Route path="reports" element={<Reports />} />
                <Route path="report/create" element={<ModernCreateReport />} />
                <Route path="report/ai-create" element={<AIReportCreate />} />
              </Route>

              <Route path="/report/:id" element={<ReportView />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
