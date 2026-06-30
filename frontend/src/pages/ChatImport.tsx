import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from '@phosphor-icons/react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { chatApi } from '../api/chat';
import { ChatStyle } from '../types';

export default function ChatImport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRelative, updateChatStyle } = useRelativeStore();
  const relative = getRelative(id || '');

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ChatStyle | null>(null);
  const [error, setError] = useState('');

  if (!relative) {
    return <div className="p-4 text-center">亲友不存在</div>;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setAnalyzing(true);
    setProgress(10);
    setError('');

    try {
      // 模拟进度
      const progressTimer = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 500);

      const res = await chatApi.uploadChatFile(Number(id), file);

      clearInterval(progressTimer);
      setProgress(100);

      const chatStyle = res.data.chat_style as unknown as ChatStyle;
      setResult(chatStyle);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '分析失败，请检查文件格式';
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (result && id) {
      updateChatStyle(id, result);
      navigate(`/detail/${id}`);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg md:text-xl font-bold">导入聊天记录</h1>
      </header>

      <div className="max-w-xl mx-auto lg:mx-0">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>
        )}

        {!result && !analyzing && (
          <div className="text-center py-8">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 mb-4">
              <Upload size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="font-medium text-sm mb-2">拖拽或点击上传聊天记录</p>
              <p className="text-xs text-gray-400">
                支持 .txt / .csv 格式，文件大小 ≤ 10MB
              </p>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="mt-4"
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-left">
              <h3 className="font-medium text-sm text-blue-700 mb-1">后端分析</h3>
              <p className="text-xs text-blue-600">
                聊天记录将上传至服务器进行 NLP 分析，分析完成后原始文件不会保留。
              </p>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="text-center py-12">
            <div className="animate-spin w-10 h-10 border-[3px] border-[#0066CC] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="font-medium text-sm mb-2">正在分析聊天记录...</p>
            <div className="w-48 h-1.5 bg-gray-100 rounded-full mx-auto">
              <div
                className="h-full bg-[#0066CC] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{progress}%</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <h2 className="font-semibold text-base">分析结果预览</h2>

            <div className="bg-white rounded-xl p-4 border border-gray-50">
              <h3 className="font-medium text-sm mb-2">性格特点</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#e9f2ff] rounded-full text-sm text-[#0066CC]">
                  {result.personality}
                </span>
                <span className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-600">
                  {result.languageStyle === 'formal'
                    ? '正式'
                    : result.languageStyle === 'casual'
                      ? '随意'
                      : '混合'}
                </span>
                <span className="px-3 py-1 bg-green-50 rounded-full text-sm text-green-600">
                  {result.sentiment === 'positive'
                    ? '积极'
                    : result.sentiment === 'negative'
                      ? '消极'
                      : result.sentiment === 'mixed'
                        ? '情感丰富'
                        : '中性'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-50">
              <h3 className="font-medium text-sm mb-2">高频词</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.highFrequencyWords.slice(0, 10).map((word, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-gray-50 rounded text-sm text-gray-600"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-50">
              <h3 className="font-medium text-sm mb-2">常用表情</h3>
              <div className="text-xl">{result.commonEmojis.join(' ')}</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-50">
              <h3 className="font-medium text-sm mb-2">语气词</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.toneWords.map((word, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-[#e9f2ff] rounded text-sm text-[#0066CC]"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {result.expressionDNA && result.expressionDNA.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-[#dbeaff]">
                <h3 className="font-medium text-sm mb-2 text-[#0066CC]">表达 DNA</h3>
                <p className="text-xs text-gray-400 mb-2">最具辨识度的表达方式</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.expressionDNA.map((trait, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-[#e9f2ff] rounded-full text-sm text-[#0066CC]"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.activeHours && result.activeHours.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-50">
                <h3 className="font-medium text-sm mb-2">活跃时间</h3>
                <p className="text-sm text-gray-700">
                  {[...result.activeHours]
                    .sort((a, b) => a - b)
                    .map((h) => `${h}点`)
                    .join('、')}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-2.5 bg-gray-50 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                重新导入
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-[#0066CC] text-white rounded-xl text-sm font-medium hover:bg-[#005BB8] transition-colors"
              >
                保存结果
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
