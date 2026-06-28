# 41 — 编码规范 (Coding Convention)

> **Companion 编码标准：TypeScript + React + TailwindCSS**

---

## 一、命名规范

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | PascalCase.tsx | `AvatarCard.tsx` |
| Hook文件 | use前缀 camelCase.ts | `useTheme.ts` |
| 工具文件 | camelCase.ts | `chatUtils.ts` |
| 类型文件 | index.ts 或 types.ts | `types/index.ts` |
| 常量 | UPPER_SNAKE_CASE | `RELATION_CATEGORIES` |
| 接口 | PascalCase | `AvatarConfig` |
| 变量/函数 | camelCase | `generateResponse` |

---

## 二、TypeScript 规范

### 2.1 接口 vs 类型别名

```typescript
// ✅ 数据结构用 interface
interface AvatarConfig {
  gender: number;
  faceShape: number;
}

// ✅ 联合类型用 type
type Sender = 'user' | 'avatar';
type Theme = 'light' | 'dark';
```

### 2.2 Props 定义

```typescript
// ✅ 正确：interface + 解构
interface AvatarCardProps {
  avatar: AvatarConfig;
  name: string;
  size?: number;
  onClick?: () => void;
}

export default function AvatarCard({ 
  avatar, name, size = 64, onClick 
}: AvatarCardProps) {
  return <div onClick={onClick}>...</div>;
}

// ❌ 错误：内联类型
function AvatarCard({ avatar, name }: { avatar: AvatarConfig; name: string }) {}
```

### 2.3 禁止 any

```typescript
// ✅ 使用 unknown 或具体类型
function parse(input: unknown): string { ... }

// ❌ 禁止
function parse(input: any): string { ... }
```

---

## 三、React 组件规范

### 3.1 文件结构

```tsx
import { useId, useState } from 'react';
import { SomeType } from '../../types';

interface MyComponentProps {
  // Props
}

export default function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // Hooks
  const id = useId();
  
  // State
  const [state, setState] = useState(false);
  
  // Effects
  // Handlers
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### 3.2 导入顺序

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. 第三方库
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

// 3. 内部组件
import Layout from '../components/Layout';

// 4. 内部工具/类型
import { formatDate } from '../utils/dateUtils';
import type { Relative } from '../types';

// 5. 样式
import './styles.css';
```

---

## 四、CSS/Tailwind 规范

```tsx
// ✅ 正确：Tailwind utility-first
<div className="rounded-[20px] p-4 bg-white dark:bg-gray-800 
                shadow-md text-gray-900 dark:text-gray-50">

// ✅ 动态样式用 clsx + twMerge
import { cn } from '../lib/utils';
<div className={cn(
  "base-styles",
  isActive && "active-styles",
  className
)}>

// ❌ 错误：内联样式（除动态值外）
<div style={{ backgroundColor: 'white' }}>
```

---

## 五、Git 规范

### 5.1 分支策略

| 分支 | 用途 |
|------|------|
| main | 生产分支 |
| develop | 开发分支 |
| feature/xxx | 功能分支 |
| fix/xxx | 修复分支 |

### 5.2 Commit 格式

```
type(scope): description

类型: feat | fix | refactor | style | test | docs
范围: avatar | chat | reminder | ui | core
```

示例：
```
feat(avatar): 添加心形脸型
fix(chat): 修复聊天记录解析错误
refactor(ui): 统一按钮组件
```

---

## 六、代码审查清单

- [ ] TypeScript 无 any
- [ ] 组件 Props 有类型定义
- [ ] 使用 Tailwind 类名
- [ ] 支持 dark mode
- [ ] 响应式布局
- [ ] 无硬编码颜色值
- [ ] 点击区域 ≥ 44px
- [ ] 文案温暖友好
- [ ] 数据本地存储

---

> **Companion 编码规范 — 统一标准，高质量代码。**
