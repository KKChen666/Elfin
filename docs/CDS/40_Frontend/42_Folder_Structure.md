# 42 — 文件结构 (Folder Structure)

> **Companion 文件组织：模块化，清晰，易维护**

---

## 一、当前结构

```
Elfin/
├── android/                    # Capacitor Android 工程
├── public/                     # 静态资源
├── q-avatar-design/            # 设计稿
├── src/
│   ├── assets/                 # 静态资源
│   ├── components/
│   │   ├── avatar/             # 头像组件
│   │   │   ├── AvatarCard.tsx
│   │   │   ├── AvatarPreview.tsx
│   │   │   └── ImageUploader.tsx
│   │   └── Layout.tsx
│   ├── hooks/
│   │   └── useTheme.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/                  # 10个页面
│   ├── services/
│   │   └── storageService.ts
│   ├── stores/
│   │   └── useRelativeStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── chatUtils.ts
│   │   └── dateUtils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── CDS/                        # 开发规范
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 二、推荐演进结构 (V2.0)

```
src/
├── app/                        # 应用壳
│   ├── App.tsx
│   ├── Router.tsx
│   └── Layout.tsx
├── features/                   # 功能模块
│   ├── avatar/                 # 头像模块
│   │   ├── components/
│   │   │   ├── AvatarCard.tsx
│   │   │   ├── AvatarPreview.tsx
│   │   │   └── ImageUploader.tsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── index.ts
│   ├── chat/                   # 聊天模块
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── relative/               # 亲友模块
│   ├── reminder/               # 提醒模块
│   └── stats/                  # 统计模块
├── shared/                     # 共享模块
│   ├── components/             # 基础UI组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Tag.tsx
│   ├── hooks/                  # 共享Hooks
│   ├── types/                  # 共享类型
│   └── utils/                  # 共享工具
├── services/                   # 服务层
│   ├── storageService.ts
│   ├── dateService.ts
│   └── nlpService.ts
├── stores/                     # Zustand Store
│   ├── useRelativeStore.ts
│   └── useAppStore.ts
└── assets/                     # 静态资源
    ├── images/
    ├── lottie/
    └── svg/
```

---

## 三、文件命名规则

| 类型 | 命名 | 示例 |
|------|------|------|
| 组件 | PascalCase.tsx | `AvatarCard.tsx` |
| Hook | useXxx.ts | `useTheme.ts` |
| 工具 | camelCase.ts | `chatUtils.ts` |
| 类型 | index.ts / types.ts | `types/index.ts` |
| 样式 | xxx.css | `index.css` |
| 测试 | xxx.test.tsx | `AvatarCard.test.tsx` |

---

## 四、index.ts 导出规范

```typescript
// features/avatar/index.ts
export { default as AvatarCard } from './components/AvatarCard';
export { default as AvatarPreview } from './components/AvatarPreview';
```

---

## 五、配置文件

| 文件 | 说明 |
|------|------|
| package.json | NPM依赖 |
| tsconfig.json | TypeScript配置 |
| vite.config.ts | Vite构建配置 |
| tailwind.config.js | TailwindCSS配置 |
| postcss.config.js | PostCSS配置 |
| eslint.config.js | ESLint配置 |
| capacitor.config.ts | Capacitor配置 |

---

> **Companion 文件结构 — 模块化设计，清晰易维护。**
