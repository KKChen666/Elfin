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

    const parsedMessages: { text: string; hour: number; sender: string }[] = [];
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

    // 解析消息、时间和发送者
    for (let i = 0; i < totalLines; i++) {
      const line = lines[i];
      const match = line.match(/^(\d{4}-\d{2}-\d{2}\s+(\d{2}):\d{2}:\d{2})\s+(.+?)[：:](.+)/);
      if (match) {
        parsedMessages.push({
          text: match[4].trim(),
          hour: parseInt(match[2], 10),
          sender: match[3].trim(),
        });
      }
      if (i % 100 === 0) {
        setProgress(Math.floor((i / totalLines) * 30));
        await new Promise(r => setTimeout(r, 10));
      }
    }

    // 识别对话双方：出现次数少的是"我"（用户），多的是对方（亲友）
    const senderCounts: Record<string, number> = {};
    parsedMessages.forEach(m => {
      senderCounts[m.sender] = (senderCounts[m.sender] || 0) + 1;
    });
    const senders = Object.keys(senderCounts);
    // 如果只有一个发送者，全部作为对方处理
    const avatarSender = senders.length >= 2
      ? (senderCounts[senders[0]] >= senderCounts[senders[1]] ? senders[0] : senders[1])
      : senders[0];
    const avatarMessages = parsedMessages.filter(m => m.sender === avatarSender);
    const otherMessages = parsedMessages.filter(m => m.sender !== avatarSender);

    // === 基础特征分析（对对方的消息进行分析）===
    const wordFreq: Record<string, number> = {};
    const emojiFreq: Record<string, number> = {};
    const greetingPatterns: string[] = [];
    const farewellPatterns: string[] = [];
    const questionPatterns: string[] = [];
    const agreementPatterns: string[] = [];
    const hesitationPatterns: string[] = [];
    const laughterPatterns: string[] = [];
    let exclamationCount = 0;
    let questionCount = 0;
    let ellipsisCount = 0;
    let tildeCount = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let totalLength = 0;
    const hourFreq: Record<number, number> = {};
    const toneWords = ['哈哈', '嗯嗯', '哦', '啦', '呢', '吧', '呀', '嘛', '诶', '嘿', '嘿嘿', '嘻嘻', '呜呜', '哼', '哎', '啊'];
    const detectedTones: string[] = [];
    const formalMarkers = ['您', '请问', '感谢', '谢谢', '不好意思', '打扰了', '麻烦'];
    let formalCount = 0;
    let casualCount = 0;
    const positiveKeywords = ['开心', '高兴', '快乐', '幸福', '棒', '好', '赞', '喜欢', '爱', '太好了', '厉害'];
    const negativeKeywords = ['难过', '伤心', '生气', '烦', '讨厌', '不好', '糟糕', '累', '困', '无聊', '郁闷'];
    const greetingKeywords = ['你好', '嗨', '哈喽', '在吗', '早上好', '晚上好', '早', '晚安'];
    const farewellKeywords = ['拜拜', '再见', '晚安', '下次', '先这样', '走了', '溜了', '撤了'];
    const questionKeywords = ['什么', '怎么', '为什么', '吗', '哪', '谁', '几', '多少'];
    const agreementKeywords = ['对', '是', '没错', '确实', '赞同', '同意', '好的', '行', '可以'];
    const hesitationKeywords = ['嗯', '这个', '那个', '可能', '也许', '大概', '应该'];
    const laughterKeywords = ['哈哈', '笑', '噗', '嘿嘿', '嘻嘻', '233', '红红火火'];

    avatarMessages.forEach(msg => {
      const text = msg.text;
      hourFreq[msg.hour] = (hourFreq[msg.hour] || 0) + 1;
      totalLength += text.length;
      const emojis = text.match(emojiRegex);
      emojis?.forEach(emoji => { emojiFreq[emoji] = (emojiFreq[emoji] || 0) + 1; });
      const words = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
      words.forEach(word => { wordFreq[word] = (wordFreq[word] || 0) + 1; });
      if (text.includes('！') || text.includes('!')) exclamationCount++;
      if (text.includes('？') || text.includes('?')) questionCount++;
      if (text.includes('...') || text.includes('…')) ellipsisCount++;
      if (text.includes('~')) tildeCount++;
      if (positiveKeywords.some(k => text.includes(k))) positiveCount++;
      if (negativeKeywords.some(k => text.includes(k))) negativeCount++;
      if (formalMarkers.some(k => text.includes(k))) formalCount++;
      else casualCount++;
      if (greetingKeywords.some(k => text.includes(k))) greetingPatterns.push(text.substring(0, 20));
      if (farewellKeywords.some(k => text.includes(k))) farewellPatterns.push(text.substring(0, 20));
      if (questionKeywords.some(k => text.includes(k))) questionPatterns.push(text.substring(0, 20));
      if (agreementKeywords.some(k => text.includes(k))) agreementPatterns.push(text.substring(0, 20));
      if (hesitationKeywords.some(k => text.includes(k))) hesitationPatterns.push(text.substring(0, 20));
      if (laughterKeywords.some(k => text.includes(k))) laughterPatterns.push(text.substring(0, 20));
      toneWords.forEach(tone => {
        if (text.includes(tone) && !detectedTones.includes(tone)) detectedTones.push(tone);
      });
    });

    setProgress(50);

    // === 深度特征：提取真实回复模式 ===
    const realReplies = {
      greeting: [] as string[],
      farewell: [] as string[],
      agreement: [] as string[],
      question: [] as string[],
      comfort: [] as string[],
      surprise: [] as string[],
      general: [] as string[],
      laughter: [] as string[],
    };

    // 构建对话流，提取对方的真实回复短句
    const classifyMsg = (text: string): string => {
      if (farewellKeywords.some(k => text.includes(k))) return 'farewell';
      if (greetingKeywords.some(k => text.includes(k))) return 'greeting';
      if (laughterKeywords.some(k => text.includes(k))) return 'laughter';
      if (agreementKeywords.some(k => text.includes(k))) return 'agreement';
      if (questionKeywords.some(k => text.includes(k))) return 'question';
      return 'general';
    };

    // 收集对方所有短消息（≤15字）作为真实回复素材
    avatarMessages.forEach(msg => {
      const text = msg.text;
      if (text.length <= 15 && text.length >= 1) {
        const category = classifyMsg(text);
        if (category !== 'general') {
          realReplies[category as keyof typeof realReplies].push(text);
        } else if (text.length <= 6) {
          // 短通用回复（如 "嗯嗯" "好" "行" "知道了"）
          realReplies.general.push(text);
        }
      }
      // 检测安慰/惊讶类回复
      if (['没事', '别担心', '会好的', '加油', '抱抱', '没关系', '辛苦了'].some(k => text.includes(k))) {
        realReplies.comfort.push(text.substring(0, 20));
      }
      if (['真的吗', '哇', '天哪', '不会吧', '厉害', '太棒了', '卧槽', '我靠', '牛'].some(k => text.includes(k))) {
        realReplies.surprise.push(text.substring(0, 20));
      }
    });

    // 去重并限制数量
    const dedupe = (arr: string[], limit: number) => [...new Set(arr)].slice(0, limit);
    Object.keys(realReplies).forEach(key => {
      realReplies[key as keyof typeof realReplies] = dedupe(realReplies[key as keyof typeof realReplies], 8);
    });

    // === 深度特征：提取句式模板 ===
    // 分析对方长消息（>10字）中的常见句式结构
    const sentenceTemplates: string[] = [];
    const longMsgs = avatarMessages.filter(m => m.text.length > 10 && m.text.length <= 50);
    // 提取包含常见连接词/语气结构的句子作为模板
    const structuralPatterns = [
      { regex: /我觉得(.+)/, template: '我觉得{内容}' },
      { regex: /我觉得(.+)挺/, template: '我觉得{内容}挺好的' },
      { regex: /(.+)是不是/, template: '{内容}是不是？' },
      { regex: /(.+)对吧/, template: '{内容}对吧' },
      { regex: /(.+)吧$/, template: '{内容}吧' },
      { regex: /(.+)呢[？?]?$/, template: '{内容}呢？' },
      { regex: /(.+)啊$/, template: '{内容}啊' },
      { regex: /(.+)哦$/, template: '{内容}哦' },
      { regex: /(.+)啦$/, template: '{内容}啦' },
      { regex: /(.+)嘛$/, template: '{内容}嘛' },
      { regex: /你知道吗(.+)/, template: '你知道吗{内容}' },
      { regex: /真的(.+)/, template: '真的{内容}' },
      { regex: /其实(.+)/, template: '其实{内容}' },
      { regex: /还好(.+)/, template: '还好{内容}' },
      { regex: /不是(.+)吗/, template: '不是{内容}吗' },
    ];
    longMsgs.forEach(msg => {
      structuralPatterns.forEach(({ regex, template }) => {
        if (regex.test(msg.text) && !sentenceTemplates.includes(template)) {
          sentenceTemplates.push(template);
        }
      });
    });

    // === 深度特征：沟通特质 ===
    const totalMsgCount = avatarMessages.length;
    const questionMsgCount = avatarMessages.filter(m => questionKeywords.some(k => m.text.includes(k))).length;
    const emojiMsgCount = avatarMessages.filter(m => emojiRegex.test(m.text)).length;
    const veryShortMsgs = avatarMessages.filter(m => m.text.length <= 3).length;

    // 判断是否主动发起话题：看对话流中对方是否经常是第一个发消息的人
    let initiativeCount = 0;
    for (let i = 0; i < parsedMessages.length; i++) {
      if (parsedMessages[i].sender === avatarSender) {
        // 如果是第一条消息，或前一条是对方发的（时间间隔较长），算主动
        if (i === 0 || parsedMessages[i - 1].sender === avatarSender) {
          initiativeCount++;
        }
      }
    }

    setProgress(70);

    // === 深度特征：表达 DNA ===
    const expressionDNA: string[] = [];
    // 分析标点习惯
    if (tildeCount > avatarMessages.length * 0.15) expressionDNA.push('喜欢用波浪号~');
    if (exclamationCount > avatarMessages.length * 0.2) expressionDNA.push('经常用感叹号表达情绪');
    if (ellipsisCount > avatarMessages.length * 0.1) expressionDNA.push('常用省略号表示思考或犹豫');
    // 分析语气词习惯
    if (detectedTones.includes('嘛')) expressionDNA.push('习惯在句尾加"嘛"');
    if (detectedTones.includes('啦')) expressionDNA.push('喜欢用"啦"让语气更柔和');
    if (detectedTones.includes('呢')) expressionDNA.push('常用"呢"表示疑问或强调');
    if (detectedTones.includes('哦') || detectedTones.includes('噢')) expressionDNA.push('经常用"哦"回应');
    if (detectedTones.includes('嘿嘿')) expressionDNA.push('喜欢用"嘿嘿"表达俏皮');
    // 分析句式习惯
    const questionAsReply = avatarMessages.filter(m =>
      m.text.endsWith('？') || m.text.endsWith('?')
    ).length;
    if (questionAsReply > avatarMessages.length * 0.15) expressionDNA.push('喜欢用反问句或追问');
    const hasRepetition = avatarMessages.filter(m =>
      /(.)\1{2,}/.test(m.text) || /(.+)\1+/.test(m.text.replace(/[^\u4e00-\u9fa5]/g, ''))
    ).length;
    if (hasRepetition > avatarMessages.length * 0.1) expressionDNA.push('喜欢重复用字加强语气（如"对对对""哈哈哈"）');
    // 分析回复长度特征
    if (veryShortMsgs > avatarMessages.length * 0.4) expressionDNA.push('多数回复很简短，惜字如金');
    if (avatarMessages.filter(m => m.text.length > 30).length > avatarMessages.length * 0.3) expressionDNA.push('经常发长消息，表达充分');

    // 去重表达习惯
    const uniquePatterns = (patterns: string[]) => [...new Set(patterns)].slice(0, 8);

    // 基础特征
    const highFrequencyWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
    const commonEmojis = Object.entries(emojiFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([emoji]) => emoji);
    const avgLength = avatarMessages.length > 0 ? totalLength / avatarMessages.length : 0;
    const personality = avgLength > 20 ? '话多型' : avgLength < 8 ? '惜字如金型' : '均衡型';
    const languageStyle = formalCount > casualCount * 0.5 ? 'formal' :
                          casualCount > formalCount * 2 ? 'casual' : 'mixed';
    const sentiment = positiveCount > negativeCount * 1.5 ? 'positive' :
                      negativeCount > positiveCount * 1.5 ? 'negative' :
                      (positiveCount > 0 && negativeCount > 0) ? 'mixed' : 'neutral';
    const activeHours = Object.entries(hourFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour]) => parseInt(hour, 10));
    const shortMsgCount = avatarMessages.filter(m => m.text.length < 8).length;
    const longMsgCount = avatarMessages.filter(m => m.text.length > 20).length;
    const responseLengthPattern = shortMsgCount > avatarMessages.length * 0.6 ? 'short' :
                                  longMsgCount > avatarMessages.length * 0.4 ? 'long' : 'medium';

    // 提取回复中高频出现的连词/句式关键词作为 sentencePatterns
    const extractedPatterns: string[] = [];
    const patternKeywords = ['但是', '然后', '所以', '就是', '其实', '反正', '还好', '确实', '毕竟'];
    patternKeywords.forEach(kw => {
      const count = avatarMessages.filter(m => m.text.includes(kw)).length;
      if (count > avatarMessages.length * 0.05) {
        extractedPatterns.push(`常用"${kw}"连接句子`);
      }
    });

    setProgress(90);

    const chatStyle: ChatStyle = {
      highFrequencyWords,
      commonEmojis,
      sentencePatterns: extractedPatterns.length > 0 ? extractedPatterns : ['感叹句', '疑问句'],
      toneWords: detectedTones,
      avgMessageLength: avgLength,
      personality,
      styleKeywords: highFrequencyWords.slice(0, 5),
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
        useExclamation: exclamationCount > avatarMessages.length * 0.2,
        useQuestion: questionCount > avatarMessages.length * 0.2,
        useEllipsis: ellipsisCount > avatarMessages.length * 0.1,
        useTilde: tildeCount > avatarMessages.length * 0.1,
      },
      // 深度特征
      realReplyPatterns: realReplies,
      sentenceTemplates: sentenceTemplates.slice(0, 10),
      communicationTraits: {
        questionFrequency: totalMsgCount > 0 ? questionMsgCount / totalMsgCount : 0,
        emojiFrequency: totalMsgCount > 0 ? emojiMsgCount / totalMsgCount : 0,
        avgReplyLength: avgLength,
        isInitiator: initiativeCount > avatarMessages.length * 0.3,
        usesVoiceMessages: veryShortMsgs > avatarMessages.length * 0.3,
      },
      expressionDNA,
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

            {/* 深度特征预览 */}
            {result.expressionDNA && result.expressionDNA.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-orange-100">
                <h3 className="font-medium text-sm mb-2 text-[#E8734A]">表达 DNA</h3>
                <p className="text-xs text-gray-400 mb-2">最具辨识度的表达方式</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.expressionDNA.map((trait, i) => (
                    <span key={i} className="px-2.5 py-1 bg-orange-50 rounded-full text-sm text-[#E8734A]">{trait}</span>
                  ))}
                </div>
              </div>
            )}

            {result.realReplyPatterns && Object.values(result.realReplyPatterns).some(arr => arr.length > 0) && (
              <div className="bg-white rounded-xl p-4 border border-gray-50">
                <h3 className="font-medium text-sm mb-2">真实回复模式</h3>
                <p className="text-xs text-gray-400 mb-2">从聊天记录中提取的真实短句</p>
                <div className="space-y-1.5 text-sm">
                  {result.realReplyPatterns.greeting.length > 0 && (
                    <div>
                      <span className="text-gray-500">问候：</span>
                      <span className="text-gray-700">{result.realReplyPatterns.greeting.slice(0, 3).join('、')}</span>
                    </div>
                  )}
                  {result.realReplyPatterns.agreement.length > 0 && (
                    <div>
                      <span className="text-gray-500">认同：</span>
                      <span className="text-gray-700">{result.realReplyPatterns.agreement.slice(0, 3).join('、')}</span>
                    </div>
                  )}
                  {result.realReplyPatterns.general.length > 0 && (
                    <div>
                      <span className="text-gray-500">通用：</span>
                      <span className="text-gray-700">{result.realReplyPatterns.general.slice(0, 3).join('、')}</span>
                    </div>
                  )}
                  {result.realReplyPatterns.laughter.length > 0 && (
                    <div>
                      <span className="text-gray-500">笑声：</span>
                      <span className="text-gray-700">{result.realReplyPatterns.laughter.slice(0, 3).join('、')}</span>
                    </div>
                  )}
                  {result.realReplyPatterns.farewell.length > 0 && (
                    <div>
                      <span className="text-gray-500">告别：</span>
                      <span className="text-gray-700">{result.realReplyPatterns.farewell.slice(0, 3).join('、')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.sentenceTemplates && result.sentenceTemplates.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-50">
                <h3 className="font-medium text-sm mb-2">句式模板</h3>
                <p className="text-xs text-gray-400 mb-2">常见句式结构</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.sentenceTemplates.slice(0, 5).map((tpl, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 rounded text-sm text-blue-600">{tpl}</span>
                  ))}
                </div>
              </div>
            )}

            {result.communicationTraits && (
              <div className="bg-white rounded-xl p-4 border border-gray-50">
                <h3 className="font-medium text-sm mb-2">沟通特质</h3>
                <div className="flex flex-wrap gap-2">
                  {result.communicationTraits.isInitiator && (
                    <span className="px-2 py-0.5 bg-green-50 rounded text-sm text-green-600">主动型</span>
                  )}
                  {result.communicationTraits.questionFrequency > 0.2 && (
                    <span className="px-2 py-0.5 bg-purple-50 rounded text-sm text-purple-600">爱提问</span>
                  )}
                  {result.communicationTraits.usesVoiceMessages && (
                    <span className="px-2 py-0.5 bg-yellow-50 rounded text-sm text-yellow-600">简短回复型</span>
                  )}
                  {result.communicationTraits.emojiFrequency > 0.4 && (
                    <span className="px-2 py-0.5 bg-pink-50 rounded text-sm text-pink-600">爱发表情</span>
                  )}
                </div>
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
