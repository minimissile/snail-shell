# 蜗壳 (Snail Shell) - 青旅预订平台

蜗壳是一个青年旅舍/短租预订平台，包含微信小程序前端、NestJS 后端服务和 React 管理后台三个子项目。

## 项目结构

```
snail-shell/
├── miniprogram/          # 微信小程序前端
├── server/               # NestJS 后端服务
├── admin/                # React 管理后台
├── package.json          # 小程序根依赖 (TDesign)
├── project.config.json   # 微信开发者工具项目配置
└── tsconfig.json         # 小程序 TypeScript 配置
```

## 技术栈

| 子项目 | 技术栈 |
| --- | --- |
| 小程序端 | 微信小程序 + TypeScript + Less + TDesign |
| 服务端 | NestJS 10 + Prisma + MySQL + Redis + JWT |
| 管理后台 | React 18 + Ant Design 5 + Vite + TypeScript |

## 环境要求

- Node.js >= 18
- MySQL >= 5.7
- Redis >= 6
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) (小程序端)

---

## 一、服务端 (server/)

后端 API 服务，为小程序和管理后台提供接口。

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制环境变量模板并填写实际值：

```bash
cp .env.example .env
```

需要配置的关键项：

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `DATABASE_URL` | MySQL 连接地址 | `mysql://user:pass@localhost:3306/snailshell` |
| `REDIS_HOST` | Redis 地址 | `localhost` |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `REDIS_PASSWORD` | Redis 密码（可选） | |
| `JWT_SECRET` | JWT 签名密钥 | 自定义强密码字符串 |
| `WECHAT_APPID` | 微信小程序 AppID | 微信后台获取 |
| `WECHAT_SECRET` | 微信小程序 AppSecret | 微信后台获取 |

### 3. 初始化数据库

```bash
# 同步 Prisma Schema 到数据库（创建/更新表结构）
npx prisma db push

# 生成 Prisma Client
npx prisma generate

# 播种管理后台初始数据（管理员账号、角色、权限）
npx ts-node prisma/seed-admin.ts
```

### 4. 启动服务

```bash
# 开发模式（热重载）
npm run start:dev

# 生产构建
npm run build
npm run start:prod
```

启动后：
- API 服务: `http://localhost:3000`
- Swagger 文档: `http://localhost:3000/api-docs`

### 5. 常用命令

```bash
npm run lint              # ESLint 检查
npm run prisma:studio     # 打开 Prisma Studio 数据库管理界面
npm run test              # 运行测试
```

---

## 二、小程序端 (miniprogram/)

微信小程序前端，需要使用微信开发者工具运行。

### 1. 安装依赖

在项目根目录安装小程序依赖：

```bash
# 在项目根目录执行
npm install
```

### 2. 构建 npm

打开**微信开发者工具**，执行以下操作：

1. 导入项目：选择 `snail-shell/` 根目录，AppID 使用 `project.config.json` 中的配置
2. 构建 npm：菜单栏 → 工具 → 构建 npm
3. 等待构建完成后即可预览

### 3. 配置服务端地址

编辑 `miniprogram/config/index.ts`：

```typescript
const config = {
  dev: {
    baseUrl: 'http://localhost:3000/v1',  // 本地开发
  },
  prod: {
    baseUrl: 'https://your-domain.com/v1', // 线上环境
  },
}
```

开发时切换环境：修改文件顶部的 `ENV` 变量：

```typescript
const ENV = 'dev' as 'dev' | 'prod'
```

### 4. 开发调试

- 确保服务端已启动（`http://localhost:3000`）
- 在微信开发者工具中，勾选「详情 → 本地设置 → 不校验合法域名」以支持本地开发
- 编译后即可在模拟器中预览

### 5. 项目页面

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `pages/index` | 门店列表、搜索、Banner |
| 收藏 | `pages/favorites` | 收藏的门店 |
| 订单 | `pages/orders` | 订单列表 |
| 消息 | `pages/messages` | 系统消息 |
| 我的 | `pages/mine` | 个人中心 |

---

## 三、管理后台 (admin/)

基于 React + Ant Design 的后台管理系统。

### 1. 安装依赖

```bash
cd admin
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

启动后访问: `http://localhost:8000`

开发服务器已配置代理，`/v1/admin` 的请求会自动转发到 `http://localhost:3000`（需要先启动服务端）。

### 3. 登录账号

首次使用需要先执行服务端的种子脚本（见服务端第 3 步），默认管理员账号：

| 字段 | 值 |
| --- | --- |
| 用户名 | `admin` |
| 密码 | `admin123` |

### 4. 生产构建

```bash
npm run build
```

构建产物在 `admin/dist/` 目录，可部署到 Nginx 等静态服务器。

Nginx 参考配置：

```nginx
server {
    listen 80;
    server_name admin.your-domain.com;

    root /path/to/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /v1/admin {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. 功能模块

| 模块 | 说明 |
| --- | --- |
| 数据看板 | 营收、订单、用户统计图表 |
| 门店管理 | 门店 CRUD、房型/床位管理 |
| 订单管理 | 订单查询、退款处理、Excel 导出 |
| 用户管理 | 用户查询、会员等级、积分/余额调整 |
| 优惠券管理 | 优惠券模板 CRUD、批量发放 |
| 系统配置 | 首页 Banner/标签、城市管理、协议管理 |
| 权限管理 | 管理员 CRUD、角色管理、权限分配 |

---

## 快速启动（完整流程）

```bash
# 1. 启动服务端
cd server
npm install
cp .env.example .env          # 编辑 .env 填写数据库等配置
npx prisma db push
npx prisma generate
npx ts-node prisma/seed-admin.ts
npm run start:dev

# 2. 启动管理后台（新终端）
cd admin
npm install
npm run dev                   # http://localhost:8000

# 3. 小程序端
# 根目录执行 npm install
# 用微信开发者工具打开项目根目录
# 工具 → 构建 npm → 编译预览
```
