# 截图指南

## 需要添加的截图

请在 `public/` 目录下添加以下三张截图，用于 README 展示：

### 1. screenshot-dashboard.png
**页面**: 首页仪表板 (http://localhost:3000)
**内容**: 
- 统计卡片（投递总数、面试邀约、待面试、Offer数）
- 投递状态分布图表
- 近期面试提醒

**建议尺寸**: 1280x800 或更高
**格式**: PNG

### 2. screenshot-board.png
**页面**: 看板页面 (http://localhost:3000/board)
**内容**:
- 拖拽式看板（待投递、已投递、面试中、Offer、已完结）
- 展示几个示例投递卡片
- 搜索和筛选功能

**建议尺寸**: 1280x800 或更高
**格式**: PNG

### 3. screenshot-interviews.png
**页面**: 面试记录页面 (http://localhost:3000/interviews)
**内容**:
- 面试/笔试记录列表
- 展示记录详情或问答对

**建议尺寸**: 1280x800 或更高
**格式**: PNG

## 如何截图

### 方式一：浏览器截图
1. 运行 `npm run dev`
2. 访问对应页面
3. 使用浏览器开发者工具截图（推荐 Chrome DevTools 的设备模拟器）

### 方式二：使用截图工具
1. Windows: Win + Shift + S
2. Mac: Command + Shift + 4
3. 第三方工具: Snipaste, ShareX 等

## 截图技巧

- **添加示例数据**: 先添加几条示例投递记录，让截图更有说服力
- **保持清晰**: 使用高 DPI 显示器截图，或在浏览器中调整缩放比例
- **统一风格**: 三张截图使用相同的浏览器窗口大小
- **隐藏敏感信息**: 如果有真实公司或个人信息，请使用虚构数据

## 完成后

将三张截图文件放入 `public/` 目录：
```
public/
├── screenshot-dashboard.png
├── screenshot-board.png
└── screenshot-interviews.png
```

README 中已经配置好引用路径，截图添加后会自动显示。
