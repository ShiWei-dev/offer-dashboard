# Offer++ 求职投递管理系统

一个现代化的求职投递追踪和管理工具，帮助你高效管理求职进程。

## ✨ 功能特性

### 📊 核心功能
- **看板式管理**：拖拽式投递状态管理（待投递 → 已投递 → 面试中 → Offer → 已完结）
- **面试/笔试记录**：完整的面试和笔试记录管理，支持复盘和备注
- **数据统计**：可视化数据分析，掌握求职进度
- **智能提醒**：近期面试/笔试安排自动提醒

### 🎯 特色功能
- **立即复盘**：面试/笔试结束后即刻记录，支持问答对记录
- **优先级管理**：高/中/低优先级标记
- **多渠道追踪**：记录投递来源（官网、内推、猎头等）
- **搜索过滤**：快速定位特定公司或职位
- **数据导入导出**：支持 JSON 格式备份和恢复

### 💾 数据管理
- **本地存储**：数据保存在浏览器 localStorage
- **导出备份**：一键导出所有数据为 JSON 文件
- **导入恢复**：从备份文件快速恢复数据

## 🚀 快速开始

### 前置要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆或下载项目**
```bash
git clone <repository-url>
cd offer_dashboard
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

4. **访问应用**

打开浏览器访问：http://localhost:3000

## 📦 构建生产版本

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

## 🌐 部署

### Vercel 部署（推荐）

1. 安装 Vercel CLI
```bash
npm install -g vercel
```

2. 登录并部署
```bash
vercel login
vercel
```

### Netlify 部署

1. 访问 [Netlify](https://www.netlify.com/)
2. 拖拽项目文件夹到部署区域
3. 等待自动部署完成

## 🛠️ 技术栈

- **框架**：Next.js 15 + React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **UI 组件**：Shadcn/ui (基于 Radix UI)
- **状态管理**：Zustand
- **数据持久化**：localStorage
- **拖拽功能**：@dnd-kit

## 📁 项目结构

```
offer_dashboard/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页（仪表板）
│   ├── board/             # 看板页面
│   ├── interviews/        # 面试记录页面
│   └── settings/          # 数据管理页面
├── components/            # React 组件
│   ├── board/            # 看板相关组件
│   ├── dashboard/        # 仪表板组件
│   ├── jobs/             # 投递管理组件
│   └── ui/               # UI 基础组件
├── lib/                   # 工具函数和类型定义
│   ├── store.ts          # Zustand 状态管理
│   ├── types.ts          # TypeScript 类型定义
│   ├── constants.ts      # 常量配置
│   └── utils.ts          # 工具函数
└── public/               # 静态资源
```

## 💡 使用技巧

### 数据备份
建议定期导出数据备份：
1. 访问"数据管理"页面
2. 点击"导出为 JSON"
3. 保存备份文件到安全位置

### 数据迁移
更换设备或浏览器时：
1. 在旧设备导出数据
2. 在新设备导入数据文件

### 浏览器兼容性
- ✅ Chrome/Edge（推荐）
- ✅ Firefox
- ✅ Safari
- ⚠️ 隐私模式下数据不持久化

## ⚠️ 注意事项

### 数据安全
- 数据存储在浏览器 localStorage
- 清除浏览器缓存会导致数据丢失
- 重装系统或换设备无法自动同步
- **强烈建议定期导出备份**

### 存储限制
- localStorage 容量限制：约 5-10MB
- 建议投递记录不超过 500 条
- 超出限制时请导出旧数据并清理

## 🤝 分享给他人

### 方式一：源代码分享
1. 打包项目文件夹（排除 node_modules、.next、.git）
2. 发送给对方
3. 对方按照"快速开始"步骤安装运行

### 方式二：在线部署
1. 部署到 Vercel/Netlify
2. 分享网址
3. 对方直接访问使用

## 📄 许可证

MIT License

## 🙏 致谢

- Next.js Team
- Shadcn/ui
- 所有开源贡献者

---

**开发者**: shiwei  
**更新时间**: 2026-08-17
