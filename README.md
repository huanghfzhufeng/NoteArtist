# 🎨 NoteArtist - AI 内容创作工作室

> 将干货内容一键转换为小红书风格的手绘笔记图片 + 爆款文案

![Neo-Brutalism](https://img.shields.io/badge/UI-Neo--Brutalism-FFD93D?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?style=flat-square&logo=docker)

## ✨ 功能特性

- 🖼️ **AI 图像生成** - 基于 Google Imagen 生成手绘风格笔记图片
- ✍️ **智能文案** - 基于 Google Gemini 生成吸引眼球的标题和文案
- 🎭 **多人设管理** - 创建不同账号人设，生成风格各异的内容
- 🎨 **提示词模板** - 预设多种视觉风格，支持自定义提示词
- 📱 **实时预览** - 手机模拟器实时预览生成效果
- 💾 **作品管理** - 保存、浏览、下载历史作品

## 🖥️ 界面预览

采用 **Neo-Brutalism** 设计风格：
- 粗边框 (border-4)
- 硬阴影 (shadow-[4px_4px_0px_0px_#000])
- 高对比度配色 (黄 #FFD93D / 红 #FF6B6B / 青 #4ECDC4)

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + TailwindCSS |
| 后端 | FastAPI + SQLAlchemy + Alembic |
| 数据库 | PostgreSQL |
| 缓存 | Redis |
| 存储 | MinIO (S3 兼容) |
| AI | Google Gemini + Imagen API |
| 部署 | Docker Compose + Nginx |

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/24K-GA/NoteArtist.git
cd NoteArtist
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 3. 启动服务
```bash
docker-compose up -d --build
```

### 4. 初始化数据
```bash
# 运行数据库迁移
docker exec -it noteartist-backend alembic upgrade head

# 导入预设数据（可选）
docker exec -it noteartist-backend python seed_data.py
```

### 5. 访问应用
- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

## 📁 项目结构

```
NoteArtist/
├── frontend/                # React 前端
│   ├── src/
│   │   ├── components/      # UI 组件
│   │   │   ├── ui/          # 通用 Neo-Brutalism 组件
│   │   │   └── tabs/        # 页面标签组件
│   │   └── types/           # TypeScript 类型定义
│   └── Dockerfile
├── backend/                 # FastAPI 后端
│   ├── models/              # SQLAlchemy 数据模型
│   ├── routers/             # API 路由
│   ├── schemas/             # Pydantic 模式
│   ├── services/            # 业务服务 (Gemini, Imagen, Storage)
│   ├── alembic/             # 数据库迁移
│   └── Dockerfile
├── nginx/                   # Nginx 反向代理配置
├── docker-compose.yml       # Docker 编排
└── .env.example             # 环境变量模板
```

## ⚙️ 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `JWT_SECRET` | JWT 签名密钥 | ✅ |
| `DATABASE_URL` | PostgreSQL 连接字符串 | ✅ |
| `REDIS_URL` | Redis 连接字符串 | ✅ |
| `MINIO_ENDPOINT` | MinIO 服务地址 | ✅ |
| `MINIO_ACCESS_KEY` | MinIO 访问密钥 | ✅ |
| `MINIO_SECRET_KEY` | MinIO 私密密钥 | ✅ |

> 💡 Google API Key 在应用内通过「系统设置」页面配置，每个用户独立存储

## 📖 使用指南

### 创作流程

1. **设置 API Key** - 在「系统设置」中配置 Google Gemini/Imagen API Key
2. **创建人设** - 在「人设管理」中创建你的账号人设
3. **选择风格** - 在「创作台」选择视觉风格模板
4. **输入内容** - 粘贴你的干货内容
5. **生成作品** - 点击生成，AI 自动创作图片和文案
6. **保存分享** - 复制文案、下载图片，发布到小红书

### 预设风格

- 🖌️ 手绘笔记风格 - 温暖手写感
- ✏️ 极简线条风格 - 简约高级
- 🎨 水彩插画风格 - 艺术感十足
- 📜 复古海报风格 - 怀旧文艺
- 🔮 科技未来风格 - 现代科技感
- 🐰 可爱卡通风格 - 萌系治愈

## 🔧 开发指南

### 本地开发

```bash
# 前端开发
cd frontend
npm install
npm start

# 后端开发
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 数据库迁移

```bash
# 创建新迁移
docker exec -it noteartist-backend alembic revision --autogenerate -m "description"

# 执行迁移
docker exec -it noteartist-backend alembic upgrade head
```

## 📄 License

MIT License

## 🙏 致谢

- [Google Gemini](https://ai.google.dev/) - AI 文案生成
- [Google Imagen](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview) - AI 图像生成
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [Lucide Icons](https://lucide.dev/) - 图标库
