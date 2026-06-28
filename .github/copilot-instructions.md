# GitHub Copilot Instructions — Companion (伴伴)

> 遵循 CDS v1.0 规范生成代码。

## 项目技术栈

React 18 + TypeScript + Vite + TailwindCSS + Zustand + Capacitor Android

## 硬性规则

1. **不破坏 Design System** — 不修改 #E8734A 主色、8pt间距、圆角/阴影规范
2. **不新增未命名颜色** — 只用 Tailwind 类名或已定义的 Token
3. **不写重复组件** — 先检查是否已有可复用组件
4. **响应式** — 所有页面支持 Mobile + Desktop
5. **深色模式** — 所有组件用 `dark:` 类名
6. **隐私** — 所有数据 localStorage，不发网络请求
7. **温暖文案** — 不说教、不机械、不PUA

## 设计规范速查

| 元素 | 规格 |
|------|------|
| 主色 | #E8734A |
| 按钮 | h-12 rounded-xl |
| 输入框 | h-[52px] rounded-xl |
| 卡片 | rounded-[20px] shadow-md |
| 头像 | rounded-full |
| 标签 | h-7 rounded-full |
| 间距 | 8pt grid |

## 组件规范

```tsx
// 标准组件模板
interface MyComponentProps {
  data: SomeType;
  className?: string;
}

export default function MyComponent({ data, className }: MyComponentProps) {
  return (
    <div className={cn("rounded-[20px] p-4 bg-white dark:bg-gray-800", className)}>
      {/* 内容 */}
    </div>
  );
}
```

## 编码规范

- 函数组件 + Hooks（禁止class）
- Props 用 interface 定义
- 动态样式用 `cn()` (clsx + twMerge)
- 导入顺序: React → 第三方 → 内部 → 样式

## 完整规范

详见 `CDS/` 目录。
