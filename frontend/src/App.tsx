import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, ReactNode } from 'react';
import { useRelativeStore } from './stores/useRelativeStore';
import { useAuthStore } from './stores/useAuthStore';
import Home from './pages/Home';
import AddRelative from './pages/AddRelative';
import EditRelative from './pages/EditRelative';
import Detail from './pages/Detail';
import AvatarCustom from './pages/AvatarCustom';
import ChatImport from './pages/ChatImport';
import Chat from './pages/Chat';
import Reminders from './pages/Reminders';
import Calendar from './pages/Calendar';
import Stats from './pages/Stats';
import Login from './pages/Login';
import Register from './pages/Register';
import ClaudeLayout from './components/ClaudeLayout';
import ChatPage from './pages/ChatPage';
import AgentsPage from './pages/AgentsPage';
import SkillsPage from './pages/SkillsPage';
import Toast from './components/Toast';

function RequireAuth({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="ios-page flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0066cc] border-t-transparent" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const loadRelatives = useRelativeStore((state) => state.loadRelatives);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (token) {
      loadRelatives();
    }
  }, [token, loadRelatives]);

  return (
    <Router>
      <Toast />
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 所有功能统一使用 ClaudeLayout */}
        <Route
          element={
            <RequireAuth>
              <ClaudeLayout />
            </RequireAuth>
          }
        >
          {/* 默认首页跳转到对话 */}
          <Route path="/" element={<Navigate to="/chat" replace />} />

          {/* Agent 对话 */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/new" element={<ChatPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />

          {/* Agent 管理 */}
          <Route path="/agents" element={<AgentsPage />} />

          {/* 技能管理 */}
          <Route path="/skills" element={<SkillsPage />} />

          {/* 亲友管理 */}
          <Route path="/relatives" element={<Home />} />
          <Route path="/add" element={<AddRelative />} />
          <Route path="/edit/:id" element={<EditRelative />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/avatar/:id" element={<AvatarCustom />} />
          <Route path="/avatar-chat/:id" element={<Chat />} />
          <Route path="/import/:id" element={<ChatImport />} />

          {/* 工具页面 */}
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}
