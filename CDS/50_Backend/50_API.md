# 50 — API 设计规范 (API Design Specification)

> **Companion（伴伴）API 设计规范**
> 版本：v1.0 | 日期：2026-06-28 | 状态：正式发布

---

## 一、概述

### 1.1 当前阶段（V1.0）

当前 Companion 采用**纯前端架构**，所有数据存储在浏览器的 `localStorage` 中，通过 `StorageService` 进行同步读写。**没有后端 API，没有网络请求，没有服务器通信。**

```mermaid
graph LR
    subgraph "当前架构 V1.0"
        UI[React UI] --> Store[Zustand Store]
        Store --> SS[StorageService]
        SS --> LS[localStorage]
    end
    
    style LS fill:#FEF0EB,stroke:#E8734A,color:#333
```

当前 `StorageService` 提供的接口：

| 方法 | 功能 | 存储键 |
|------|------|--------|
| `getRelatives()` | 获取所有亲友 | `companion_app_relatives` |
| `saveRelatives()` | 保存亲友列表 | `companion_app_relatives` |
| `addRelative()` | 添加单个亲友 | `companion_app_relatives` |
| `updateRelative()` | 更新单个亲友 | `companion_app_relatives` |
| `deleteRelative()` | 删除单个亲友 | `companion_app_relatives` |
| `getReminders()` | 获取所有提醒 | `companion_app_reminders` |
| `saveReminders()` | 保存提醒列表 | `companion_app_reminders` |
| `getChatMessages()` | 获取聊天记录 | `companion_app_chat_{id}` |
| `saveChatMessages()` | 保存聊天记录 | `companion_app_chat_{id}` |

### 1.2 V2.0 规划

V2.0 阶段将引入后端服务，采用 **RESTful API** 设计。API 将服务于以下场景：

| 场景 | 说明 |
|------|------|
| 用户账号 | 注册、登录、找回密码 |
| 数据云同步 | 亲友数据、聊天记录、提醒同步到云端 |
| AI 增强 | 蒸馏分身的 LLM 增强（可选在线） |
| 头像分享 | Q版形象的社区分享 |
| 统计分析 | 匿名化的使用统计（用户可选） |

> **核心原则：** 即使引入后端 API，所有功能仍必须支持离线使用。API 是增强，不是依赖。

---

## 二、API 设计原则

### 2.1 RESTful 风格

所有 API 遵循 RESTful 设计规范：

| 原则 | 说明 | 示例 |
|------|------|------|
| 资源导向 | URL 表示资源 | `/api/v1/relatives` |
| HTTP 动词语义化 | GET/POST/PUT/DELETE | `GET /relatives` = 查询 |
| 无状态 | 每次请求独立 | 使用 JWT Token |
| 统一格式 | 一致的请求/响应结构 | `{ code, message, data, timestamp }` |

### 2.2 版本化

API 通过 URL 路径进行版本管理：

```
/api/v1/relatives
/api/v1/reminders
/api/v2/relatives   ← 未来大版本升级
```

版本规则：
- **主版本号**（v1, v2）：不兼容的重大变更
- **小版本号**（v1.1, v1.2）：向后兼容的功能新增
- 旧版本至少维护 **12 个月**
- 废弃版本通过 `Sunset` 响应头通知

### 2.3 HTTPS 强制

所有 API 必须通过 HTTPS 访问：

```
✅ https://api.companion.app/v1/relatives
❌ http://api.companion.app/v1/relatives
```

### 2.4 域名规划

| 环境 | 域名 | 说明 |
|------|------|------|
| 开发 | `dev-api.companion.app` | 开发环境 |
| 测试 | `staging-api.companion.app` | 测试环境 |
| 生产 | `api.companion.app` | 生产环境 |

---

## 三、统一响应格式

### 3.1 标准响应结构

所有 API 返回统一的 JSON 格式：

```typescript
interface ApiResponse<T = unknown> {
  code: number;        // 业务状态码
  message: string;     // 人类可读的提示信息
  data: T;             // 响应数据（可为 null）
  timestamp: number;   // 服务器时间戳（毫秒）
}
```

### 3.2 成功响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "rel_20260628_001",
    "name": "妈妈",
    "relation": "mother",
    "birthday": "1970-05-12",
    "avatar": {
      "gender": 0,
      "faceShape": 2,
      "hairstyle": 3,
      "eyeStyle": 1,
      "mouthStyle": 2,
      "clothing": 5,
      "accessory": 0,
      "skinColor": "#FFD5B8",
      "hairColor": "#3D2B1F",
      "clothingColor": "#D44A4A"
    },
    "createdAt": "2026-06-28T10:00:00.000Z",
    "updatedAt": "2026-06-28T10:00:00.000Z"
  },
  "timestamp": 1751155200000
}
```

### 3.3 列表响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [...],
    "total": 25,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  },
  "timestamp": 1751155200000
}
```

### 3.4 错误响应示例

```json
{
  "code": 40001,
  "message": "姓名不能为空",
  "data": null,
  "timestamp": 1751155200000
}
```

### 3.5 空数据响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 20,
    "hasMore": false
  },
  "timestamp": 1751155200000
}
```

---

## 四、认证方案

### 4.1 JWT Token 机制

采用 JWT (JSON Web Token) 进行身份认证：

```mermaid
sequenceDiagram
    participant C as 客户端
    participant S as 服务器
    
    C->>S: POST /auth/login (email, password)
    S-->>C: { accessToken, refreshToken, expiresIn }
    
    loop 每次请求
        C->>S: GET /api/v1/relatives
        Note right of C: Header: Authorization: Bearer <accessToken>
        S-->>C: 200 OK
    end
    
    Note over C: accessToken 过期
    C->>S: POST /auth/refresh (refreshToken)
    S-->>C: { accessToken, refreshToken, expiresIn }
```

### 4.2 Token 规格

| 属性 | 值 | 说明 |
|------|-----|------|
| 签名算法 | RS256 | RSA + SHA-256 |
| accessToken 有效期 | 15 分钟 | 短期令牌 |
| refreshToken 有效期 | 30 天 | 长期令牌 |
| Token 存储 | 内存 + 安全Cookie | 防 XSS |
| 刷新策略 | 过期前 5 分钟自动刷新 | 无感知续期 |

### 4.3 Token 请求头格式

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### 4.4 认证错误码

| 场景 | HTTP 状态码 | 业务码 | 说明 |
|------|------------|--------|------|
| 未携带 Token | 401 | 10001 | 请先登录 |
| Token 已过期 | 401 | 10002 | Token 已过期，请重新登录 |
| Token 无效 | 401 | 10003 | Token 无效 |
| 权限不足 | 403 | 10004 | 无权访问该资源 |

---

## 五、错误码规范

### 5.1 错误码结构

错误码为 **5 位数字**，按模块分段：

```
  1  0  0  0  1
  │  └──┬──┘  └── 具体错误序号
  │     └────── 模块编号
  └──────────── 全局错误前缀（1=认证, 4=客户端, 5=服务器）
```

### 5.2 全局错误码

| 代码范围 | HTTP 状态码 | 模块 | 说明 |
|----------|------------|------|------|
| 10001-10099 | 401 | 认证模块 | 登录、Token 相关 |
| 40001-40099 | 400 | 请求错误 | 参数校验、格式错误 |
| 40101-40199 | 401 | 未授权 | 未登录、无权限 |
| 40301-40399 | 403 | 禁止访问 | 权限不足 |
| 40401-40499 | 404 | 资源不存在 | 数据未找到 |
| 40901-40999 | 409 | 冲突 | 数据冲突、重复 |
| 50001-50099 | 500 | 服务器错误 | 内部错误 |

### 5.3 业务错误码

| 代码 | HTTP | 说明 | 建议处理 |
|------|------|------|----------|
| **10001** | 401 | 未携带认证令牌 | 跳转登录页 |
| **10002** | 401 | Token 已过期 | 自动刷新 Token |
| **10003** | 401 | Token 无效 | 重新登录 |
| **40001** | 400 | 姓名不能为空 | 提示用户填写 |
| **40002** | 400 | 姓名长度超出限制 | 提示用户缩短 |
| **40003** | 400 | 生日格式无效 | 提示正确格式 |
| **40004** | 400 | 关系类型无效 | 提示选择关系 |
| **40005** | 400 | 提前提醒天数无效 | 提示有效范围 |
| **40006** | 400 | 聊天记录格式不支持 | 提示支持格式 |
| **40007** | 400 | 聊天记录文件过大 | 提示文件大小限制 |
| **40401** | 404 | 亲友不存在 | 提示数据不存在 |
| **40402** | 404 | 提醒不存在 | 提示数据不存在 |
| **40901** | 409 | 该亲友已有同类型提醒 | 提示编辑已有提醒 |
| **50001** | 500 | 服务器内部错误 | 联系技术支持 |
| **50002** | 500 | AI 分析服务暂时不可用 | 稍后重试 |

### 5.4 错误响应模板

```typescript
interface ApiError {
  code: number;
  message: string;
  data: null;
  timestamp: number;
  details?: {
    field?: string;       // 出错字段
    reason?: string;      // 具体原因
    suggestion?: string;  // 修复建议
  };
}
```

---

## 六、API 端点规划

### 6.1 端点总览

```mermaid
graph TB
    subgraph "API 端点结构"
        Base["/api/v1/"]
        
        Auth["/auth"]
        Rel["/relatives"]
        Avt["/avatars"]
        Rmd["/reminders"]
        Chat["/chat"]
        Usr["/users"]
        
        Base --> Auth
        Base --> Rel
        Base --> Avt
        Base --> Rmd
        Base --> Chat
        Base --> Usr
    end
```

### 6.2 认证模块 (`/api/v1/auth`)

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| `POST` | `/auth/register` | 用户注册 | ❌ |
| `POST` | `/auth/login` | 用户登录 | ❌ |
| `POST` | `/auth/logout` | 用户登出 | ✅ |
| `POST` | `/auth/refresh` | 刷新 Token | ✅ |
| `POST` | `/auth/forgot-password` | 找回密码 | ❌ |
| `POST` | `/auth/reset-password` | 重置密码 | ❌ |

**注册请求示例：**

```json
// POST /api/v1/auth/register
// Request Body:
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "nickname": "小雨"
}

// Response 200:
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "usr_20260628_001",
    "email": "user@example.com",
    "nickname": "小雨",
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900
  },
  "timestamp": 1751155200000
}
```

**登录请求示例：**

```json
// POST /api/v1/auth/login
// Request Body:
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}

// Response 200:
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": "usr_20260628_001",
    "email": "user@example.com",
    "nickname": "小雨",
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900
  },
  "timestamp": 1751155200000
}
```

### 6.3 亲友模块 (`/api/v1/relatives`)

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| `GET` | `/relatives` | 获取亲友列表 | ✅ |
| `GET` | `/relatives/:id` | 获取亲友详情 | ✅ |
| `POST` | `/relatives` | 创建亲友 | ✅ |
| `PUT` | `/relatives/:id` | 更新亲友信息 | ✅ |
| `DELETE` | `/relatives/:id` | 删除亲友 | ✅ |
| `GET` | `/relatives/:id/chat-style` | 获取聊天风格 | ✅ |
| `PUT` | `/relatives/:id/chat-style` | 更新聊天风格 | ✅ |

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码 |
| `pageSize` | number | 20 | 每页数量（最大100） |
| `relation` | string | — | 按关系筛选 |
| `search` | string | — | 按姓名搜索 |
| `sort` | string | `createdAt` | 排序字段 |
| `order` | string | `desc` | 排序方向（asc/desc） |

**创建亲友请求示例：**

```json
// POST /api/v1/relatives
// Headers: Authorization: Bearer <token>
// Request Body:
{
  "name": "妈妈",
  "birthday": "1970-05-12",
  "isLunar": false,
  "relation": "mother",
  "phone": "13800138000",
  "hobbies": "做饭、种花",
  "notes": "最喜欢吃红烧排骨",
  "avatar": {
    "gender": 0,
    "faceShape": 2,
    "hairstyle": 3,
    "eyeStyle": 1,
    "mouthStyle": 2,
    "clothing": 5,
    "accessory": 0,
    "skinColor": "#FFD5B8",
    "hairColor": "#3D2B1F",
    "clothingColor": "#D44A4A"
  },
  "mbti": "ISFJ",
  "address": "北京市朝阳区"
}

// Response 201:
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "rel_20260628_001",
    "name": "妈妈",
    "birthday": "1970-05-12",
    "isLunar": false,
    "relation": "mother",
    "phone": "13800138000",
    "hobbies": "做饭、种花",
    "notes": "最喜欢吃红烧排骨",
    "avatar": { ... },
    "mbti": "ISFJ",
    "address": "北京市朝阳区",
    "createdAt": "2026-06-28T10:00:00.000Z",
    "updatedAt": "2026-06-28T10:00:00.000Z"
  },
  "timestamp": 1751155200000
}
```

**查询亲友列表示例：**

```json
// GET /api/v1/relatives?page=1&pageSize=10&relation=family
// Headers: Authorization: Bearer <token>

// Response 200:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [
      {
        "id": "rel_20260628_001",
        "name": "妈妈",
        "relation": "mother",
        "birthday": "1970-05-12",
        "avatar": { ... },
        "createdAt": "2026-06-28T10:00:00.000Z"
      },
      {
        "id": "rel_20260628_002",
        "name": "爸爸",
        "relation": "father",
        "birthday": "1968-08-15",
        "avatar": { ... },
        "createdAt": "2026-06-28T11:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10,
    "hasMore": true
  },
  "timestamp": 1751155200000
}
```

### 6.4 头像模块 (`/api/v1/avatars`)

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| `POST` | `/avatars/:relativeId/upload` | 上传头像图片 | ✅ |
| `DELETE` | `/avatars/:relativeId` | 删除头像图片 | ✅ |

**上传头像请求示例：**

```
POST /api/v1/avatars/rel_20260628_001/upload
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data

Body:
  file: <二进制图片数据>
  cropMode: "circle" | "avatar"
```

**响应：**

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.companion.app/avatars/usr_001/rel_001.jpg",
    "thumbnailUrl": "https://cdn.companion.app/avatars/usr_001/rel_001_thumb.jpg",
    "size": 245760,
    "mimeType": "image/jpeg"
  },
  "timestamp": 1751155200000
}
```

### 6.5 提醒模块 (`/api/v1/reminders`)

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| `GET` | `/reminders` | 获取提醒列表 | ✅ |
| `GET` | `/reminders/:id` | 获取提醒详情 | ✅ |
| `POST` | `/reminders` | 创建提醒 | ✅ |
| `PUT` | `/reminders/:id` | 更新提醒 | ✅ |
| `DELETE` | `/reminders/:id` | 删除提醒 | ✅ |
| `GET` | `/reminders/upcoming` | 获取即将到期的提醒 | ✅ |

**创建提醒请求示例：**

```json
// POST /api/v1/reminders
// Request Body:
{
  "relativeId": "rel_20260628_001",
  "type": "birthday",
  "date": "1970-05-12",
  "advanceDays": [7, 3, 1],
  "isEnabled": true
}

// Response 201:
{
  "code": 200,
  "message": "提醒创建成功",
  "data": {
    "id": "rmd_20260628_001",
    "relativeId": "rel_20260628_001",
    "type": "birthday",
    "date": "1970-05-12",
    "advanceDays": [7, 3, 1],
    "isEnabled": true,
    "createdAt": "2026-06-28T10:00:00.000Z"
  },
  "timestamp": 1751155200000
}
```

**获取即将到期提醒示例：**

```json
// GET /api/v1/reminders/upcoming?days=7
// Headers: Authorization: Bearer <token>

// Response 200:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [
      {
        "id": "rmd_20260628_001",
        "relativeId": "rel_20260628_001",
        "relativeName": "妈妈",
        "relativeAvatar": { ... },
        "type": "birthday",
        "date": "2026-07-02",
        "daysUntil": 4,
        "message": "还有4天就是妈妈的生日了，要不要准备个小惊喜呢？"
      }
    ]
  },
  "timestamp": 1751155200000
}
```

### 6.6 聊天模块 (`/api/v1/chat`)

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| `POST` | `/chat/:relativeId/import` | 导入聊天记录 | ✅ |
| `GET` | `/chat/:relativeId/messages` | 获取聊天记录 | ✅ |
| `POST` | `/chat/:relativeId/messages` | 发送消息（获取AI回复） | ✅ |
| `DELETE` | `/chat/:relativeId/messages` | 清空聊天记录 | ✅ |
| `GET` | `/chat/:relativeId/analysis` | 获取聊天分析结果 | ✅ |

**导入聊天记录示例：**

```
POST /api/v1/chat/rel_20260628_001/import
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data

Body:
  file: <微信聊天记录文件>
  platform: "wechat" | "qq"
```

**AI 回复请求示例：**

```json
// POST /api/v1/chat/rel_20260628_001/messages
// Request Body:
{
  "content": "妈妈，我今天加班，不回来吃饭了",
  "context": [
    { "role": "user", "content": "妈妈，我今天加班" },
    { "role": "avatar", "content": "好的，注意身体，别太累了" }
  ]
}

// Response 200:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "msg_20260628_001",
    "content": "好的，加班别太晚，回来给你热饭",
    "sender": "avatar",
    "timestamp": "2026-06-28T12:30:00.000Z",
    "styleMatch": {
      "confidence": 0.92,
      "patterns": ["口语化", "关心型", "短句"]
    }
  },
  "timestamp": 1751155200000
}
```

### 6.7 用户模块 (`/api/v1/users`)

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| `GET` | `/users/me` | 获取当前用户信息 | ✅ |
| `PUT` | `/users/me` | 更新用户信息 | ✅ |
| `PUT` | `/users/me/password` | 修改密码 | ✅ |
| `POST` | `/users/me/avatar` | 更新用户头像 | ✅ |
| `DELETE` | `/users/me` | 注销账号 | ✅ |
| `GET` | `/users/me/export` | 导出全部数据 | ✅ |

**获取用户信息示例：**

```json
// GET /api/v1/users/me

// Response 200:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "userId": "usr_20260628_001",
    "email": "user@example.com",
    "nickname": "小雨",
    "avatarUrl": null,
    "createdAt": "2026-06-28T10:00:00.000Z",
    "relativeCount": 12,
    "storageUsed": 1048576,
    "storageLimit": 104857600,
    "settings": {
      "theme": "light",
      "language": "zh-CN",
      "syncEnabled": true,
      "syncFrequency": "realtime"
    }
  },
  "timestamp": 1751155200000
}
```

---

## 七、请求规范

### 7.1 请求头

| 头部 | 必填 | 说明 |
|------|------|------|
| `Content-Type` | ✅ | `application/json` 或 `multipart/form-data` |
| `Authorization` | ✅（认证接口） | `Bearer <accessToken>` |
| `X-Request-Id` | 可选 | 请求追踪ID，客户端生成 UUID |
| `Accept-Language` | 可选 | 语言偏好，默认 `zh-CN` |
| `X-Device-Id` | 可选 | 设备标识，用于多设备管理 |

### 7.2 请求参数规范

| 类型 | 说明 | 示例 |
|------|------|------|
| 路径参数 | 资源标识 | `/relatives/:id` |
| 查询参数 | 筛选/分页 | `?page=1&pageSize=20` |
| 请求体 | 创建/更新数据 | JSON Body |

### 7.3 日期时间格式

所有时间统一使用 **ISO 8601** 格式：

```
2026-06-28T10:00:00.000Z     (UTC 时间)
2026-06-28T18:00:00.000+08:00 (带时区)
```

时间戳统一使用**毫秒级 Unix 时间戳**。

### 7.4 分页规范

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码，从1开始 |
| `pageSize` | number | 20 | 每页数量，范围 1-100 |

分页响应包含：

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

### 7.5 过滤与搜索

支持以下过滤方式：

| 方式 | 参数 | 示例 | 说明 |
|------|------|------|------|
| 精确匹配 | `relation=father` | 关系类型 | 单值筛选 |
| 范围筛选 | `birthday_from=2026-01-01` | 生日范围 | `_from` / `_to` 后缀 |
| 模糊搜索 | `search=妈妈` | 姓名搜索 | 部分匹配 |
| 排序 | `sort=createdAt&order=desc` | 排序字段 | 支持 asc/desc |

---

## 八、安全规范

### 8.1 速率限制

| 限制类型 | 限制值 | 说明 |
|----------|--------|------|
| 全局请求 | 100 次/分钟 | 每个用户 |
| 认证请求 | 10 次/分钟 | 登录/注册 |
| 文件上传 | 5 次/分钟 | 头像/聊天记录 |
| AI 请求 | 30 次/分钟 | 聊天模拟 |

速率限制响应：

```json
{
  "code": 42901,
  "message": "请求过于频繁，请稍后再试",
  "data": null,
  "timestamp": 1751155200000
}
```

响应头包含：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1751155800
```

### 8.2 输入验证

- 所有用户输入必须在服务端进行校验
- 姓名最大长度：50 字符
- 备注最大长度：500 字符
- 聊天记录最大文件大小：10MB
- 头像图片最大文件大小：5MB
- 支持的图片格式：jpg, png, webp

### 8.3 CORS 策略

```
Access-Control-Allow-Origin: https://companion.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-Id
Access-Control-Max-Age: 86400
```

### 8.4 数据脱敏

| 数据 | 脱敏规则 | 示例 |
|------|----------|------|
| 手机号 | 中间4位替换 | 138****8000 |
| 邮箱 | 用户名部分替换 | u***@example.com |
| 地址 | 详细地址替换 | 北京市朝阳区*** |

---

## 九、离线优先策略

### 9.1 设计原则

Companion 坚持**离线优先**（Offline-First）策略：

```
用户操作 → 本地立即响应 → 后台同步到服务器 → 成功则确认 / 失败则重试
```

### 9.2 离线处理流程

```mermaid
graph TB
    A[用户操作] --> B{网络状态}
    B -->|在线| C[发送API请求]
    B -->|离线| D[写入本地队列]
    
    C -->|成功| E[更新本地数据]
    C -->|失败| D
    
    D --> F[后台同步队列]
    F --> G{网络恢复}
    G -->|是| C
    G -->|否| H[等待]
    
    E --> I[UI更新]
    
    style D fill:#FFF3E0,stroke:#FF9800,color:#333
    style I fill:#E8F5E9,stroke:#4CAF50,color:#333
```

### 9.3 同步队列

离线时产生的变更存储在本地同步队列中：

```typescript
interface SyncQueueItem {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: unknown;
  createdAt: string;
  retryCount: number;
  maxRetries: number;
}
```

### 9.4 冲突处理

采用 **Last Write Wins (LWW)** 策略：
- 每条数据包含 `updatedAt` 时间戳
- 同步时比较时间戳，最新的覆盖旧的
- 冲突数据保留备份，用户可手动合并

---

## 十、API 监控与日志

### 10.1 请求追踪

每个请求附带 `X-Request-Id`，用于链路追踪：

```
X-Request-Id: req_a1b2c3d4e5f6
```

### 10.2 日志记录

| 日志类型 | 内容 | 保留时间 |
|----------|------|----------|
| 访问日志 | 请求方法、路径、状态码、耗时 | 30 天 |
| 错误日志 | 错误码、堆栈、请求上下文 | 90 天 |
| 安全日志 | 登录、注册、敏感操作 | 180 天 |

### 10.3 健康检查

```
GET /api/v1/health

// Response:
{
  "code": 200,
  "message": "healthy",
  "data": {
    "status": "healthy",
    "version": "2.0.0",
    "uptime": 86400,
    "database": "connected",
    "cache": "connected"
  },
  "timestamp": 1751155200000
}
```

---

## 十一、API 版本演进策略

### 11.1 版本生命周期

```mermaid
graph LR
    A[新版本发布] --> B[共存期 6个月]
    B --> C[废弃通知 3个月]
    C --> D[停止服务]
    
    style A fill:#E8734A,color:#fff
    style D fill:#EF5350,color:#fff
```

### 11.2 版本升级路径

| 当前版本 | 目标版本 | 变更类型 | 升级方式 |
|----------|----------|----------|----------|
| V1.0 → V1.1 | 功能新增 | 向后兼容 | 无需修改 |
| V1.x → V2.0 | 重大变更 | 不兼容 | 客户端同步更新 |

### 11.3 废弃策略

废弃接口通过以下方式通知：

```
HTTP Headers:
  Sunset: Sat, 01 Jan 2028 00:00:00 GMT
  Deprecation: true
  Link: <https://api.companion.app/v2/docs>; rel="successor-version"
```

---

## 十二、技术实现

### 12.1 推荐技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| Web 框架 | Node.js + Express/Fastify | 轻量高效 |
| 备选框架 | Go + Gin | 高性能场景 |
| ORM | Prisma / Drizzle | 类型安全 |
| 数据库 | PostgreSQL | 关系型数据 |
| 缓存 | Redis | Session、频率限制 |
| 文件存储 | S3 兼容存储 | 头像、聊天文件 |
| 部署 | Docker + Kubernetes | 容器化部署 |

### 12.2 客户端封装

```typescript
// API 客户端封装示例
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-Id': crypto.randomUUID(),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return response.json();
  }

  // 亲友相关方法
  async getRelatives(params?: RelativeQueryParams) {
    const query = new URLSearchParams(params as Record<string, string>);
    return this.request<RelativeListResponse>('GET', `/relatives?${query}`);
  }

  async createRelative(data: CreateRelativeDTO) {
    return this.request<Relative>('POST', '/relatives', data);
  }

  async updateRelative(id: string, data: UpdateRelativeDTO) {
    return this.request<Relative>('PUT', `/relatives/${id}`, data);
  }

  async deleteRelative(id: string) {
    return this.request<null>('DELETE', `/relatives/${id}`);
  }
}
```

---

## 十三、完整 API 端点清单

| 模块 | 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|------|
| 认证 | `POST` | `/auth/register` | 注册 | ❌ |
| 认证 | `POST` | `/auth/login` | 登录 | ❌ |
| 认证 | `POST` | `/auth/logout` | 登出 | ✅ |
| 认证 | `POST` | `/auth/refresh` | 刷新Token | ✅ |
| 认证 | `POST` | `/auth/forgot-password` | 找回密码 | ❌ |
| 认证 | `POST` | `/auth/reset-password` | 重置密码 | ❌ |
| 亲友 | `GET` | `/relatives` | 查询列表 | ✅ |
| 亲友 | `GET` | `/relatives/:id` | 查询详情 | ✅ |
| 亲友 | `POST` | `/relatives` | 创建 | ✅ |
| 亲友 | `PUT` | `/relatives/:id` | 更新 | ✅ |
| 亲友 | `DELETE` | `/relatives/:id` | 删除 | ✅ |
| 亲友 | `GET` | `/relatives/:id/chat-style` | 获取聊天风格 | ✅ |
| 亲友 | `PUT` | `/relatives/:id/chat-style` | 更新聊天风格 | ✅ |
| 头像 | `POST` | `/avatars/:relativeId/upload` | 上传头像 | ✅ |
| 头像 | `DELETE` | `/avatars/:relativeId` | 删除头像 | ✅ |
| 提醒 | `GET` | `/reminders` | 查询列表 | ✅ |
| 提醒 | `GET` | `/reminders/:id` | 查询详情 | ✅ |
| 提醒 | `POST` | `/reminders` | 创建 | ✅ |
| 提醒 | `PUT` | `/reminders/:id` | 更新 | ✅ |
| 提醒 | `DELETE` | `/reminders/:id` | 删除 | ✅ |
| 提醒 | `GET` | `/reminders/upcoming` | 即将到期 | ✅ |
| 聊天 | `POST` | `/chat/:relativeId/import` | 导入记录 | ✅ |
| 聊天 | `GET` | `/chat/:relativeId/messages` | 获取消息 | ✅ |
| 聊天 | `POST` | `/chat/:relativeId/messages` | 发送消息 | ✅ |
| 聊天 | `DELETE` | `/chat/:relativeId/messages` | 清空消息 | ✅ |
| 聊天 | `GET` | `/chat/:relativeId/analysis` | 分析结果 | ✅ |
| 用户 | `GET` | `/users/me` | 获取信息 | ✅ |
| 用户 | `PUT` | `/users/me` | 更新信息 | ✅ |
| 用户 | `PUT` | `/users/me/password` | 修改密码 | ✅ |
| 用户 | `POST` | `/users/me/avatar` | 更新头像 | ✅ |
| 用户 | `DELETE` | `/users/me` | 注销账号 | ✅ |
| 用户 | `GET` | `/users/me/export` | 导出数据 | ✅ |
| 系统 | `GET` | `/health` | 健康检查 | ❌ |
| 系统 | `GET` | `/version` | 版本信息 | ❌ |

---

> **Companion API 设计规范 — RESTful、版本化、安全可靠。**
