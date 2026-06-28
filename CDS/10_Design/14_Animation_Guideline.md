# 14 — 动画规范 (Animation Guideline)

> **Companion 的动画语言：轻柔、有趣、有温度**

---

## 一、动画哲学

Companion 的动画应该像一个温柔的朋友：
- **轻柔** — 不突兀，不刺眼
- **有趣** — 偶尔的小惊喜
- **有目的** — 每个动画都有意义
- **快速** — 不让用户等待

---

## 二、动画令牌

### 2.1 持续时间

| Token | 值 | 用途 |
|-------|-----|------|
| `--duration-fast` | 150ms | 微交互（按压缩放） |
| `--duration-normal` | 250ms | 默认过渡（颜色变化） |
| `--duration-slow` | 350ms | 页面切换（滑入滑出） |
| `--duration-slower` | 500ms | 复杂动画（展开收起） |

### 2.2 缓动函数

| Token | 值 | 用途 |
|-------|-----|------|
| `--easing-default` | cubic-bezier(0.4, 0, 0.2, 1) | 默认 |
| `--easing-bounce` | cubic-bezier(0.68, -0.55, 0.265, 1.55) | 弹性效果 |
| `--easing-smooth` | cubic-bezier(0.25, 0.1, 0.25, 1) | 平滑过渡 |
| `--easing-sharp` | cubic-bezier(0.4, 0, 1, 1) | 快速退出 |

---

## 三、组件动画规范

### 3.1 按钮点击

```css
/* 按压缩放 */
transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
&:active { transform: scale(0.95); }
```

### 3.2 页面切换

| 方向 | 动画 | 持续时间 |
|------|------|----------|
| 前进（右→左） | 滑入 | 300ms |
| 返回（左→右） | 滑出 | 300ms |
| 替换 | 淡入淡出 | 200ms |

### 3.3 模态框

```
入场：从底部滑入 + 淡入 (250ms, smooth easing)
退场：向底部滑出 + 淡出 (200ms, sharp easing)
遮罩：淡入/淡出 (200ms)
```

### 3.4 Toast

```
入场：从顶部滑入 (200ms, smooth easing)
退场：向顶部滑出 (150ms, sharp easing)
自动消失：3秒后退场
```

### 3.5 列表项

```
入场：淡入 + 上移 (200ms, stagger 50ms)
删除：淡出 + 下移 (150ms)
重排：位置过渡 (250ms, smooth easing)
```

### 3.6 头像切换

```
切换素材：交叉淡入淡出 (200ms)
切换颜色：颜色过渡 (300ms)
```

---

## 四、Lottie 动画规范

### 4.1 使用场景

| 场景 | 动画类型 | 说明 |
|------|----------|------|
| 角色表情 | 表情切换 | 微笑→眨眼→开心 |
| 角色动作 | 待机动作 | 摇头、挥手、跳跃 |
| 加载状态 | 骨架动画 | Q版小人走路 |
| 成功反馈 | 庆祝动画 | 撒花、星星 |
| 空状态 | 趣味动画 | Q版小人招手 |

### 4.2 Lottie 文件规范

| 属性 | 规范 |
|------|------|
| 格式 | JSON (Lottie) |
| 帧率 | 30fps |
| 最大尺寸 | 200×200px |
| 文件大小 | ≤ 50KB |
| 循环 | 根据场景（循环/单次） |

### 4.3 实现方式

```tsx
import Lottie from 'lottie-react';
import animationData from './animation.json';

<Lottie
  animationData={animationData}
  loop={true}
  autoplay={true}
  style={{ width: 200, height: 200 }}
/>
```

---

## 五、CSS 动画规范

### 5.1 常用动画类

```css
/* 淡入 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 从下方滑入 */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 弹性缩放 */
@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 呼吸效果 */
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### 5.2 Tailwind 动画

```tsx
{/* 淡入 */}
<div className="animate-fade-in">

{/* 从下方滑入 */}
<div className="animate-slide-up">

{/* 弹性效果 */}
<button className="active:scale-95 transition-transform duration-150">

{/* 加载旋转 */}
<div className="animate-spin">
```

---

## 六、性能优化

### 6.1 优先使用

1. **CSS Transitions** — 最高性能
2. **CSS Animations** — 高性能
3. **Transform + Opacity** — GPU 加速
4. **Lottie** — 矢量动画，轻量

### 6.2 避免

- ❌ 动画中使用 `width`、`height`、`margin`、`padding`
- ❌ 动画中触发 layout reflow
- ❌ 同时播放超过 3 个动画
- ❌ 在低端设备上播放复杂 Lottie

### 6.3 减少动画

```css
/* 尊重用户偏好 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 七、动画检查清单

| 检查项 | 要求 |
|--------|------|
| 持续时间 | ≤ 500ms（除特殊场景） |
| 缓动函数 | 使用设计令牌中的缓动 |
| GPU加速 | 仅使用 transform/opacity |
| 性能 | 不触发 layout reflow |
| 无障碍 | 尊重 prefers-reduced-motion |
| 一致性 | 同类动画使用相同时长 |

---

> **Companion 动画 — 轻柔有趣，恰到好处。**
