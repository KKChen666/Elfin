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

    const messages: { text: string; hour: number }[] = [];
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

    // 解析消息和时间
    for (let i = 0; i < totalLines; i++) {
      const line = lines[i];
      const match = line.match(/^(\d{4}-\d{2}-\d{2}\s+(\d{2}):\d{2}:\d{2})\s+(.+?)[：:](.+)/);
      if (match) {
        messages.push({
          text: match[4].trim(),
          hour: parseInt(match[2], 10)
        });
      }
      if (i % 100 === 0) {
        setProgress(Math.floor((i / totalLines) * 100));
        await new Promise(r => setTimeout(r, 10));
      }
    }

    // 词频分析
    const wordFreq: Record<string, number> = {};
    const emojiFreq: Record<string, number> = {};
    
    // 表达习惯收集
    const greetingPatterns: string[] = [];
    const farewellPatterns: string[] = [];
    const questionPatterns: string[] = [];
    const agreementPatterns: string[] = [];
    const hesitationPatterns: string[] = [];
    const laughterPatterns: string[] = [];
    
    // 标点统计
    let exclamationCount = 0;
    let questionCount = 0;
    let ellipsisCount = 0;
    let tildeCount = 0;
    
    // 情感统计
    let positiveCount = 0;
    let negativeCount = 0;
    let totalLength = 0;
    
    // 活跃时间统计
    const hourFreq: Record<number, number> = {};
    
    // 语气词
    const toneWords = ['哈哈', '嗯嗯', '哦', '啦', '呢', '吧', '呀', '嘛', '诶', '嘿'];
    const detectedTones: string[] = [];
    
    // 正式语言标记
    const formalMarkers = ['您', '请问', '感谢', '谢谢', '不好意思', '打扰了', '麻烦'];
    let formalCount = 0;
    let casualCount = 0;

    // 情感关键词
    const positiveKeywords = ['开心', '高兴', '快乐', '幸福', '棒', '好', '赞', '喜欢', '爱', '太好了', '厉害'];
    const negativeKeywords = ['难过', '伤心', '生气', '烦', '讨厌', '不好', '糟糕', '累', '困', '无聊', '郁闷'];
    
    // 问候/告别关键词
    const greetingKeywords = ['你好', '嗨', '哈喽', '在吗', '早上好', '晚上好', '早', '晚安'];
    const farewellKeywords = ['拜拜', '再见', '晚安', '下次', '先这样', '走了', '溜了'];
    const questionKeywords = ['什么', '怎么', '为什么', '吗', '哪', '谁', '几', '多少'];
    const agreementKeywords = ['对', '是', '没错', '确实', '赞同', '同意', '好的', '行', '可以'];
    const hesitationKeywords = ['嗯', '这个', '那个', '可能', '也许', '大概', '应该'];
    const laughterKeywords = ['哈哈', '笑', '噗', '嘿嘿', '嘻嘻'];

    messages.forEach(msg => {
      const text = msg.text;
      
      // 统计活跃时间
      hourFreq[msg.hour] = (hourFreq[msg.hour] || 0) + 1;
      
      // 统计消息长度
      totalLength += text.length;
      
      // 表情提取
      const emojis = text.match(emojiRegex);
      emojis?.forEach(emoji => {
        emojiFreq[emoji] = (emojiFreq[emoji] || 0) + 1;
      });

      // 词语提取
      const words = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      
      // 标点统计
      if (text.includes('！') || text.includes('!')) exclamationCount++;
      if (text.includes('？') || text.includes('?')) questionCount++;
      if (text.includes('...') || text.includes('…')) ellipsisCount++;
      if (text.includes('~')) tildeCount++;
      
      // 情感分析
      if (positiveKeywords.some(k => text.includes(k))) positiveCount++;
      if (negativeKeywords.some(k => text.includes(k))) negativeCount++;
      
      // 语言风格分析
      if (formalMarkers.some(k => text.includes(k))) formalCount++;
      else casualCount++;
      
      // 表达习惯收集
      if (greetingKeywords.some(k => text.includes(k))) {
        greetingPatterns.push(text.substring(0, 15));
      }
      if (farewellKeywords.some(k => text.includes(k))) {
        farewellPatterns.push(text.substring(0, 15));
      }
      if (questionKeywords.some(k => text.includes(k))) {
        questionPatterns.push(text.substring(0, 15));
      }
      if (agreementKeywords.some(k => text.includes(k))) {
        agreementPatterns.push(text.substring(0, 15));
      }
      if (hesitationKeywords.some(k => text.includes(k))) {
        hesitationPatterns.push(text.substring(0, 15));
      }
      if (laughterKeywords.some(k => text.includes(k))) {
        laughterPatterns.push(text.substring(0, 15));
      }
      
      // 语气词检测
      toneWords.forEach(tone => {
        if (text.includes(tone) && !detectedTones.includes(tone)) {
          detectedTones.push(tone);
        }
      });
    });

    // 高频词
    const highFrequencyWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);

    // 常用表情
    const commonEmojis = Object.entries(emojiFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([emoji]) => emoji);

    // 平均消息长度
    const avgLength = messages.length > 0 ? totalLength / messages.length : 0;
    
    // 性格判断
    const personality = avgLength > 20 ? '话多型' : avgLength < 8 ? '惜字如金型' : '均衡型';
    
    // 语言风格判断
    const languageStyle = formalCount > casualCount * 0.5 ? 'formal' : 
                          casualCount > formalCount * 2 ? 'casual' : 'mixed';
    
    // 情感倾向判断
    const sentiment = positiveCount > negativeCount * 1.5 ? 'positive' :
                      negativeCount > positiveCount * 1.5 ? 'negative' :
                      (positiveCount > 0 && negativeCount > 0) ? 'mixed' : 'neutral';
    
    // 活跃时间段
    const activeHours = Object.entries(hourFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour]) => parseInt(hour, 10));
    
    // 回复长度模式
    const shortMsgs = messages.filter(m => m.text.length < 8).length;
    const longMsgs = messages.filter(m => m.text.length > 20).length;
    const responseLengthPattern = shortMsgs > messages.length * 0.6 ? 'short' :
                                  longMsgs > messages.length * 0.4 ? 'long' :
                                  'medium';
    
    // 去重表达习惯
    const uniquePatterns = (patterns: string[]) => {
      const unique = [...new Set(patterns)];
      return unique.slice(0, 5);
    };

    const chatStyle: ChatStyle = {
      highFrequencyWords,
      commonEmojis,
      sentencePatterns: ['感叹句', '疑问句'],
      toneWords: detectedTones,
      avgMessageLength: avgLength,
      personality,
      styleKeywords: highFrequencyWords.slice(0, 5),
      
      // 高级特征
      languageStyle,
      sentiment,
      topicPreferences: highFrequencyWords.slice(0, 5),
      activeHours,
      responseLengthPattern,
      greetingPatterns: uniquePatterns(greetingPatterns),
      farewellPatterns: uniquePatterns(farewellPatterns),
      questionPatterns: uniquePatterns(questionPatterns),
      agreementPatterns: uniquePatterns(agreementPatterns),
      hesitationPatterns: uniquePatterns(hesitationPatterns),
      laughterPatterns: uniquePatterns(laughterPatterns),
      punctuationStyle: {
        useExclamation: exclamationCount > messages.length * 0.2,
        useQuestion: questionCount > messages.length * 0.2,
        useEllipsis: ellipsisCount > messages.length * 0.1,
        useTilde: tildeCount > messages.length * 0.1,
      }
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
    <div className="p-4 md:p-6 lg:p-8">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg md:text-xl font-bold">导入聊天记录</h1>
      </header>

      <div className="max-w-xl mx-auto lg:mx-0">
        {!result && !analyzing && (
          <div className="text-center py-8">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 mb-4">
              <Upload size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="font-medium text-sm mb-2">拖拽或点击上传聊天记录</p>
              <p className="text-xs text-gray-400">支持 .txt / .csv 格式，文件大小 ≤ 10MB</p>
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="mt-4"
              />
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-left">
              <h3 className="font-medium text-sm text-green-700 mb-1">隐私保护</h3>
              <p className="text-xs text-green-600">
                聊天记录仅在本地设备处理，不会上传至服务器。分析完成后，原始文件可选择保留或删除。
              </p>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="text-center py-12">
            <div className="animate-spin w-10 h-10 border-[3px] border-[#E8734A] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="font-medium text-sm mb-2">正在分析聊天记录...</p>
            <div className="w-48 h-1.5 bg-gray-100 rounded-full mx-auto">
              <div
                className="h-full bg-[#E8734A] rounded-full transition-all"
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
                <span className="px-3 py-1 bg-orange-50 rounded-full text-sm text-[#E8734A]">{result.personality}</span>
                <span className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-600">
                  {result.languageStyle === 'formal' ? '正式' : result.languageStyle === 'casual' ? '随意' : '混合'}
                </span>
                <span className="px-3 py-1 bg-green-50 rounded-full text-sm text-green-600">
                  {result.sentiment === 'positive' ? '积极' : result.sentiment === 'negative' ? '消极' : result.sentiment === 'mixed' ? '情感丰富' : '中性'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-50">
              <h3 className="font-medium text-sm mb-2">高频词</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.highFrequencyWords.slice(0, 10).map((word, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-50 rounded text-sm text-gray-600">{word}</span>
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
                  <span key={i} className="px-2 py-0.5 bg-orange-50 rounded text-sm text-[#E8734A]">{word}</span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-50">
              <h3 className="font-medium text-sm mb-2">表达习惯</h3>
              <div className="space-y-2 text-sm">
                {result.greetingPatterns.length > 0 && (
                  <div>
                    <span className="text-gray-500">问候：</span>
                    <span className="text-gray-700">{result.greetingPatterns.slice(0, 2).join('、')}</span>
                  </div>
                )}
                {result.farewellPatterns.length > 0 && (
                  <div>
                    <span className="text-gray-500">告别：</span>
                    <span className="text-gray-700">{result.farewellPatterns.slice(0, 2).join('、')}</span>
                  </div>
                )}
                {result.laughterPatterns.length > 0 && (
                  <div>
                    <span className="text-gray-500">笑声：</span>
                    <span className="text-gray-700">{result.laughterPatterns.slice(0, 2).join('、')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-50">
              <h3 className="font-medium text-sm mb-2">标点习惯</h3>
              <div className="flex flex-wrap gap-2">
                {result.punctuationStyle.useExclamation && (
                  <span className="px-2 py-0.5 bg-yellow-50 rounded text-sm text-yellow-600">感叹号</span>
                )}
                {result.punctuationStyle.useQuestion && (
                  <span className="px-2 py-0.5 bg-purple-50 rounded text-sm text-purple-600">问号</span>
                )}
                {result.punctuationStyle.useEllipsis && (
                  <span className="px-2 py-0.5 bg-gray-50 rounded text-sm text-gray-600">省略号</span>
                )}
                {result.punctuationStyle.useTilde && (
                  <span className="px-2 py-0.5 bg-pink-50 rounded text-sm text-pink-600">波浪号</span>
                )}
              </div>
            </div>

            {result.activeHours.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-50">
                <h3 className="font-medium text-sm mb-2">活跃时间</h3>
                <p className="text-sm text-gray-700">
                  {result.activeHours.sort((a, b) => a - b).map(h => `${h}点`).join('、')}
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
                className="flex-1 py-2.5 bg-[#E8734A] text-white rounded-xl text-sm font-medium hover:bg-[#D4633A] transition-colors"
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
