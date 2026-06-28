import { ChatStyle, ChatMessage } from '../types';

// === 消息分类 ===
type MessageCategory = 'greeting' | 'farewell' | 'question' | 'surprise' | 'laughter' | 'agreement' | 'comfort' | 'positive' | 'negative' | 'general';

const CATEGORY_KEYWORDS: Record<MessageCategory, string[]> = {
  greeting: ['你好', '嗨', '哈喽', '在吗', '早上好', '晚上好', '早', '晚'],
  farewell: ['拜拜', '再见', '晚安', '下次', '先这样', '走了', '溜了', '撤了'],
  question: ['什么', '怎么', '为什么', '吗', '？', '?', '哪', '谁', '几', '多少'],
  surprise: ['真的', '哇', '天哪', '不会吧', '厉害', '太棒了', '震惊', '卧槽', '我靠', '牛'],
  laughter: ['哈哈', '笑', '噗', '嘿嘿', '嘻嘻', '搞笑', '有趣', '233'],
  agreement: ['对', '是', '没错', '确实', '赞同', '同意', '好的', '行', '可以'],
  comfort: ['没事', '别担心', '会好的', '加油', '抱抱', '没关系', '难过', '伤心'],
  positive: ['开心', '高兴', '快乐', '幸福', '棒', '好', '赞', '喜欢', '爱', '太好了'],
  negative: ['难过', '伤心', '生气', '烦', '讨厌', '不好', '糟糕', '累', '困', '无聊', '郁闷'],
  general: [],
};

// 检测用户消息的情感类别
function detectMessageCategory(message: string): MessageCategory {
  const lower = message.toLowerCase();
  // 按优先级检测
  const priorityOrder: MessageCategory[] = ['farewell', 'greeting', 'question', 'surprise', 'laughter', 'agreement', 'comfort', 'positive', 'negative'];
  for (const cat of priorityOrder) {
    if (CATEGORY_KEYWORDS[cat].some(k => lower.includes(k))) return cat;
  }
  return 'general';
}

// 从数组中随机选取
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 按概率决定是否执行
function chance(probability: number): boolean {
  return Math.random() < probability;
}

// === 核心：蒸馏分身回复生成 ===
// 借鉴 persona-skill 方法论：用真实表达替代通用模板

export function generateAvatarResponse(
  userMessage: string,
  chatStyle: ChatStyle,
  recentMessages?: ChatMessage[]
): string {
  const category = detectMessageCategory(userMessage);
  const isShortReplier = chatStyle.personality === '惜字如金型' ||
    chatStyle.communicationTraits?.usesVoiceMessages;

  // === 第一优先：使用真实回复模式 ===
  // persona-skill 核心理念："方法论可迁移，口癖不重要" — 但真实表达优先于通用模板
  const realReplies = chatStyle.realReplyPatterns;

  // 对于短回复场景（问候/告别/认同/笑声），优先用真实说过的话
  if (category === 'greeting' && realReplies?.greeting?.length > 0 && chance(0.7)) {
    return applyPunctuation(pick(realReplies.greeting), chatStyle);
  }
  if (category === 'farewell' && realReplies?.farewell?.length > 0 && chance(0.7)) {
    return applyPunctuation(pick(realReplies.farewell), chatStyle);
  }
  if (category === 'laughter' && realReplies?.laughter?.length > 0 && chance(0.7)) {
    return applyPunctuation(pick(realReplies.laughter), chatStyle);
  }
  if (category === 'agreement' && realReplies?.agreement?.length > 0 && chance(0.7)) {
    return applyPunctuation(pick(realReplies.agreement), chatStyle);
  }
  if (category === 'comfort' && realReplies?.comfort?.length > 0 && chance(0.6)) {
    return applyPunctuation(pick(realReplies.comfort), chatStyle);
  }
  if (category === 'surprise' && realReplies?.surprise?.length > 0 && chance(0.6)) {
    return applyPunctuation(pick(realReplies.surprise), chatStyle);
  }

  // === 第二优先：使用旧版表达习惯 ===
  if (category === 'greeting' && chatStyle.greetingPatterns.length > 0 && chance(0.5)) {
    return applyPunctuation(pick(chatStyle.greetingPatterns), chatStyle);
  }
  if (category === 'farewell' && chatStyle.farewellPatterns.length > 0 && chance(0.5)) {
    return applyPunctuation(pick(chatStyle.farewellPatterns), chatStyle);
  }
  if (category === 'laughter' && chatStyle.laughterPatterns.length > 0 && chance(0.5)) {
    return applyPunctuation(pick(chatStyle.laughterPatterns), chatStyle);
  }
  if (category === 'agreement' && chatStyle.agreementPatterns.length > 0 && chance(0.5)) {
    return applyPunctuation(pick(chatStyle.agreementPatterns), chatStyle);
  }

  // === 第三优先：使用真实通用回复 ===
  if (realReplies?.general?.length > 0 && isShortReplier && chance(0.6)) {
    return applyPunctuation(pick(realReplies.general), chatStyle);
  }

  // === 组合回复：句式模板 + 高频词 + 上下文 ===
  let response = composeResponse(userMessage, category, chatStyle, recentMessages);

  // === 应用表达 DNA 修饰 ===
  response = applyExpressionDNA(response, chatStyle);

  // === 应用沟通特质调校 ===
  response = calibrateByTraits(response, chatStyle);

  return response;
}

// === 组合回复：从多个信号源合成 ===
function composeResponse(
  userMessage: string,
  category: MessageCategory,
  chatStyle: ChatStyle,
  recentMessages?: ChatMessage[]
): string {
  const realReplies = chatStyle.realReplyPatterns;

  // 策略 A：句式模板填充（适合较长回复）
  if (chatStyle.sentenceTemplates.length > 0 && chance(0.35) && category === 'general') {
    const template = pick(chatStyle.sentenceTemplates);
    const filled = fillTemplate(template, chatStyle, userMessage);
    if (filled) return filled;
  }

  // 策略 B：真实通用回复作为基底 + 个性化修饰
  if (realReplies?.general?.length > 0 && chance(0.4)) {
    return embellish(pick(realReplies.general), chatStyle, category);
  }

  // 策略 C：上下文感知回复
  if (recentMessages && recentMessages.length > 0 && chance(0.3)) {
    const contextReply = generateContextualReply(userMessage, category, chatStyle, recentMessages);
    if (contextReply) return contextReply;
  }

  // 策略 D：通用回复 + 自然修饰
  const baseReplies = getBaseReplies(category, chatStyle);
  return embellish(pick(baseReplies), chatStyle, category);
}

// 填充句式模板
function fillTemplate(template: string, chatStyle: ChatStyle, userMessage: string): string | null {
  const { highFrequencyWords, commonEmojis } = chatStyle;

  // 用高频词或用户消息中的关键词填充 {内容}
  if (template.includes('{内容}')) {
    // 从用户消息中提取关键词（2-4字的中文词）
    const userKeywords = userMessage.replace(/[^\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && w.length <= 6);
    const filler = userKeywords.length > 0
      ? pick(userKeywords)
      : (highFrequencyWords.length > 0 ? pick(highFrequencyWords) : '');
    if (filler) {
      return template.replace('{内容}', filler);
    }
  }
  return null;
}

// 通用回复基底（降级方案）
function getBaseReplies(category: MessageCategory, chatStyle: ChatStyle): string[] {
  const isCasual = chatStyle.languageStyle === 'casual' || chatStyle.languageStyle === 'mixed';
  const templates: Record<MessageCategory, { casual: string[]; formal: string[] }> = {
    greeting: {
      casual: ['来了', '在呢', '嗯嗯', '你好呀', '来了来了'],
      formal: ['你好', '在的', '嗯', '你好呀'],
    },
    farewell: {
      casual: ['拜拜', '走了', '嗯嗯拜', '溜了'],
      formal: ['再见', '拜拜', '嗯', '好'],
    },
    question: {
      casual: ['嗯？', '咋了', '什么事', '说吧'],
      formal: ['嗯？', '怎么了', '什么事'],
    },
    agreement: {
      casual: ['对对', '嗯嗯', '是的', '确实', '没错'],
      formal: ['对', '是的', '嗯', '确实'],
    },
    laughter: {
      casual: ['哈哈', '笑死', '噗', '哈哈哈'],
      formal: ['哈哈', '嗯', '有趣'],
    },
    comfort: {
      casual: ['没事的', '别担心', '会好的', '加油'],
      formal: ['没事', '别担心', '会好'],
    },
    surprise: {
      casual: ['真的假的', '哇', '不会吧', '厉害'],
      formal: ['真的？', '哇', '嗯？'],
    },
    positive: {
      casual: ['嗯嗯', '好', '知道啦', '了解'],
      formal: ['嗯', '好', '知道', '了解'],
    },
    negative: {
      casual: ['没事的', '别担心', '会好的'],
      formal: ['没事', '别担心', '会好'],
    },
    general: {
      casual: ['嗯嗯', '好', '知道', '行', '是'],
      formal: ['嗯', '好', '了解', '是'],
    },
  };

  return isCasual ? templates[category].casual : templates[category].formal;
}

// === 自然修饰：基于表达 DNA 和沟通特质 ===
function embellish(base: string, chatStyle: ChatStyle, category: MessageCategory): string {
  let response = base;

  // 1. 注入高频词 — 更自然的方式
  if (chatStyle.highFrequencyWords.length > 0 && chance(0.25)) {
    const word = pick(chatStyle.highFrequencyWords);
    // 只在较长回复中注入，且只在句首或句尾
    if (response.length >= 3) {
      if (chance(0.5) && !response.startsWith(word)) {
        response = word + response;  // 句首（如 "真的" + "嗯嗯"）
      } else {
        response = response + ' ' + word;  // 句尾
      }
    }
  }

  // 2. 添加表情 — 受 emojiFrequency 控制
  const emojiChance = chatStyle.communicationTraits?.emojiFrequency ?? 0.3;
  if (chatStyle.commonEmojis.length > 0 && chance(emojiChance)) {
    const count = chatStyle.personality === '话多型' && chance(0.3) ? 2 : 1;
    for (let i = 0; i < count; i++) {
      response += pick(chatStyle.commonEmojis);
    }
  }

  // 3. 添加语气词 — 受 toneWords 控制
  if (chatStyle.toneWords.length > 0 && chance(0.35)) {
    // 根据表达 DNA 选择语气词
    const dnaTones = chatStyle.expressionDNA || [];
    const prefersMa = dnaTones.some(d => d.includes('嘛'));
    const prefersLa = dnaTones.some(d => d.includes('啦'));
    const prefersNe = dnaTones.some(d => d.includes('呢'));

    let tone: string;
    if (prefersMa && chatStyle.toneWords.includes('嘛') && chance(0.5)) {
      tone = '嘛';
    } else if (prefersLa && chatStyle.toneWords.includes('啦') && chance(0.5)) {
      tone = '啦';
    } else if (prefersNe && chatStyle.toneWords.includes('呢') && chance(0.5)) {
      tone = '呢';
    } else {
      tone = pick(chatStyle.toneWords);
    }
    // 语气词不重复添加
    if (!response.endsWith(tone)) {
      response += tone;
    }
  }

  // 4. 标点风格
  response = applyPunctuation(response, chatStyle);

  return response;
}

// 上下文感知回复
function generateContextualReply(
  userMessage: string,
  category: MessageCategory,
  chatStyle: ChatStyle,
  recentMessages: ChatMessage[]
): string | null {
  // 分析对话上下文
  const lastAvatarMsgs = recentMessages
    .filter(m => m.sender === 'avatar')
    .slice(-3);

  // 如果最近的回复中有人问了问题，尝试延续话题
  if (lastAvatarMsgs.length > 0) {
    const lastAvatarMsg = lastAvatarMsgs[lastAvatarMsgs.length - 1];
    const wasAsking = lastAvatarMsg.content.includes('？') || lastAvatarMsg.content.includes('?');

    if (wasAsking && category !== 'farewell') {
      // 对方之前问了问题，现在用户回答了 — 给一个回应
      const responses = chatStyle.languageStyle === 'casual'
        ? ['嗯嗯', '哦哦', '这样啊', '了解了', '好的', '知道了', '原来如此']
        : ['嗯', '好', '了解', '嗯嗯', '是这样'];
      return pick(responses);
    }
  }

  // 如果用户的消息很短（≤3字），可能是在回应
  if (userMessage.length <= 3 && category === 'general') {
    const ackReplies = chatStyle.realReplyPatterns?.general?.length > 0
      ? chatStyle.realReplyPatterns.general
      : ['嗯嗯', '好', '嗯', '是'];
    return pick(ackReplies);
  }

  return null;
}

// 应用标点符号风格
function applyPunctuation(response: string, chatStyle: ChatStyle): string {
  const ps = chatStyle.punctuationStyle;
  const dna = chatStyle.expressionDNA || [];

  // 根据表达 DNA 调整标点概率
  const exclamationBoost = dna.some(d => d.includes('感叹号')) ? 0.15 : 0;
  const tildeBoost = dna.some(d => d.includes('波浪号')) ? 0.15 : 0;
  const ellipsisBoost = dna.some(d => d.includes('省略号')) ? 0.1 : 0;

  if (ps.useExclamation && chance(0.25 + exclamationBoost)) {
    if (!response.endsWith('！') && !response.endsWith('!') && !response.endsWith('？') && !response.endsWith('?')) {
      response += '！';
    }
  }
  if (ps.useTilde && chance(0.25 + tildeBoost)) {
    if (!response.endsWith('~')) {
      response += '~';
    }
  }
  if (ps.useEllipsis && chance(0.15 + ellipsisBoost)) {
    if (!response.endsWith('...') && !response.endsWith('…')) {
      response += '...';
    }
  }

  return response;
}

// 应用表达 DNA 修饰
function applyExpressionDNA(response: string, chatStyle: ChatStyle): string {
  const dna = chatStyle.expressionDNA || [];
  if (dna.length === 0) return response;

  // 喜欢重复用字加强语气
  if (dna.some(d => d.includes('重复用字')) && chance(0.2)) {
    // 如果回复中有单字重复的词，加强它
    const repMap: Record<string, string> = {
      '对': '对对对', '是': '是是是', '好': '好好好',
      '嗯': '嗯嗯嗯', '哈哈': '哈哈哈', '行': '行行行',
    };
    for (const [from, to] of Object.entries(repMap)) {
      if (response.includes(from) && !response.includes(to)) {
        response = response.replace(from, to);
        break;
      }
    }
  }

  // 喜欢用反问句 — 对认同类回复追加反问
  if (dna.some(d => d.includes('反问')) && chance(0.15) && response.length <= 5) {
    const followUps = ['是吧？', '对吧？', '你说呢？', '不是吗？'];
    response += ' ' + pick(followUps);
  }

  return response;
}

// 根据沟通特质调校
function calibrateByTraits(response: string, chatStyle: ChatStyle): string {
  const traits = chatStyle.communicationTraits;
  if (!traits) return response;

  // 惜字如金 — 截断长回复
  if (chatStyle.personality === '惜字如金型' || traits.usesVoiceMessages) {
    if (response.length > 8 && chance(0.6)) {
      response = response.substring(0, 6);
      if (chatStyle.commonEmojis.length > 0 && chance(0.4)) {
        response += pick(chatStyle.commonEmojis);
      }
    }
  }

  // 话多型 — 可能追加追问或补充
  if (chatStyle.personality === '话多型' && chance(0.35)) {
    const addOns = traits.questionFrequency > 0.2
      ? ['你觉得呢？', '对吧？', '是吧？', '你说呢？', '咋想的？']
      : ['对吧对吧', '真的真的', '嘿嘿', '对了', '然后呢'];
    response += ' ' + pick(addOns);
  }

  // 回复长度模式
  if (chatStyle.responseLengthPattern === 'short' && response.length > 15 && chance(0.5)) {
    response = response.substring(0, 10);
    if (chatStyle.commonEmojis.length > 0 && chance(0.4)) {
      response += pick(chatStyle.commonEmojis);
    }
  }

  return response;
}

// 获取聊天风格描述
export function getChatStyleDescription(chatStyle: ChatStyle): string {
  const parts: string[] = [];

  if (chatStyle.personality) parts.push(chatStyle.personality);

  if (chatStyle.languageStyle) {
    const styleMap: Record<string, string> = { 'formal': '正式', 'casual': '随意', 'mixed': '混合' };
    parts.push(styleMap[chatStyle.languageStyle] || chatStyle.languageStyle);
  }

  if (chatStyle.sentiment) {
    const sentimentMap: Record<string, string> = { 'positive': '积极', 'neutral': '中性', 'negative': '消极', 'mixed': '混合' };
    parts.push(sentimentMap[chatStyle.sentiment] || chatStyle.sentiment);
  }

  if (chatStyle.highFrequencyWords.length > 0) {
    parts.push(`常用词: ${chatStyle.highFrequencyWords.slice(0, 3).join('、')}`);
  }

  if (chatStyle.commonEmojis.length > 0) {
    parts.push(`常发表情: ${chatStyle.commonEmojis.slice(0, 3).join('')}`);
  }

  return parts.join(' | ');
}

// 生成聊天风格摘要
export function generateChatStyleSummary(chatStyle: ChatStyle): string {
  const summaryParts: string[] = [];

  summaryParts.push(`性格: ${chatStyle.personality}`);

  const styleMap: Record<string, string> = { 'formal': '正式', 'casual': '随意', 'mixed': '混合' };
  summaryParts.push(`语言风格: ${styleMap[chatStyle.languageStyle]}`);

  const sentimentMap: Record<string, string> = { 'positive': '积极向上', 'neutral': '平和稳定', 'negative': '偏消极', 'mixed': '情感丰富' };
  summaryParts.push(`情感倾向: ${sentimentMap[chatStyle.sentiment]}`);

  if (chatStyle.topicPreferences.length > 0) {
    summaryParts.push(`喜欢聊: ${chatStyle.topicPreferences.slice(0, 3).join('、')}`);
  }

  if (chatStyle.activeHours.length > 0) {
    const hours = [...chatStyle.activeHours].sort((a, b) => a - b);
    const timeRange = hours.length > 3
      ? `${hours[0]}-${hours[hours.length - 1]}点`
      : hours.map(h => `${h}点`).join('、');
    summaryParts.push(`活跃时间: ${timeRange}`);
  }

  const lengthMap: Record<string, string> = { 'short': '简短', 'medium': '适中', 'long': '详细', 'variable': '多变' };
  summaryParts.push(`回复长度: ${lengthMap[chatStyle.responseLengthPattern]}`);

  // 沟通特质
  if (chatStyle.communicationTraits) {
    const t = chatStyle.communicationTraits;
    if (t.questionFrequency > 0.2) summaryParts.push('爱提问');
    if (t.isInitiator) summaryParts.push('主动型');
  }

  // 表达 DNA
  if (chatStyle.expressionDNA && chatStyle.expressionDNA.length > 0) {
    summaryParts.push(`表达特点: ${chatStyle.expressionDNA.slice(0, 2).join('、')}`);
  }

  return summaryParts.join('\n');
}
