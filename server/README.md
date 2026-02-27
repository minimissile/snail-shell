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
- npm >= 9
- 数据库 (三选一):
  - Docker Desktop (本地开发)
  - 本地安装 PostgreSQL + Redis
  - 云数据库服务 (团队协作推荐)

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

macOS:

```bash
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis
createdb snailshell
```

Windows:

```powershell
# 安装 Chocolatey 包管理器 (以管理员身份运行 PowerShell)
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# 安装 PostgreSQL 和 Redis
choco install postgresql15 redis-64

# 启动服务 (服务会自动启动，或手动启动)
net start postgresql-x64-15
net start redis

# 创建数据库 (使用 psql)
psql -U postgres -c "CREATE DATABASE snailshell;"
psql -U postgres -c "CREATE USER snailshell WITH PASSWORD 'snailshell123';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE snailshell TO snailshell;"
```

或使用安装包：

- PostgreSQL: https://www.postgresql.org/download/windows/
- Redis: https://github.com/tporadowski/redis/releases

**方式三：云数据库 (推荐用于团队协作)**

使用云数据库服务，所有开发者共享同一数据源，无需本地安装。

#### 腾讯云

| 服务       | 产品                                                              | 配置建议         |
| ---------- | ----------------------------------------------------------------- | ---------------- |
| PostgreSQL | [云数据库 PostgreSQL](https://cloud.tencent.com/product/postgres) | 1核1G (开发环境) |
| Redis      | [云数据库 Redis](https://cloud.tencent.com/product/crs)           | 256MB (开发环境) |

#### 阿里云

| 服务       | 产品                                                                     | 配置建议         |
| ---------- | ------------------------------------------------------------------------ | ---------------- |
| PostgreSQL | [云数据库 RDS PostgreSQL](https://www.aliyun.com/product/rds/postgresql) | 1核1G (开发环境) |
| Redis      | [云数据库 Redis](https://www.aliyun.com/product/redis)                   | 256MB (开发环境) |

#### 配置步骤

1. 在云控制台创建 PostgreSQL 和 Redis 实例
2. 配置安全组/白名单，允许开发机器 IP 访问
3. 获取连接信息，修改 `.env` 文件：

```env
# PostgreSQL 云数据库
DATABASE_URL="postgresql://用户名:密码@云数据库地址:端口/数据库名?schema=public"

# Redis 云数据库
REDIS_HOST=云Redis地址
REDIS_PORT=6379
REDIS_PASSWORD=Redis密码
```

4. 初始化数据库表结构：

```bash
# 首次部署，同步 schema 到云数据库
npx prisma db push

# 或使用迁移 (生产环境推荐)
npx prisma migrate deploy
```

#### 云数据库注意事项

- **安全组配置**: 确保开发机器的公网 IP 已加入白名单
- **SSL 连接**: 生产环境建议开启 SSL，连接字符串添加 `?sslmode=require`
- **数据备份**: 开启自动备份，设置合理的备份保留策略
- **费用预估**: 开发环境最低配置约 50-100 元/月

### 3. 配置环境变量

macOS/Linux:

```bash
cp .env.example .env
```

Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

根据需要修改 `.env` 中的配置。

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

### 数据库方案选择

| 方案     | 适用场景 | 优点                   | 缺点                     |
| -------- | -------- | ---------------------- | ------------------------ |
| Docker   | 单人开发 | 环境隔离、一键启动     | 需安装 Docker            |
| 云数据库 | 团队协作 | 数据共享、无需本地安装 | 有费用、需网络           |
| 本地安装 | 离线开发 | 无依赖                 | 配置繁琐、版本可能不一致 |

**团队协作推荐使用云数据库**，所有成员连接同一数据源，数据实时同步。

### 新成员入门 (云数据库方案)

```bash
# 1. 克隆代码
git clone <repo-url>
cd snail-shell/server

# 2. 安装依赖
npm install

# 3. 获取 .env 配置文件
# 向团队成员获取 .env 文件 (包含云数据库连接信息)

# 4. 生成 Prisma 客户端
npx prisma generate

# 5. 启动服务
npm run start:dev
```

### 新成员入门 (Docker 方案)

```bash
# 1. 克隆代码
git clone <repo-url>
cd snail-shell/server

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env

# 4. 启动数据库
docker-compose up -d

# 5. 初始化数据库
npx prisma migrate dev
npx prisma db seed

# 6. 启动服务
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

macOS/Linux:

```bash
# 查看端口占用
lsof -i :3000
lsof -i :5432
lsof -i :6379

# 停止占用进程
kill -9 <PID>
```

Windows (PowerShell):

```powershell
# 查看端口占用
netstat -ano | findstr :3000
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# 停止占用进程 (PID 为上述命令最后一列数字)
taskkill /PID <PID> /F
```

### 数据库连接失败

1. 检查 Docker 容器是否运行: `docker ps`
2. 检查 `.env` 中的数据库连接字符串
3. 等待容器健康检查完成 (约 5 秒)

### Prisma 客户端未生成

```bash
npx prisma generate
```
