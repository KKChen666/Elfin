import { Gear, WarningCircle } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { authApi } from '../api/auth';

type ModelKeyNoticeProps = {
  compact?: boolean;
  title?: string;
  description?: string;
};

export default function ModelKeyNotice({
  compact = false,
  title = '还没有配置模型 API Key',
  description = '当前 AI 生成会使用体验回复或降级模板。配置模型后，聊天、Skill Creator 和 Agent 路由会更接近真实效果。',
}: ModelKeyNoticeProps) {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    authApi
      .getLLMSettings()
      .then((res) => {
        if (alive) setIsConfigured(res.data.is_configured);
      })
      .catch(() => {
        if (alive) setIsConfigured(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (isConfigured !== false) return null;

  return (
    <section className={`ios-panel border-[#f0d48a] bg-[#fff9e8] ${compact ? 'mb-5 p-3' : 'mb-5 p-4'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#9a6700] ring-1 ring-[#f0d48a]">
            <WarningCircle size={19} weight="fill" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#202123]">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#6b5a2e]">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('elfin:open-model-settings'))}
          className="ios-button-secondary shrink-0 !border-[#f0d48a] !bg-white"
        >
          <Gear size={17} />
          配置模型
        </button>
      </div>
    </section>
  );
}
