import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useRelativeStore } from './stores/useRelativeStore';
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
import Layout from './components/Layout';

export default function App() {
  const loadRelatives = useRelativeStore(state => state.loadRelatives);

  useEffect(() => {
    loadRelatives();
  }, [loadRelatives]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddRelative />} />
          <Route path="/edit/:id" element={<EditRelative />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/avatar/:id" element={<AvatarCustom />} />
          <Route path="/import/:id" element={<ChatImport />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}
