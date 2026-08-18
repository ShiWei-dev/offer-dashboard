# 🚀 快速部署检查清单

部署前请完成以下步骤：

## ✅ 部署前准备

- [ ] **添加项目截图**
  - 按照 [SCREENSHOTS.md](SCREENSHOTS.md) 添加三张截图到 `public/` 目录
  - `screenshot-dashboard.png` - 仪表板页面
  - `screenshot-board.png` - 看板页面
  - `screenshot-interviews.png` - 面试记录页面

- [ ] **验证构建**
  ```bash
  npm run build
  ```

- [ ] **测试本地运行**
  ```bash
  npm start
  ```

- [ ] **检查 Git 状态**
  ```bash
  git status
  ```

## 🎯 选择部署方式

### 方式 1️⃣: Vercel（最简单，推荐）

```bash
npm install -g vercel
vercel login
vercel --prod
```

**完成！** 🎉 获得部署 URL

### 方式 2️⃣: Netlify

1. 访问 https://app.netlify.com/start
2. 连接 GitHub 仓库
3. 自动检测配置并部署

**完成！** 🎉

### 方式 3️⃣: 自托管服务器

参考 [DEPLOYMENT.md](DEPLOYMENT.md) 完整指南

## 📋 部署后检查

- [ ] 访问部署 URL 确认页面正常
- [ ] 测试添加投递记录功能
- [ ] 测试看板拖拽功能
- [ ] 测试数据导出/导入功能
- [ ] 在移动设备测试响应式布局

## 🔧 可选配置

### GitHub Actions 自动部署

如果使用 Vercel + GitHub：

1. 获取 Vercel Token: https://vercel.com/account/tokens
2. 添加到 GitHub Secrets: `VERCEL_TOKEN`
3. 推送代码自动触发部署

### 自定义域名

**Vercel:**
- Dashboard → Settings → Domains
- 添加自定义域名并配置 DNS

**Netlify:**
- Site settings → Domain management
- 添加自定义域名

## ❓ 遇到问题？

1. 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 常见问题
2. 检查 [GitHub Issues](../../issues)
3. 提交新 Issue

## 📚 相关文档

- [README.md](README.md) - 项目介绍
- [DEPLOYMENT.md](DEPLOYMENT.md) - 详细部署指南
- [CONTRIBUTING.md](CONTRIBUTING.md) - 贡献指南
- [SCREENSHOTS.md](SCREENSHOTS.md) - 截图指南

---

**准备好了？开始部署吧！** 🚀
