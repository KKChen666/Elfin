export type RelationType = string;

export interface RelationCategory {
  key: string;
  label: string;
  items: { key: string; label: string }[];
}

export const RELATION_CATEGORIES: RelationCategory[] = [
  {
    key: 'family',
    label: '家人',
    items: [
      { key: 'grandpa', label: '爷爷' },
      { key: 'grandma', label: '奶奶' },
      { key: 'grandpa_maternal', label: '外公' },
      { key: 'grandma_maternal', label: '外婆' },
      { key: 'father', label: '父亲' },
      { key: 'mother', label: '母亲' },
      { key: 'uncle', label: '叔叔' },
      { key: 'aunt', label: '阿姨' },
      { key: 'brother', label: '兄弟' },
      { key: 'sister', label: '姐妹' },
      { key: 'son', label: '儿子' },
      { key: 'daughter', label: '女儿' },
      { key: 'spouse', label: '配偶' },
      { key: 'cousin', label: '表亲/堂亲' },
    ]
  },
  {
    key: 'friend',
    label: '朋友',
    items: [
      { key: 'best_friend', label: '挚友' },
      { key: 'friend', label: '朋友' },
      { key: 'neighbor', label: '邻居' },
    ]
  },
  {
    key: 'colleague',
    label: '同事',
    items: [
      { key: 'boss', label: '上司' },
      { key: 'colleague', label: '同事' },
      { key: 'client', label: '客户' },
    ]
  },
  {
    key: 'classmate',
    label: '同学',
    items: [
      { key: 'classmate', label: '同学' },
      { key: 'schoolmate', label: '校友' },
      { key: 'teacher', label: '老师' },
    ]
  },
];

export const RELATION_LABELS: Record<string, string> = {
  // 家人
  grandpa: '爷爷',
  grandma: '奶奶',
  grandpa_maternal: '外公',
  grandma_maternal: '外婆',
  father: '父亲',
  mother: '母亲',
  uncle: '叔叔',
  aunt: '阿姨',
  brother: '兄弟',
  sister: '姐妹',
  son: '儿子',
  daughter: '女儿',
  spouse: '配偶',
  cousin: '表亲/堂亲',
  // 朋友
  best_friend: '挚友',
  friend: '朋友',
  neighbor: '邻居',
  // 同事
  boss: '上司',
  colleague: '同事',
  client: '客户',
  // 同学
  classmate: '同学',
  schoolmate: '校友',
  teacher: '老师',
  // 兼容旧数据
  family: '家人',
  other: '其他',
};

export function getRelationLabel(relation: string): string {
  return RELATION_LABELS[relation] || relation;
}

export function getRelationCategory(relation: string): string {
  for (const cat of RELATION_CATEGORIES) {
    if (cat.items.some(item => item.key === relation)) return cat.label;
  }
  return '自定义';
}

export interface AvatarConfig {
  faceShape: number;
  hairstyle: number;
  eyeStyle: number;
  mouthStyle: number;
  clothing: number;
  accessory: number;
  skinColor: string;
  hairColor: string;
  clothingColor: string;
}

export interface ChatStyle {
  // 基础特征
  highFrequencyWords: string[];
  commonEmojis: string[];
  sentencePatterns: string[];
  toneWords: string[];
  avgMessageLength: number;
  personality: '话多型' | '惜字如金型' | '均衡型';
  styleKeywords: string[];
  
  // 高级特征（借鉴 OpenHuman 记忆树概念）
  languageStyle: 'formal' | 'casual' | 'mixed';  // 语言风格
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';  // 情感倾向
  topicPreferences: string[];  // 话题偏好
  activeHours: number[];  // 活跃时间段 (0-23)
  responseLengthPattern: 'short' | 'medium' | 'long' | 'variable';  // 回复长度模式
  greetingPatterns: string[];  // 问候语习惯
  farewellPatterns: string[];  // 告别语习惯
  questionPatterns: string[];  // 提问习惯
  agreementPatterns: string[];  // 肯定表达习惯
  hesitationPatterns: string[];  // 犹豫表达习惯
  laughterPatterns: string[];  // 笑声习惯
  punctuationStyle: {
    useExclamation: boolean;  // 是否常用感叹号
    useQuestion: boolean;  // 是否常用问号
    useEllipsis: boolean;  // 是否常用省略号
    useTilde: boolean;  // 是否常用波浪号
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'avatar';
  timestamp: string;
}

export interface Relative {
  id: string;
  name: string;
  birthday: string;
  isLunar: boolean;
  relation: RelationType;
  phone?: string;
  hobbies?: string;
  clothingSize?: string;
  shoeSize?: string;
  notes?: string;
  avatar: AvatarConfig;
  avatarImage?: string; // Base64 encoded uploaded avatar image
  chatStyle?: ChatStyle;
  zodiac?: string; // 星座
  chineseZodiac?: string; // 生肖
  mbti?: string; // MBTI人格类型
  address?: string; // 居住地址
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  relativeId: string;
  type: 'birthday' | 'mothers_day' | 'fathers_day' | 'custom';
  date: string;
  advanceDays: number[];
  isEnabled: boolean;
  lastNotified?: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  faceShape: 0,
  hairstyle: 0,
  eyeStyle: 0,
  mouthStyle: 0,
  clothing: 0,
  accessory: 0,
  skinColor: '#FFD5B8',
  hairColor: '#3D2314',
  clothingColor: '#E8734A'
};
