import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '登录失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #FFF5EE 0%, #FFE8D8 100%)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-[#3D2E22]">亲友管理</h1>
          <p className="text-sm text-[#A08B7A] mt-1">记录每一位重要的人</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#3D2E22] mb-5 text-center">登录</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#5C4A3A] mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A] focus:ring-opacity-50"
              placeholder="请输入用户名"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-[#5C4A3A] mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8734A] focus:ring-opacity-50"
              placeholder="请输入密码"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-[#E8734A] to-[#F09060] text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <p className="text-center text-sm text-[#A08B7A] mt-4">
            还没有账号？{' '}
            <Link to="/register" className="text-[#E8734A] font-medium">
              注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
