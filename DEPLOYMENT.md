# 部署指南

本文档提供详细的部署步骤和配置说明。

## 目录

- [Vercel 部署（推荐）](#vercel-部署推荐)
- [Netlify 部署](#netlify-部署)
- [自托管部署](#自托管部署)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

---

## Vercel 部署（推荐）

### 方式一：一键部署

1. 点击下方按钮开始部署：

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

2. 连接你的 GitHub 账号
3. 导入此仓库
4. Vercel 会自动检测 Next.js 项目并完成部署
5. 部署完成后获得生产环境 URL

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署到生产环境
vercel --prod
```

### 方式三：GitHub Actions 自动部署

1. **获取 Vercel Token**
   - 访问 https://vercel.com/account/tokens
   - 创建新的 Token
   - 复制 Token

2. **配置 GitHub Secrets**
   - 进入 GitHub 仓库 Settings → Secrets and variables → Actions
   - 添加 Secret: `VERCEL_TOKEN`（粘贴上一步的 Token）

3. **推送代码触发部署**
   ```bash
   git push origin main
   ```

4. 查看 Actions 标签页查看部署进度

### Vercel 配置说明

项目已包含 `vercel.json` 配置文件，默认配置：

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

---

## Netlify 部署

### 方式一：拖拽部署

1. 访问 [Netlify](https://www.netlify.com/)
2. 注册/登录账号
3. 点击 "Add new site" → "Deploy manually"
4. 拖拽项目文件夹到部署区域
5. 等待自动构建完成

### 方式二：GitHub 集成

1. 访问 [Netlify](https://app.netlify.com/start)
2. 选择 "Import from Git"
3. 连接 GitHub 并选择此仓库
4. Netlify 自动读取 `netlify.toml` 配置
5. 点击 "Deploy site"

### Netlify 配置说明

项目已包含 `netlify.toml` 配置：

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

---

## 自托管部署

适合部署到 VPS、云服务器等。

### 1. 准备服务器环境

```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

### 2. 部署项目

```bash
# 克隆代码
git clone <repository-url>
cd offer_dashboard

# 安装依赖
npm ci

# 构建
npm run build

# 使用 PM2 启动
pm2 start npm --name "offer-dashboard" -- start

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

### 3. 配置 Nginx 反向代理

```bash
# 安装 Nginx
sudo apt-get install nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/offer-dashboard
```

粘贴以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/offer-dashboard /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 配置 HTTPS（可选但推荐）

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 环境变量配置

本项目使用 localStorage 存储数据，无需配置数据库环境变量。

如果需要自定义配置，创建 `.env.local` 文件：

```env
# 自定义端口（可选）
PORT=3000

# Next.js 配置
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 常见问题

### Q1: 构建失败 "Module not found"

**解决方案：**
```bash
# 清除缓存并重新安装
rm -rf node_modules .next
npm install
npm run build
```

### Q2: Vercel 部署后页面空白

**解决方案：**
- 检查浏览器控制台错误
- 检查是否有环境变量缺失
- 查看 Vercel 部署日志排查构建问题

### Q4: Nginx 502 Bad Gateway

**解决方案：**
```bash
# 检查 Next.js 是否运行
pm2 status

# 重启应用
pm2 restart offer-dashboard

# 检查端口是否正确
netstat -tulpn | grep 3000
```

### Q5: PM2 进程重启后数据丢失

**原因：** 数据存储在浏览器 localStorage，与服务器无关

**解决方案：** 定期在「数据管理」页面导出备份

### Q6: 部署后样式错误

**解决方案：**
```bash
# 确保 Tailwind CSS 正确构建
npm run build

# 检查 postcss 配置
cat postcss.config.mjs
```

---

## 更新部署

### Vercel/Netlify（Git 集成）
```bash
git add .
git commit -m "update"
git push origin main
# 自动触发部署
```

### PM2
```bash
# 拉取最新代码
git pull

# 重新构建
npm run build

# 重启应用
pm2 restart offer-dashboard
```

---

## 性能优化建议

1. **启用 CDN**: Vercel/Netlify 自动配置
2. **压缩资源**: Next.js 默认已启用 gzip
3. **缓存策略**: 配置 Nginx 缓存静态资源
4. **监控**: 使用 PM2 监控应用状态

```bash
# PM2 监控
pm2 monit

# PM2 日志
pm2 logs offer-dashboard
```

---

## 支持

遇到部署问题？

1. 查看 [GitHub Issues](../../issues)
2. 提交新的 Issue
3. 查看 Next.js 官方文档

---

**最后更新**: 2026-08-18
