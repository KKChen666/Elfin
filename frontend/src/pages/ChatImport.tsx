import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Database, Upload } from '@phosphor-icons/react';
import { chatApi, MemoryBackendStatus } from '../api/chat';
import { showToast } from '../components/toastBus';
import { ChatStyle } from '../types';
import { useRelativeStore } from '../stores/useRelativeStore';

function labelLanguage(value: string) {
  if (value === 'formal') return '正式';
  if (value === 'casual') return '随意';
  return '混合';
}

function labelSentiment(value: string) {
  if (value === 'positive') return '积极';
  if (value === 'negative') return '消极';
  if (value === 'mixed') return '情感丰富';
  return '中性';
}

export default function ChatImport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRelative, updateChatStyle, loadRelatives, hasLoaded, isLoading } = useRelativeStore();
  const relative = getRelative(id || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ChatStyle | null>(null);
  const [backendStatus, setBackendStatus] = useState<MemoryBackendStatus | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasLoaded) loadRelatives();
  }, [hasLoaded, loadRelatives]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setAnalyzing(true);
    setProgress(10);
    setError('');
    setBackendStatus(null);
    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 10, 90));
    }, 500);

    try {
      const res = await chatApi.uploadChatFile(Number(id), file);
      const chatStyle = res.data.chat_style as unknown as ChatStyle;
      setResult(chatStyle);
      setProgress(100);
      const backend = await chatApi.getMemoryBackend(Number(id));
      setBackendStatus(backend.data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '分析失败，请检查文件格式';
      setError(msg);
    } finally {
      window.clearInterval(progressTimer);
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !id) return;
    try {
      await updateChatStyle(id, result);
      showToast('success', '聊天风格已保存');
      navigate(`/detail/${id}`);
    } catch {
      showToast('error', '保存失败');
    }
  };

  if (!relative) {
    if (isLoading || !hasLoaded) {
      return <div className="p-4 text-center">正在加载亲友信息...</div>;
    }
    return <div className="p-4 text-center">亲友不存在</div>;
  }

  return (
    <div className="ios-page h-full overflow-y-auto">
      <div className="ios-container max-w-3xl">
        <header className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="ios-icon-button" aria-label="返回">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="ios-kicker">聊天导入</p>
            <h1 className="ios-title text-2xl">为 {relative.name} 建立表达记忆</h1>
          </div>
        </header>

        {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {!result && !analyzing && (
          <div className="space-y-4">
            <label className="block cursor-pointer rounded-[28px] border-2 border-dashed border-[#d9d9e3] bg-white p-8 text-center hover:bg-[#f7f7f8]">
              <Upload size={42} className="mx-auto mb-4 text-[#8a8f98]" />
              <p className="font-medium text-[#202123]">拖拽或点击上传聊天记录</p>
              <p className="mt-2 text-sm text-[#6b7280]">支持 .txt / .csv，文件大小不超过 10MB</p>
              <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="sr-only" />
            </label>

            <div className="ios-panel p-4 text-sm leading-6 text-[#6b7280]">
              后端会解析聊天记录、提取说话习惯，并生成可检索的记忆片段。原始文件不会作为文件长期保存。
            </div>
          </div>
        )}

        {analyzing && (
          <div className="ios-panel py-14 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-[#202123] border-t-transparent" />
            <p className="mb-3 text-sm font-medium">正在分析聊天记录...</p>
            <div className="mx-auto h-1.5 w-56 rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-[#202123] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-[#8a8f98]">{progress}%</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">分析结果预览</h2>

            <section className="ios-panel p-4">
              <h3 className="mb-3 text-sm font-semibold">表达画像</h3>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#f7f7f8] px-3 py-1 text-sm text-[#202123]">{result.personality}</span>
                <span className="rounded-full bg-[#f7f7f8] px-3 py-1 text-sm text-[#202123]">{labelLanguage(result.languageStyle)}</span>
                <span className="rounded-full bg-[#f7f7f8] px-3 py-1 text-sm text-[#202123]">{labelSentiment(result.sentiment)}</span>
              </div>
            </section>

            <section className="ios-panel p-4">
              <h3 className="mb-3 text-sm font-semibold">记忆库状态</h3>
              <div className="flex items-center gap-3 text-sm text-[#6b7280]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f8] text-[#202123]">
                  <Database size={20} />
                </div>
                <div>
                  <div>可检索记忆片段：{result.memoryChunkCount ?? 0}</div>
                  <div>
                    后端：{backendStatus?.backend?.toUpperCase() || 'SQL'}
                    {backendStatus && !backendStatus.available ? `，不可用原因：${backendStatus.reason || '未知'}` : ''}
                  </div>
                </div>
              </div>
            </section>

            <section className="ios-panel p-4">
              <h3 className="mb-3 text-sm font-semibold">高频词</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.highFrequencyWords.slice(0, 12).map((word) => (
                  <span key={word} className="rounded bg-gray-50 px-2 py-0.5 text-sm text-gray-600">{word}</span>
                ))}
              </div>
            </section>

            {result.expressionDNA?.length > 0 && (
              <section className="ios-panel p-4">
                <h3 className="mb-3 text-sm font-semibold">表达 DNA</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.expressionDNA.map((trait) => (
                    <span key={trait} className="rounded-full bg-[#f7f7f8] px-2.5 py-1 text-sm text-[#202123]">{trait}</span>
                  ))}
                </div>
              </section>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setResult(null)} className="ios-button-secondary flex-1">重新导入</button>
              <button onClick={handleSave} className="ios-button-primary flex-1">保存结果</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
