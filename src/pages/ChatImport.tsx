import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { useRelativeStore } from '../stores/useRelativeStore';
import { ChatStyle } from '../types';

export default function ChatImport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRelative, updateChatStyle } = useRelativeStore();
  const relative = getRelative(id || '');

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ChatStyle | null>(null);

  if (!relative) {
    return <div className="p-4 text-center">亲友不存在</div>;
  }

  const analyzeChat = async (text: string) => {
    setAnalyzing(true);
    setProgress(0);

    const lines = text.split('\n').filter(line => line.trim());
    const totalLines = lines.length;

    const messages: string[] = [];
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

    for (let i = 0; i < totalLines; i++) {
      const line = lines[i];
      const match = line.match(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+(.+?)[：:](.+)/);
      if (match) {
        messages.push(match[2].trim());
      }
      if (i % 100 === 0) {
        setProgress(Math.floor((i / totalLines) * 100));
        await new Promise(r => setTimeout(r, 10));
      }
    }

    const wordFreq: Record<string, number> = {};
    const emojiFreq: Record<string, number> = {};
    const toneWords = ['哈哈', '嗯嗯', '哦', '啦', '呢', '吧', '呀', '嘛', '诶', '嘿'];

    messages.forEach(msg => {
      const emojis = msg.match(emojiRegex);
      emojis?.forEach(emoji => {
        emojiFreq[emoji] = (emojiFreq[emoji] || 0) + 1;
      });

      const words = msg.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
    });

    const highFrequencyWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);

    const commonEmojis = Object.entries(emojiFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([emoji]) => emoji);

    const avgLength = messages.reduce((sum, msg) => sum + msg.length, 0) / messages.length;
    const personality = avgLength > 20 ? '话多型' : avgLength < 8 ? '惜字如金型' : '均衡型';

    const detectedTones = toneWords.filter(tone => messages.some(msg => msg.includes(tone)));

    const chatStyle: ChatStyle = {
      highFrequencyWords,
      commonEmojis,
      sentencePatterns: ['感叹句', '疑问句'],
      toneWords: detectedTones,
      avgMessageLength: avgLength,
      personality,
      styleKeywords: highFrequencyWords.slice(0, 5)
    };

    setProgress(100);
    setResult(chatStyle);
    setAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      analyzeChat(text);
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    if (result && id) {
      updateChatStyle(id, result);
      navigate(`/detail/${id}`);
    }
  };

  return (
    <div className="p-4">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">导入聊天记录</h1>
      </header>

      {!result && !analyzing && (
        <div className="text-center py-8">
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 mb-4">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="font-semibold mb-2">拖拽或点击上传聊天记录</p>
            <p className="text-sm text-gray-500">支持 .txt / .csv 格式，文件大小 ≤ 10MB</p>
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="mt-4"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
            <h3 className="font-semibold text-green-700 mb-2">隐私保护</h3>
            <p className="text-sm text-green-600">
              聊天记录仅在本地设备处理，不会上传至服务器。分析完成后，原始文件可选择保留或删除。
            </p>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-[#E8734A] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-semibold mb-2">正在分析聊天记录...</p>
          <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto">
            <div
              className="h-full bg-[#E8734A] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}%</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">分析结果预览</h2>

          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold mb-2">高频词</h3>
            <div className="flex flex-wrap gap-2">
              {result.highFrequencyWords.slice(0, 10).map((word, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 rounded-lg text-sm">{word}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold mb-2">常用表情</h3>
            <div className="text-2xl">{result.commonEmojis.join(' ')}</div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold mb-2">语气词</h3>
            <div className="flex flex-wrap gap-2">
              {result.toneWords.map((word, i) => (
                <span key={i} className="px-2 py-1 bg-orange-100 rounded-lg text-sm">{word}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold mb-2">性格特点</h3>
            <p>{result.personality}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setResult(null)}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              重新导入
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-[#E8734A] text-white rounded-xl font-semibold hover:bg-[#D4633A] transition-colors"
            >
              保存结果
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
