import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useGsapEntrance } from '../hooks/useGsapEntrance';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);

  useGsapEntrance(authRef, [], { selector: '[data-gsap-auth]', y: 16, scale: 0.98, stagger: 0.07 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || '登录失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ios-page flex min-h-screen items-center justify-center overflow-y-auto px-4 py-5">
      <div ref={authRef} className="w-full max-w-[420px] sm:-translate-y-10">
        <div className="mb-5 text-center" data-gsap-auth>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#1d1d1f] text-base font-semibold text-white">
            E
          </div>
          <p className="ios-kicker">欢迎回来</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">登录 Elfin。</h1>
          <p className="mt-2 text-sm leading-6 text-[#7a7a7a]">继续记录那些值得被温柔记住的人和事。</p>
        </div>

        <form onSubmit={handleSubmit} className="ios-panel p-4 sm:p-5" data-gsap-auth>
          {error && <div className="mb-4 rounded-2xl bg-[#fff0f0] px-4 py-3 text-sm text-[#ff3b30]">{error}</div>}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">用户名</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="ios-input"
                placeholder="请输入用户名"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">密码</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="ios-input"
                placeholder="请输入密码"
              />
            </label>
          </div>

          <button type="submit" disabled={loading} className="ios-button-primary mt-5 w-full">
            {loading ? '登录中...' : '登录'}
          </button>

          <p className="mt-5 text-center text-sm text-[#7a7a7a]">
            还没有账号？{' '}
            <Link to="/register" className="font-medium text-[#0066cc]">
              注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
