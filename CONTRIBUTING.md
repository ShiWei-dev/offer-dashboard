# 贡献指南

感谢你考虑为 Offer++ 做出贡献！

## 🤝 如何贡献

### 报告 Bug

如果你发现了 Bug，请：

1. 检查 [Issues](../../issues) 确认问题未被报告
2. 创建新的 Issue，包含：
   - Bug 描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 截图（如适用）
   - 浏览器和操作系统信息

### 提出新功能

1. 在 [Issues](../../issues) 中创建 Feature Request
2. 描述功能的用途和预期效果
3. 等待讨论和反馈

### 提交代码

1. **Fork 仓库**
   ```bash
   # Fork 后克隆到本地
   git clone https://github.com/your-username/offer_dashboard.git
   cd offer_dashboard
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **开发和测试**
   ```bash
   # 安装依赖
   npm install
   
   # 启动开发服务器
   npm run dev
   
   # 运行 linter
   npm run lint
   
   # 构建测试
   npm run build
   ```

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加 XXX 功能"
   # 或
   git commit -m "fix: 修复 XXX 问题"
   ```

5. **推送并创建 Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   然后在 GitHub 上创建 Pull Request。

## 📝 代码规范

### Commit Message 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

**示例：**
```
feat: 添加数据导出为 CSV 功能
fix: 修复看板拖拽卡顿问题
docs: 更新部署文档
```

### 代码风格

- 使用 TypeScript
- 遵循 ESLint 配置
- 组件使用函数式组件 + Hooks
- 使用 Tailwind CSS 编写样式
- 保持代码简洁，添加必要注释

### 文件命名

- 组件文件：`PascalCase.tsx`
- 工具函数：`camelCase.ts`
- 类型定义：`types.ts`
- 常量：`constants.ts`

## 🧪 测试

提交 PR 前请确保：

- [ ] 代码通过 `npm run lint`
- [ ] 代码可以正常构建 `npm run build`
- [ ] 在浏览器中测试功能正常
- [ ] 没有引入新的 TypeScript 错误
- [ ] 兼容 Chrome/Firefox/Safari

## 📖 开发指南

### 项目结构

```
offer_dashboard/
├── app/                 # Next.js 页面
├── components/          # React 组件
├── lib/                # 核心逻辑
│   ├── store.ts       # 状态管理
│   ├── types.ts       # 类型定义
│   └── utils.ts       # 工具函数
└── public/            # 静态资源
```

### 添加新页面

1. 在 `app/` 目录创建路由文件夹
2. 添加 `page.tsx` 和 `layout.tsx`（可选）
3. 在导航栏添加链接

### 添加新功能

1. 在 `lib/types.ts` 定义类型
2. 在 `lib/store.ts` 添加状态和方法
3. 在 `components/` 创建相关组件
4. 在页面中使用

### 状态管理

使用 Zustand 进行状态管理：

```typescript
import { useJobStore } from '@/lib/store';

function MyComponent() {
  const { jobs, addJob } = useJobStore();
  
  // 使用状态和方法
}
```

### 样式开发

使用 Tailwind CSS + Shadcn/ui：

```tsx
<div className="flex items-center gap-2 p-4 rounded-lg bg-card">
  <Button variant="outline">按钮</Button>
</div>
```

## 🎯 优先级任务

查看 [Issues](../../issues) 中标记为 `good first issue` 的任务，适合新贡献者。

当前需要帮助的领域：

- [ ] 云端数据同步功能
- [ ] 移动端适配优化
- [ ] 数据可视化增强
- [ ] 导出 PDF 功能
- [ ] 国际化支持

## ❓ 问题咨询

- 开发问题：提 Issue
- 功能讨论：Discussions
- 紧急 Bug：提 Issue 并标记 `urgent`

## 📜 许可证

提交代码即表示你同意将贡献内容以 MIT 许可证发布。

---

再次感谢你的贡献！🎉
