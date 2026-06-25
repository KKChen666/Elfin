import { ChatStyle } from '../types';

// 预设的回复模板库（按情感和场景分类）
const RESPONSE_TEMPLATES = {
  greeting: {
    positive: ['你好呀~', '嗨！来啦', '哈喽~', '在的在的', '来啦来啦'],
    neutral: ['你好', '嗨', '哈喽', '在吗', '嗯'],
    casual: ['来了来了', '咋了', '啥事', '嗯嗯说'],
  },
  farewell: {
    positive: ['拜拜~', '下次聊！', '先这样啦', '回见！', '溜了溜了', '下次见~'],
    neutral: ['拜拜', '再见', '嗯先这样', '好', '行'],
    casual: ['溜了', '撤了', '拜', '嗯嗯拜', '走了'],
  },
  question: {
    positive: ['嗯？怎么了？', '什么事呀？', '说吧说吧', '我在听呢', '怎么啦？'],
    neutral: ['嗯？', '怎么了', '什么事', '说', '嗯'],
    casual: ['咋了', '啥事', '嗯？', '说吧', '嗯嗯'],
  },
  agreement: {
    positive: ['对对对！', '没错没错', '是这样的', '赞同！', '说的太对了', '确实确实'],
    neutral: ['对', '是的', '没错', '嗯', '确实'],
    casual: ['对对', '是的', '没错', '嗯嗯', '确实'],
  },
  laughter: {
    positive: ['哈哈哈哈', '笑死', '哈哈哈', '太搞笑了', '噗嗤', '笑死我了'],
    neutral: ['哈哈', '笑', '搞笑', '有趣', '嗯'],
    casual: ['哈哈', '笑死', '噗', '搞笑', '有意思'],
  },
  thinking: {
    positive: ['让我想想...', '嗯...', '这个嘛...', '我想想啊', '思考中...'],
    neutral: ['嗯...', '想想', '这个', '嗯', '想'],
    casual: ['嗯...', '想想', '这个嘛', '嗯嗯', '想想看'],
  },
  general: {
    positive: ['嗯嗯', '好的', '知道了', '了解了', '原来是这样', '有道理', '确实'],
    neutral: ['嗯', '好', '知道', '了解', '嗯嗯', '是'],
    casual: ['嗯嗯', '好', '知道', '嗯', '是', '行'],
  },
  comfort: {
    positive: ['没事的', '别担心', '会好的', '加油', '抱抱', '没关系的'],
    neutral: ['没事', '别担心', '会好', '嗯', '好'],
    casual: ['没事', '别担心', '会好的', '嗯嗯', '好'],
  },
  surprise: {
    positive: ['真的吗！', '哇！', '天哪！', '不会吧！', '厉害了！', '太棒了！'],
    neutral: ['真的？', '哇', '嗯？', '不会吧', '哦'],
    casual: ['真的假的', '哇', '嗯？', '不会吧', '厉害'],
  },
};

// 情感关键词映射
const SENTIMENT_KEYWORDS = {
  positive: ['开心', '高兴', '快乐', '幸福', '棒', '好', '赞', '喜欢', '爱', '太好了'],
  negative: ['难过', '伤心', '生气', '烦', '讨厌', '不好', '糟糕', '累', '困', '无聊', '郁闷'],
  question: ['什么', '怎么', '为什么', '吗', '？', '?', '哪', '谁', '几', '多少'],
  farewell: ['拜拜', '再见', '晚安', '下次', '先这样', '走了', '溜了', '撤了'],
  greeting: ['你好', '嗨', '哈喽', '在吗', '早上好', '晚上好', '早', '晚'],
  agreement: ['对', '是', '没错', '确实', '赞同', '同意', '好的', '行', '可以'],
  surprise: ['真的', '哇', '天哪', '不会吧', '厉害', '太棒了', '震惊'],
  comfort: ['没事', '别担心', '会好的', '加油', '抱抱', '没关系'],
  laughter: ['哈哈', '笑', '噗', '嘿嘿', '嘻嘻', '搞笑', '有趣'],
};

// 检测消息情感类别
function detectMessageCategory(message: string): keyof typeof RESPONSE_TEMPLATES {
  const lowerMessage = message.toLowerCase();
  
  // 按优先级检测
  if (SENTIMENT_KEYWORDS.farewell.some(k => lowerMessage.includes(k))) return 'farewell';
  if (SENTIMENT_KEYWORDS.greeting.some(k => lowerMessage.includes(k))) return 'greeting';
  if (SENTIMENT_KEYWORDS.question.some(k => lowerMessage.includes(k))) return 'question';
  if (SENTIMENT_KEYWORDS.surprise.some(k => lowerMessage.includes(k))) return 'surprise';
  if (SENTIMENT_KEYWORDS.laughter.some(k => lowerMessage.includes(k))) return 'laughter';
  if (SENTIMENT_KEYWORDS.agreement.some(k => lowerMessage.includes(k))) return 'agreement';
  if (SENTIMENT_KEYWORDS.comfort.some(k => lowerMessage.includes(k))) return 'comfort';
  if (SENTIMENT_KEYWORDS.positive.some(k => lowerMessage.includes(k))) return 'general';
  if (SENTIMENT_KEYWORDS.negative.some(k => lowerMessage.includes(k))) return 'comfort';
  
  return 'general';
}

// 获取情感子类别
function getSentimentSubcategory(chatStyle: ChatStyle): 'positive' | 'neutral' | 'casual' {
  if (chatStyle.sentiment === 'positive' || chatStyle.languageStyle === 'casual') {
    return 'positive';
  }
  if (chatStyle.languageStyle === 'formal') {
    return 'neutral';
  }
  return 'casual';
}

// 根据聊天风格生成回复
export function generateAvatarResponse(userMessage: string, chatStyle: ChatStyle): string {
  // 1. 检测用户消息类别
  const category = detectMessageCategory(userMessage);
  
  // 2. 获取情感子类别
  const sentimentSub = getSentimentSubcategory(chatStyle);
  
  // 3. 从对应模板中选择回复
  const templates = RESPONSE_TEMPLATES[category][sentimentSub] || RESPONSE_TEMPLATES[category].neutral;
  let response = templates[Math.floor(Math.random() * templates.length)];
  
  // 4. 应用个性化特征
  
  // 使用用户的问候语/告别语习惯
  if (category === 'greeting' && chatStyle.greetingPatterns.length > 0 && Math.random() > 0.5) {
    response = chatStyle.greetingPatterns[Math.floor(Math.random() * chatStyle.greetingPatterns.length)];
  }
  if (category === 'farewell' && chatStyle.farewellPatterns.length > 0 && Math.random() > 0.5) {
    response = chatStyle.farewellPatterns[Math.floor(Math.random() * chatStyle.farewellPatterns.length)];
  }
  
  // 使用用户的笑声习惯
  if (category === 'laughter' && chatStyle.laughterPatterns.length > 0 && Math.random() > 0.5) {
    response = chatStyle.laughterPatterns[Math.floor(Math.random() * chatStyle.laughterPatterns.length)];
  }
  
  // 使用用户的肯定表达习惯
  if (category === 'agreement' && chatStyle.agreementPatterns.length > 0 && Math.random() > 0.5) {
    response = chatStyle.agreementPatterns[Math.floor(Math.random() * chatStyle.agreementPatterns.length)];
  }
  
  // 使用用户的犹豫表达习惯
  if (category === 'thinking' && chatStyle.hesitationPatterns.length > 0 && Math.random() > 0.5) {
    response = chatStyle.hesitationPatterns[Math.floor(Math.random() * chatStyle.hesitationPatterns.length)];
  }
  
  // 5. 添加高频词（更自然的组合）
  if (chatStyle.highFrequencyWords.length > 0 && Math.random() > 0.6) {
    const randomWord = chatStyle.highFrequencyWords[Math.floor(Math.random() * chatStyle.highFrequencyWords.length)];
    // 根据标点风格决定如何添加
    if (chatStyle.punctuationStyle.useTilde && Math.random() > 0.5) {
      response = randomWord + '~' + response;
    } else if (Math.random() > 0.5) {
      response = randomWord + '，' + response;
    } else {
      response = response + ' ' + randomWord;
    }
  }
  
  // 6. 添加表情（根据习惯决定数量）
  if (chatStyle.commonEmojis.length > 0 && Math.random() > 0.4) {
    const emojiCount = chatStyle.personality === '话多型' ? 
      (Math.random() > 0.5 ? 2 : 1) : 1;
    for (let i = 0; i < emojiCount; i++) {
      const randomEmoji = chatStyle.commonEmojis[Math.floor(Math.random() * chatStyle.commonEmojis.length)];
      response += randomEmoji;
    }
  }
  
  // 7. 添加语气词
  if (chatStyle.toneWords.length > 0 && Math.random() > 0.5) {
    const randomTone = chatStyle.toneWords[Math.floor(Math.random() * chatStyle.toneWords.length)];
    response += randomTone;
  }
  
  // 8. 应用标点符号风格
  if (chatStyle.punctuationStyle.useExclamation && Math.random() > 0.6) {
    if (!response.endsWith('！') && !response.endsWith('!')) {
      response += '！';
    }
  }
  if (chatStyle.punctuationStyle.useEllipsis && Math.random() > 0.7) {
    if (!response.endsWith('...') && !response.endsWith('…')) {
      response += '...';
    }
  }
  if (chatStyle.punctuationStyle.useTilde && Math.random() > 0.6) {
    if (!response.endsWith('~')) {
      response += '~';
    }
  }
  
  // 9. 根据性格类型调整回复长度
  if (chatStyle.personality === '话多型') {
    const extraPhrases = [
      '你觉得呢？',
      '对吧对吧',
      '是不是很有意思？',
      '哈哈',
      '真的真的',
      '对了',
      '还有',
      '然后',
    ];
    if (Math.random() > 0.4) {
      response += ' ' + extraPhrases[Math.floor(Math.random() * extraPhrases.length)];
    }
  } else if (chatStyle.personality === '惜字如金型') {
    if (response.length > 10 && Math.random() > 0.5) {
      response = response.substring(0, 8);
      if (chatStyle.commonEmojis.length > 0 && Math.random() > 0.5) {
        response += chatStyle.commonEmojis[0];
      }
    }
  }
  
  // 10. 根据回复长度模式调整
  if (chatStyle.responseLengthPattern === 'short' && response.length > 15) {
    response = response.substring(0, 12);
    if (chatStyle.commonEmojis.length > 0 && Math.random() > 0.5) {
      response += chatStyle.commonEmojis[0];
    }
  }
  
  return response;
}

// 获取聊天风格描述
export function getChatStyleDescription(chatStyle: ChatStyle): string {
  const parts: string[] = [];
  
  if (chatStyle.personality) {
    parts.push(chatStyle.personality);
  }
  
  if (chatStyle.languageStyle) {
    const styleMap = {
      'formal': '正式',
      'casual': '随意',
      'mixed': '混合',
    };
    parts.push(styleMap[chatStyle.languageStyle] || chatStyle.languageStyle);
  }
  
  if (chatStyle.sentiment) {
    const sentimentMap = {
      'positive': '积极',
      'neutral': '中性',
      'negative': '消极',
      'mixed': '混合',
    };
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

// 生成聊天风格摘要（借鉴 OpenHuman 记忆树概念）
export function generateChatStyleSummary(chatStyle: ChatStyle): string {
  const summaryParts: string[] = [];
  
  // 性格特征
  summaryParts.push(`性格: ${chatStyle.personality}`);
  
  // 语言风格
  const styleMap = {
    'formal': '正式',
    'casual': '随意',
    'mixed': '混合',
  };
  summaryParts.push(`语言风格: ${styleMap[chatStyle.languageStyle]}`);
  
  // 情感倾向
  const sentimentMap = {
    'positive': '积极向上',
    'neutral': '平和稳定',
    'negative': '偏消极',
    'mixed': '情感丰富',
  };
  summaryParts.push(`情感倾向: ${sentimentMap[chatStyle.sentiment]}`);
  
  // 话题偏好
  if (chatStyle.topicPreferences.length > 0) {
    summaryParts.push(`喜欢聊: ${chatStyle.topicPreferences.slice(0, 3).join('、')}`);
  }
  
  // 活跃时间
  if (chatStyle.activeHours.length > 0) {
    const hours = chatStyle.activeHours.sort((a, b) => a - b);
    const timeRange = hours.length > 3 ? 
      `${hours[0]}-${hours[hours.length - 1]}点` : 
      hours.map(h => `${h}点`).join('、');
    summaryParts.push(`活跃时间: ${timeRange}`);
  }
  
  // 回复习惯
  const lengthMap = {
    'short': '简短',
    'medium': '适中',
    'long': '详细',
    'variable': '多变',
  };
  summaryParts.push(`回复长度: ${lengthMap[chatStyle.responseLengthPattern]}`);
  
  // 标点习惯
  const punctuationHabits: string[] = [];
  if (chatStyle.punctuationStyle.useExclamation) punctuationHabits.push('感叹号');
  if (chatStyle.punctuationStyle.useQuestion) punctuationHabits.push('问号');
  if (chatStyle.punctuationStyle.useEllipsis) punctuationHabits.push('省略号');
  if (chatStyle.punctuationStyle.useTilde) punctuationHabits.push('波浪号');
  if (punctuationHabits.length > 0) {
    summaryParts.push(`标点习惯: 常用${punctuationHabits.join('、')}`);
  }
  
  return summaryParts.join('\n');
}
