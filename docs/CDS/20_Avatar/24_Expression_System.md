# 24 — 表情系统 (Expression System)

> **Companion 表情系统：让 Q 版小人表达情感**

---

## 一、表情系统概述

### 1.1 设计目标

- 8 种基础表情（V1.0）
- 12 种扩展表情（V2.0）
- 支持表情动画（Lottie）
- 与 AI 联动（自动切换）

### 1.2 表情列表

| ID | 表情名 | 英文 | 情感 | 描述 |
|----|--------|------|------|------|
| 0 | 微笑 | smile | 积极 | 标准微笑 |
| 1 | 大笑 | laugh | 积极 | 张嘴大笑 |
| 2 | 害怕 | scared | 消极 | 眼睛睁大 |
| 3 | 生气 | angry | 消极 | 皱眉 |
| 4 | 惊讶 | surprise | 中性 | 嘴巴张开 |
| 5 | 难过 | sad | 消极 | 眼睛下垂 |
| 6 | 困惑 | confused | 中性 | 歪头 |
| 7 | 爱心 | love | 积极 | 眼睛变爱心 |
| 8-19 | (V2.0) | ... | ... | 更多表情 |

---

## 二、表情实现

### 2.1 SVG 表情

每个表情通过替换眼睛和嘴巴组件实现：

```typescript
const EXPRESSIONS: Record<number, {
  eyes: React.FC<AvatarPartProps>;
  mouth: React.FC<AvatarPartProps>;
}> = {
  0: { eyes: EyesNormal, mouth: MouthSmile },
  1: { eyes: EyesHappy, mouth: MouthLaugh },
  2: { eyes: EyesWide, mouth: MouthSmall },
  3: { eyes: EyesAngry, mouth: MouthAngry },
  // ...
};
```

### 2.2 表情切换动画

```css
/* 表情切换过渡 */
.expression-transition {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 三、AI 联动

### 3.1 自动表情切换

| AI 检测到的情感 | 触发表情 | 说明 |
|----------------|----------|------|
| 积极/开心 | smile / laugh | 微笑或大笑 |
| 消极/难过 | sad | 难过 |
| 惊讶 | surprise | 惊讶 |
| 生气 | angry | 生气 |
| 关爱 | love | 爱心 |
| 默认 | idle (smile) | 待机微笑 |

### 3.2 实现方式

```typescript
function detectExpression(message: string): number {
  const sentiment = analyzeSentiment(message);
  
  if (sentiment > 0.5) return 1; // laugh
  if (sentiment > 0.2) return 0; // smile
  if (sentiment < -0.5) return 3; // angry
  if (sentiment < -0.2) return 5; // sad
  
  return 0; // default smile
}
```

---

## 四、表情数据模型

```typescript
interface Expression {
  id: number;
  name: string;
  english: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  eyes: React.FC;
  mouth: React.FC;
  animation?: string; // Lottie 动画名
}
```

---

## 五、表情选择器

```
┌──────────────────────────────┐
│  选择表情                     │
├──────────────────────────────┤
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐      │
│  │😊│ │😂│ │😨│ │😡│      │
│  │微笑│ │大笑│ │害怕│ │生气│      │
│  └──┘ └──┘ └──┘ └──┘      │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐      │
│  │😮│ │😢│ │😕│ │😍│      │
│  │惊讶│ │难过│ │困惑│ │爱心│      │
│  └──┘ └──┘ └──┘ └──┘      │
└──────────────────────────────┘
```

---

## 六、V2.0 扩展表情

| ID | 表情 | 描述 |
|----|------|------|
| 8 | 睡觉 | ZZZ |
| 9 | 思考 | 手托下巴 |
| 10 | 嘘 | 手指放嘴边 |
| 11 | 晕 | 转圈眼 |
| 12 | 做鬼脸 | 吐舌头 |
| 13 | 哭泣 | 眼泪 |
| 14 | 冷汗 | 头上汗珠 |
| 15 | 害羞 | 脸红 |
| 16 | 得意 | 傲娇 |
| 17 | 无语 | 黑线 |
| 18 | 期待 | 眼睛放光 |
| 19 | 感动 | 泪光 |

---

> **Companion 表情系统 — 让每个小人都能表达心情。**
