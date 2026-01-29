# 快速启动指南

## 问题诊断

如果应用显示空白屏幕，可能是以下原因之一：

1. **Vite 开发服务器未启动**
2. **Electron 在 Vite 就绪前启动**
3. **模块系统不兼容**

## 解决方案

### 方法 1: 使用启动脚本（推荐）

我已经创建了一个 `start.bat` 启动脚本：

```bash
# 双击运行
start.bat
```

这个脚本会：

1. 检查 Node.js 是否已安装
2. 自动安装依赖（如果需要）
3. 先启动 Vite，然后启动 Electron

### 方法 2: 手动分步启动

#### 步骤 1: 启动 Vite 开发服务器

```bash
npm run vite-only
```

等待看到类似这样的输出：

```
VITE vX.X.X  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 步骤 2: 在另一个终端启动 Electron

**打开新的命令提示符窗口**，然后运行：

```bash
cd E:\GUGE_Antigravity\chengxuyuyanchusheji\xiangmu\academic-paper-search
npm run electron-only
```

### 方法 3: 使用 npm run dev（如果已安装 wait-on）

> 注意：这需要先手动安装 wait-on 依赖

在项目根目录运行：

```bash
npm install wait-on concurrently --save-dev
npm run dev
```

## 验证

成功启动后，您应该看到：

- ✅ Electron 窗口打开
- ✅ 显示"学术论文检索系统"界面（全中文）
- ✅ 可以看到上传区域和功能介绍

## 常见问题

### Q: 窗口打开但是空白？

A: 打开开发者工具（Ctrl+Shift+I），查看控制台错误信息。通常是以下原因：

- React 组件编译错误
- 路由配置问题
- 模块导入失败

### Q: 提示端口 5173 被占用？

A: 更改 Vite 端口：

1. 编辑 `vite.config.js`
2. 修改 `server.port` 为其他端口（如 5174）
3. 同时修改 `electron/main.js` 中的 URL

### Q: 界面显示英文？

A: 检查以下文件是否正确：

- `src/pages/HomePage.jsx` - 应该是中文
- `src/components/Layout.jsx` - 标题应该是"学术论文检索系统"

所有界面文本都已设置为中文。

## 下一步

启动成功后：

1. 尝试上传一个 PDF 文件
2. 查看是否能正确解析
3. 点击"开始检索"测试搜索功能

如果遇到任何问题，请记录控制台的错误信息！
