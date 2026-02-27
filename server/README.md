# 蜗壳青旅 - 后端服务

基于 NestJS + Prisma + PostgreSQL + Redis 的青旅预约平台后端 API 服务。

## 技术栈

- **框架**: NestJS v10
- **ORM**: Prisma v5
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI

## 环境要求

- Node.js >= 18
- Docker Desktop (推荐) 或本地安装 PostgreSQL + Redis
- npm >= 9

## 快速开始

### 1. 克隆项目并安装依赖

```bash
cd server
npm install
```

### 2. 启动数据库服务

**方式一：Docker (推荐)**

```bash
docker-compose up -d
```

**方式二：本地安装**

```bash
# macOS
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis

# 创建数据库
createdb snailshell
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 根据需要修改 .env 中的配置
```

### 4. 初始化数据库

```bash
# 创建数据库表
npx prisma migrate dev

# 填充测试数据
npx prisma db seed
```

### 5. 启动开发服务器

```bash
npm run start:dev
```

服务将运行在 http://localhost:3000

## 常用命令

```bash
# 开发模式
npm run start:dev

# 生产构建
npm run build

# 生产运行
npm run start:prod

# 类型检查
npm run typecheck

# 代码格式化
npm run format

# 数据库迁移
npx prisma migrate dev --name <migration_name>

# 重置数据库
npx prisma migrate reset

# 查看数据库
npx prisma studio
```

## API 文档

启动服务后访问 Swagger 文档：http://localhost:3000/api-docs

## 项目结构

```
server/
├── prisma/
│   ├── schema.prisma      # 数据库模型定义
│   ├── seed.ts            # 测试数据
│   └── migrations/        # 数据库迁移记录
├── src/
│   ├── main.ts            # 应用入口
│   ├── app.module.ts      # 根模块
│   ├── modules/
│   │   ├── auth/          # 认证模块 (微信登录)
│   │   ├── user/          # 用户模块 (会员体系)
│   │   ├── store/         # 门店模块 (搜索/详情)
│   │   ├── order/         # 订单模块 (预约/支付)
│   │   ├── coupon/        # 优惠券模块
│   │   ├── favorite/      # 收藏/足迹模块
│   │   ├── smart-lock/    # 智能门锁模块
│   │   ├── balance/       # 余额模块
│   │   ├── message/       # 消息模块
│   │   └── common/        # 通用模块
│   ├── prisma/            # Prisma 服务
│   ├── redis/             # Redis 服务
│   └── common/            # 公共模块
│       ├── filters/       # 异常过滤器
│       ├── interceptors/  # 响应拦截器
│       ├── decorators/    # 自定义装饰器
│       └── dto/           # 公共 DTO
├── docker-compose.yml     # Docker 容器配置
├── .env                   # 环境变量
└── .env.example           # 环境变量模板
```

## 协同开发

### 环境一致性

项目使用 Docker 确保所有开发者的环境完全一致：

- PostgreSQL 15-alpine
- Redis 7-alpine

每位开发者在本地运行独立的 Docker 容器，数据互不干扰。

### 新成员入门

```bash
# 1. 克隆代码
git clone <repo-url>
cd snail-shell/server

# 2. 安装依赖
npm install

# 3. 启动数据库
docker-compose up -d

# 4. 初始化数据库
npx prisma migrate dev
npx prisma db seed

# 5. 启动服务
npm run start:dev
```

### 数据库变更流程

1. 修改 `prisma/schema.prisma`
2. 生成迁移: `npx prisma migrate dev --name <描述>`
3. 提交迁移文件到 Git
4. 其他开发者拉取后执行: `npx prisma migrate dev`

### 测试数据

测试账号信息 (seed 数据):

| 字段     | 值               |
| -------- | ---------------- |
| 用户 ID  | 由 seed 自动生成 |
| 手机号   | 138\*\*\*\*8888  |
| 会员等级 | 钻石会员         |
| 积分     | 2888             |

## 端口说明

| 服务       | 端口 |
| ---------- | ---- |
| NestJS API | 3000 |
| PostgreSQL | 5432 |
| Redis      | 6379 |

## 常见问题

### Docker 启动失败

确保 Docker Desktop 已启动运行。

### 端口被占用

```bash
# 查看端口占用
lsof -i :3000
lsof -i :5432
lsof -i :6379

# 停止占用进程
kill -9 <PID>
```

### 数据库连接失败

1. 检查 Docker 容器是否运行: `docker ps`
2. 检查 `.env` 中的数据库连接字符串
3. 等待容器健康检查完成 (约 5 秒)

### Prisma 客户端未生成

```bash
npx prisma generate
```
