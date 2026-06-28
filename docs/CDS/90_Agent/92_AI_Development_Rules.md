# 92 — AI 开发通用规则 (AI Development Rules)

> **Companion（伴伴）AI 开发通用规则**
> 版本：v1.0 | 日期：2026-06-28 | 状态：正式发布
>
> 本文件适用于所有 AI 开发工具（TRAE、Cursor、Claude、Copilot 等），是 AI 辅助开发的通用规范。

---

## 一、概述

### 1.1 适用范围

本规范适用于以下 AI 开发工具：

| 工具 | 配置方式 | 说明 |
|------|----------|------|
| TRAE IDE | `90_TRAE_System_Prompt.md` | 主要开发工具 |
| Cursor | `.cursorrules` | Cursor 规则文件 |
| Claude Code | `.claude/rules` | Claude 规则目录 |
| GitHub Copilot | `.github/copilot-instructions.md` | Copilot 指令 |
| 其他 AI 工具 | 直接引用 CDS 文件 | 通用规则 |

### 1.2 核心原则

| 原则 | 说明 |
|------|------|
| 隐私优先 | 不生成任何网络请求代码（V1.0） |
| 设计一致 | 严格遵循 Design System |
| 代码质量 | TypeScript 严格模式 |
| 用户友好 | 温暖友好的 UI 文案 |
| 可维护 | 清晰的代码结构 |

---

## 二、代码生成规则

### 2.1 组件生成

生成新组件时，必须遵循以下规则：

```tsx
// ✅ 正确的组件生成模板
import React from 'react';

// Props 接口定义
interface ComponentNameProps {
  // 必选 Props
  requiredProp: string;
  // 可选 Props
  optionalProp?: number;
  // 回调 Props
  onAction?: (id: string) => void;
  // 样式 Props
  className?: string;
}

// 默认值
const DEFAULT_PROPS = {
  optionalProp: 0,
};

export function ComponentName({ 
  requiredProp, 
  optionalProp = DEFAULT_PROPS.optionalProp,
  onAction,
  className 
}: ComponentNameProps) {
  // Hooks
  // 状态
  // 副作用
  // 事件处理
  // 渲染
  
  return (
    <div className={`base-styles ${className || ''}`}>
      {/* 组件内容 */}
    </div>
  );
}
```

### 2.2 页面生成

生成新页面时，必须包含以下结构：

```tsx
// ✅ 正确的页面生成模板
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';

export function PageName() {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 页面标题 */}
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center 
                       rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
            页面标题
          </h1>
        </div>
        
        {/* 页面内容 */}
        <main className="px-4 pb-20 lg:pb-4">
          {/* 内容区域 */}
        </main>
      </div>
    </Layout>
  );
}
```

### 2.3 工具函数生成

生成工具函数时，必须遵循以下规则：

```typescript
// ✅ 正确的工具函数模板

/**
 * 函数功能描述
 * @param param1 参数1说明
 * @param param2 参数2说明
 * @returns 返回值说明
 */
export function utilityFunction(
  param1: string,
  param2: number
): string {
  // 实现逻辑
  return `${param1}_${param2}`;
}

// 测试用例
describe('utilityFunction', () => {
  it('应正确处理输入', () => {
    expect(utilityFunction('test', 123)).toBe('test_123');
  });
});
```

---

## 三、文件修改规则

### 3.1 修改前检查

在修改任何文件之前，必须先检查：

| 检查项 | 说明 |
|--------|------|
| 文件用途 | 理解文件的功能和职责 |
| 依赖关系 | 检查哪些文件依赖此文件 |
| 影响范围 | 评估修改可能影响的范围 |
| 测试覆盖 | 检查是否有相关测试 |

### 3.2 修改原则

| 原则 | 说明 |
|------|------|
| 最小变更 | 只修改必要的部分 |
| 保持兼容 | 不破坏现有功能 |
| 保持风格 | 遵循现有代码风格 |
| 保持结构 | 不改变文件组织结构 |

### 3.3 禁止修改的文件

以下文件在未经讨论的情况下**禁止修改**：

| 文件 | 说明 |
|------|------|
| `tailwind.config.js` | 样式配置 |
| `vite.config.ts` | 构建配置 |
| `tsconfig.json` | TypeScript 配置 |
| `package.json` | 依赖管理 |
| `eslint.config.js` | 代码规范配置 |

---

## 四、新增文件规则

### 4.1 新增文件检查

在新增文件之前，必须先检查：

| 检查项 | 说明 |
|--------|------|
| 是否已有类似文件 | 避免重复 |
| 文件放置位置 | 遵循文件结构规范 |
| 文件命名规范 | 遵循命名规则 |
| 是否需要更新导入 | 检查其他文件的引用 |

### 4.2 文件命名规范

| 文件类型 | 命名规范 | 示例 |
|----------|----------|------|
| React 组件 | PascalCase.tsx | `AvatarCard.tsx` |
| React 页面 | PascalCase.tsx | `Home.tsx` |
| TypeScript 工具 | camelCase.ts | `dateUtils.ts` |
| TypeScript 类型 | PascalCase.ts | `types/index.ts` |
| CSS 样式 | kebab-case.css | `index.css` |
| 测试文件 | *.test.ts | `dateUtils.test.ts` |

### 4.3 文件放置规范

| 文件类型 | 放置位置 |
|----------|----------|
| 页面组件 | `src/pages/` |
| 共享组件 | `src/components/` |
| 页面专属组件 | `src/pages/[PageName]/` |
| 自定义 Hooks | `src/hooks/` |
| 工具函数 | `src/utils/` 或 `src/lib/` |
| 服务 | `src/services/` |
| 状态管理 | `src/stores/` |
| 类型定义 | `src/types/` |

---

## 五、设计系统遵守规则

### 5.1 颜色使用规则

**必须遵守：**

```tsx
// ✅ 正确：使用 TailwindCSS 令牌
<div className="bg-[#E8734A] text-white">
<button className="bg-green-500 text-white">
<span className="text-red-500">

// ✅ 正确：使用语义化类名
<div className="bg-white dark:bg-gray-800">
<span className="text-gray-500 dark:text-gray-400">
```

**绝对禁止：**

```tsx
// ❌ 硬编码颜色值
<div style={{ backgroundColor: '#FF6B35' }}>
<button style={{ color: 'rgb(76, 175, 80)' }}>

// ❌ 使用未定义的颜色
<div className="bg-brand-primary">
<span className="text-custom-gray">
```

### 5.2 间距使用规则

**必须遵守：**

```tsx
// ✅ 使用 8pt Grid 间距
<div className="p-4">        {/* 16px */}
<div className="m-2">        {/* 8px */}
<div className="gap-6">      {/* 24px */}
<div className="space-y-4">  {/* 16px 间距 */}
```

**禁止使用非标准间距：**

```tsx
// ❌ 非标准间距值
<div className="p-[13px]">
<div className="m-[7px]">
<div className="gap-[11px]">
```

### 5.3 圆角使用规则

**必须遵守：**

```tsx
// ✅ 使用圆角系统
<div className="rounded-xl">     {/* 12px - 按钮、输入框 */}
<div className="rounded-[20px]"> {/* 20px - 卡片 */}
<div className="rounded-[24px]"> {/* 24px - 模态框 */}
<div className="rounded-full">   {/* 圆形 */}
```

### 5.4 阴影使用规则

**必须遵守：**

```tsx
// ✅ 使用阴影系统
<div className="shadow-md">  {/* 默认卡片阴影 */}
<div className="shadow-lg">  {/* 悬浮状态 */}
<div className="shadow-xl">  {/* 模态框 */}
```

---

## 六、隐私规则

### 6.1 数据存储

**必须遵守：**

```typescript
// ✅ 使用 StorageService
import { storageService } from '../services/storageService';

storageService.saveRelatives(relatives);
const relatives = storageService.getRelatives();
```

**绝对禁止：**

```typescript
// ❌ 直接使用 localStorage
localStorage.setItem('data', JSON.stringify(data));

// ❌ 使用 fetch/axios
fetch('https://api.example.com/data');

// ❌ 使用第三方存储
import { database } from 'firebase';
```

### 6.2 网络请求

**V1.0 阶段绝对禁止任何网络请求：**

```typescript
// ❌ 禁止所有网络请求
fetch('...');
axios.get('...');
XMLHttpRequest();
navigator.sendBeacon('...');
```

### 6.3 第三方 SDK

**V1.0 阶段绝对禁止集成第三方 SDK：**

```typescript
// ❌ 禁止追踪 SDK
import { Analytics } from 'analytics';
import * as Sentry from '@sentry/react';
import { Mixpanel } from 'mixpanel-browser';

// ❌ 禁止广告 SDK
import { AdMob } from '@capacitor-community/admob';

// ❌ 禁止社交 SDK
import { FacebookLogin } from '@capacitor-community/facebook-login';
```

---

## 七、性能规则

### 7.1 渲染性能

| 规则 | 说明 |
|------|------|
| 避免不必要的重渲染 | 使用 React.memo、useMemo、useCallback |
| 使用 key | 列表渲染必须提供唯一 key |
| 虚拟滚动 | 长列表使用虚拟滚动 |
| 图片优化 | 使用 WebP 格式，添加懒加载 |

```tsx
// ✅ 正确的性能优化
const MemoizedCard = React.memo(function Card({ data }) {
  return <div>{data.name}</div>;
});

// ✅ 正确的列表渲染
{items.map(item => (
  <MemoizedCard key={item.id} data={item} />
))}

// ✅ 正确的 useMemo 使用
const filteredItems = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);
```

### 7.2 包大小

| 规则 | 说明 |
|------|------|
| 避免大型依赖 | 评估每个新依赖的大小 |
| 按需导入 | 只导入需要的部分 |
| 代码分割 | 使用 React.lazy 进行路由级分割 |

### 7.3 内存管理

| 规则 | 说明 |
|------|------|
| 清理副作用 | useEffect 返回清理函数 |
| 避免内存泄漏 | 取消未完成的异步操作 |
| 合理使用缓存 | 避免无限缓存增长 |

---

## 八、测试规则

### 8.1 测试编写原则

| 原则 | 说明 |
|------|------|
| AAA 模式 | Arrange-Act-Assert |
| 单一职责 | 每个测试只验证一个行为 |
| 独立性 | 测试之间互不影响 |
| 可重复 | 每次运行结果一致 |

### 8.2 测试命名规范

```typescript
describe('组件/函数名称', () => {
  describe('功能描述', () => {
    it('应正确处理...场景', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### 8.3 测试覆盖率要求

| 模块 | 目标覆盖率 |
|------|-----------|
| utils/ | ≥ 90% |
| services/ | ≥ 80% |
| hooks/ | ≥ 80% |
| components/ | ≥ 70% |
| pages/ | ≥ 60% |

---

## 九、文档规则

### 9.1 代码注释

| 规则 | 说明 |
|------|------|
| 使用英文 | 代码注释使用英文 |
| 解释 why | 注释解释为什么，而不是做什么 |
| 保持更新 | 注释与代码同步更新 |
| 避免废话 | 不写无意义的注释 |

```typescript
// ✅ 正确的注释
// Use debounce to avoid excessive API calls during rapid typing
const debouncedSearch = debounce(handleSearch, 300);

// ❌ 无意义的注释
// 搜索
const search = () => {};
```

### 9.2 README 更新

以下情况需要更新 README：

- 新增功能模块
- 修改技术栈
- 更新开发流程
- 添加新的配置说明

### 9.3 CDS 更新

以下情况需要更新 CDS 规范：

- 新增 Design Token
- 新增组件规范
- 修改开发流程
- 添加新的规则

---

## 十、完整 Do/Don't 列表

### 10.1 Do（必须做）

| 类别 | 必须做 |
|------|--------|
| **代码** | ✅ 使用 TypeScript 严格模式 |
| **代码** | ✅ 使用 interface 定义 Props |
| **代码** | ✅ 为所有函数添加类型 |
| **代码** | ✅ 使用命名导出 |
| **设计** | ✅ 使用 Design Token |
| **设计** | ✅ 支持深色/浅色主题 |
| **设计** | ✅ 遵循 8pt Grid 间距 |
| **设计** | ✅ 使用预定义圆角 |
| **设计** | ✅ 使用预定义阴影 |
| **响应式** | ✅ 支持 Mobile/Tablet/Desktop |
| **响应式** | ✅ 最小点击区域 44×44px |
| **响应式** | ✅ 内容最大宽度 1200px |
| **隐私** | ✅ 使用 StorageService |
| **隐私** | ✅ 数据完全本地存储 |
| **隐私** | ✅ 不收集用户行为 |
| **文案** | ✅ 使用温暖友好的文案 |
| **文案** | ✅ 空状态有引导文案 |
| **文案** | ✅ 错误提示有帮助信息 |
| **测试** | ✅ 核心功能有测试覆盖 |
| **测试** | ✅ 边界情况有测试 |
| **Git** | ✅ 遵循提交规范 |
| **Git** | ✅ 一个提交只做一件事 |

### 10.2 Don't（绝对禁止）

| 类别 | 绝对禁止 |
|------|----------|
| **代码** | ❌ 使用 `any` 类型 |
| **代码** | ❌ 使用默认导出（除页面外） |
| **代码** | ❌ 使用中文注释代码 |
| **代码** | ❌ 复制粘贴代码 |
| **设计** | ❌ 修改 Design Token |
| **设计** | ❌ 硬编码颜色值 |
| **设计** | ❌ 新增未命名颜色 |
| **设计** | ❌ 使用非标准间距 |
| **设计** | ❌ 使用 JavaScript 动画库 |
| **响应式** | ❌ 只考虑单一屏幕尺寸 |
| **响应式** | ❌ 使用固定像素布局 |
| **隐私** | ❌ 添加网络请求 |
| **隐私** | ❌ 集成第三方追踪 SDK |
| **隐私** | ❌ 收集用户行为数据 |
| **隐私** | ❌ 直接使用 localStorage |
| **文案** | ❌ 使用冷冰冰的文案 |
| **文案** | ❌ 使用机械式回复 |
| **文案** | ❌ 制造焦虑（如"N天没联系"） |
| **测试** | ❌ 跳过核心功能测试 |
| **Git** | ❌ 提交未完成的代码 |
| **Git** | ❌ 提交包含敏感信息 |
| **Git** | ❌ 强制推送到 main |

---

## 十一、AI 工具特定配置

### 11.1 TRAE IDE 配置

TRAE IDE 使用 `90_TRAE_System_Prompt.md` 作为系统提示词。

在 TRAE 中使用：
```
请先阅读 CDS/90_Agent/90_TRAE_System_Prompt.md 和相关模块规范。
```

### 11.2 Cursor 配置

Cursor 使用 `.cursorrules` 文件：

```
在项目根目录创建 .cursorrules 文件，内容引用 CDS 规范。
```

### 11.3 Claude Code 配置

Claude Code 使用 `.claude/rules` 目录：

```
在项目根目录创建 .claude/rules/ 目录，将 CDS 规范作为规则文件。
```

### 11.4 GitHub Copilot 配置

GitHub Copilot 使用 `.github/copilot-instructions.md`：

```
在 .github/ 目录下创建 copilot-instructions.md，引用 CDS 规范。
```

---

> **Companion AI 开发通用规则 — 适用于所有 AI 工具的开发规范。**
