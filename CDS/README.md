# Companion Design & Development Specification (CDS) v1.0

> **Companion（伴伴）官方开发规范**
> 
> 版本：v1.0 | 日期：2026-06-28 | 状态：正式发布

---

## 一、什么是 CDS？

**Companion Design & Development Specification（CDS）** 是 Companion（伴伴）项目的官方设计与开发规范体系。

就像 Apple 有 **Human Interface Guidelines（HIG）**、Google 有 **Material Design**、Microsoft 有 **Fluent Design**，Companion 项目也有自己的官方标准——**CDS**。

CDS 不是一份普通的 PRD 或开发文档，而是一套**完整的工程规范**，涵盖：

| 维度 | 内容 | 文件数 |
|------|------|--------|
| **项目定义** | 愿景、PRD、路线图、产品原则 | 4 |
| **设计系统** | 颜色、字体、组件、动画、插画 | 6 |
| **角色引擎** | 头像系统、素材、动画、成长、表情、服装 | 6 |
| **AI 规范** | 人格、记忆、知识、工作流 | 4 |
| **前端规范** | 架构、编码、文件结构、状态管理、组件规范 | 5 |
| **后端规范** | API、数据库、同步系统 | 3 |
| **Agent 规范** | TRAE 提示、任务规则、AI 开发规则 | 4 |
| **AI 工具配置** | Cursor Rules、Claude Rules、Copilot Instructions | 3+ |
| **合计** | — | **40+** |

---

## 二、快速导航

### 📁 项目定义 (`00_Project/`)

| 文件 | 说明 |
|------|------|
| [00_Project_Vision.md](./00_Project/00_Project_Vision.md) | 产品愿景与核心价值观 |
| [01_Product_PRD.md](./00_Project/01_Product_PRD.md) | 产品需求文档 |
| [02_Roadmap.md](./00_Project/02_Roadmap.md) | 产品路线图 |
| [03_Product_Principles.md](./00_Project/03_Product_Principles.md) | 产品设计原则 |

### 🎨 设计系统 (`10_Design/`)

| 文件 | 说明 |
|------|------|
| [10_Design_System.md](./10_Design/10_Design_System.md) | 设计系统总览 |
| [11_Color_System.md](./10_Design/11_Color_System.md) | 颜色系统 |
| [12_Typography.md](./10_Design/12_Typography.md) | 字体排版系统 |
| [13_Component_System.md](./10_Design/13_Component_System.md) | 组件设计规范 |
| [14_Animation_Guideline.md](./10_Design/14_Animation_Guideline.md) | 动画规范 |
| [15_Illustration_Guideline.md](./10_Design/15_Illustration_Guideline.md) | 插画规范 |

### 🎭 角色引擎 (`20_Avatar/`)

| 文件 | 说明 |
|------|------|
| [20_Avatar_Engine.md](./20_Avatar/20_Avatar_Engine.md) | 角色引擎架构 |
| [21_Avatar_Assets.md](./20_Avatar/21_Avatar_Assets.md) | 角色素材规范 |
| [22_Avatar_Animation.md](./20_Avatar/22_Avatar_Animation.md) | 角色动画系统 |
| [23_Avatar_Growth.md](./20_Avatar/23_Avatar_Growth.md) | 角色成长系统 |
| [24_Expression_System.md](./20_Avatar/24_Expression_System.md) | 表情系统 |
| [25_Costume_System.md](./20_Avatar/25_Costume_System.md) | 服装系统 |

### 🤖 AI 规范 (`30_AI/`)

| 文件 | 说明 |
|------|------|
| [30_AI_Personality.md](./30_AI/30_AI_Personality.md) | AI 人格系统 |
| [31_AI_Memory.md](./30_AI/31_AI_Memory.md) | AI 记忆系统 |
| [32_AI_Knowledge.md](./30_AI/32_AI_Knowledge.md) | AI 知识体系 |
| [33_AI_Workflow.md](./30_AI/33_AI_Workflow.md) | AI 工作流 |

### 💻 前端规范 (`40_Frontend/`)

| 文件 | 说明 |
|------|------|
| [40_Project_Architecture.md](./40_Frontend/40_Project_Architecture.md) | 项目架构 |
| [41_Coding_Convention.md](./40_Frontend/41_Coding_Convention.md) | 编码规范 |
| [42_Folder_Structure.md](./40_Frontend/42_Folder_Structure.md) | 文件结构 |
| [43_State_Management.md](./40_Frontend/43_State_Management.md) | 状态管理 |
| [44_Component_Convention.md](./40_Frontend/44_Component_Convention.md) | 组件开发规范 |

### ⚙️ 后端规范 (`50_Backend/`)

| 文件 | 说明 |
|------|------|
| [50_API.md](./50_Backend/50_API.md) | API 设计规范 |
| [51_Database.md](./50_Backend/51_Database.md) | 数据库设计规范 |
| [52_Sync_System.md](./50_Backend/52_Sync_System.md) | 同步系统规范 |

### 🤖 Agent 规范 (`90_Agent/`)

| 文件 | 说明 |
|------|------|
| [90_TRAE_System_Prompt.md](./90_Agent/90_TRAE_System_Prompt.md) | TRAE 系统提示词 |
| [91_TRAE_Task_Rules.md](./90_Agent/91_TRAE_Task_Rules.md) | TRAE 任务规则 |
| [92_AI_Development_Rules.md](./90_Agent/92_AI_Development_Rules.md) | AI 开发通用规则 |
| [README.md](./90_Agent/README.md) | Agent 规范说明 |

---

## 三、如何使用 CDS

### 对 AI 开发工具

告诉你的 AI 工具：

> 按 Companion CDS v1.0 规范继续开发。请先阅读 `CDS/90_Agent/90_TRAE_System_Prompt.md` 和相关模块规范。

支持的工具：
- **TRAE IDE** — 阅读 `90_Agent/` 目录下所有文件
- **Claude Code** — 阅读 `.claude/` 配置 + `CDS/` 相关模块
- **Cursor** — 阅读 `.cursorrules` + `CDS/` 相关模块
- **GitHub Copilot** — 阅读 `.github/copilot-instructions.md`
- **ChatGPT / Claude** — 直接引用 CDS 文件路径

### 对开发者

1. 开发前阅读对应模块的 CDS 文件
2. 遵循编码规范和组件规范
3. 新增功能前检查路线图中的规划
4. UI 开发严格遵循设计系统

### 对项目管理

- 路线图 (`02_Roadmap.md`) 定义了各阶段目标
- PRD (`01_Product_PRD.md`) 定义了功能需求
- 产品原则 (`03_Product_Principles.md`) 指导决策

---

## 四、技术栈

| 层面 | 技术 | 版本 |
|------|------|------|
| UI 框架 | React | 18.3.1 |
| 开发语言 | TypeScript | ~5.8.3 |
| 构建工具 | Vite | ^6.3.5 |
| 样式方案 | TailwindCSS | ^3.4.17 |
| 状态管理 | Zustand | ^5.0.3 |
| 路由 | React Router DOM | ^7.3.0 |
| 图标库 | Lucide React | ^0.511.0 |
| 原生打包 | Capacitor Android | ^8.4.1 |
| 代码检查 | ESLint | ^9.25.0 |
| 数据存储 | localStorage → IndexedDB | — |

---

## 五、设计哲学

> **让每一段关系都被温柔记住。**

Companion 的设计哲学根植于三个核心信念：

1. **隐私是基本权利** — 所有数据本地存储，聊天分析在设备端完成
2. **技术应该有温度** — AI 不是冰冷的工具，而是像老朋友一样的陪伴
3. **可爱是一种力量** — Q 版风格让科技变得亲切，让关系变得有趣

---

## 六、与业界标准的对比

| 维度 | Apple HIG | Material Design | **Companion CDS** |
|------|-----------|-----------------|-------------------|
| 覆盖范围 | iOS/macOS 全平台 | Android/Web 全平台 | Companion 全栈 |
| 设计系统 | SF Symbols + HIG | Material Design 3 | CDS Design System |
| 组件规范 | UIKit/SwiftUI | Material Components | React + SVG + Lottie |
| 动画规范 | Core Animation | Motion Design | Lottie + CSS Animation |
| AI 规范 | 无 | 无 | **完整 AI 人格/记忆/知识体系** |
| 角色系统 | 无 | 无 | **完整 Avatar Engine** |
| Agent 规范 | 无 | 无 | **TRAE/Cursor/Claude 规则** |

---

## 七、版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-06-28 | 首次发布，完整规范体系 |

---

## 八、贡献指南

1. 修改 CDS 文件前，请先在 Issues 中讨论
2. 保持文件命名规范（数字前缀 + PascalCase）
3. 每个文件保持独立可读
4. 代码示例必须使用 TypeScript
5. 所有图表使用 Mermaid 语法
6. 中文编写，技术术语保留英文

---

> **Companion Design & Development Specification** — 让每一段关系都被温柔记住。
