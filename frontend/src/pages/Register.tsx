import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useGsapEntrance } from '../hooks/useGsapEntrance';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);

  useGsapEntrance(authRef, [], { selector: '[data-gsap-auth]', y: 16, scale: 0.98, stagger: 0.07 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }

    setLoading(true);
    try {
      await register(username, password);
      navigate('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || '注册失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ios-page flex min-h-screen items-center justify-center overflow-y-auto px-4 py-5">
      <div ref={authRef} className="w-full max-w-[420px] sm:-translate-y-8">
        <div className="mb-5 text-center" data-gsap-auth>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#1d1d1f] text-base font-semibold text-white">
            E
          </div>
          <p className="ios-kicker">创建账号</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">开始使用 Elfin。</h1>
          <p className="mt-2 text-sm leading-6 text-[#7a7a7a]">用一个安静、私密的地方保存你的关系记忆。</p>
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
                minLength={2}
                maxLength={50}
                className="ios-input"
                placeholder="2-50 个字符"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">密码</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="ios-input"
                placeholder="至少 6 位"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#6e6e73]">确认密码</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="ios-input"
                placeholder="再次输入密码"
              />
            </label>
          </div>

          <button type="submit" disabled={loading} className="ios-button-primary mt-5 w-full">
            {loading ? '注册中...' : '注册'}
          </button>

          <p className="mt-5 text-center text-sm text-[#7a7a7a]">
            已有账号？{' '}
            <Link to="/login" className="font-medium text-[#0066cc]">
              登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
