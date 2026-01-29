# 快速开始指南 (Quick Start Guide)

## 前置要求

在开始之前，请确保您的系统已安装以下软件：

### 1. Node.js (v18 或更高版本)

**检查是否已安装：**

```bash
node --version
npm --version
```

**如果未安装，请访问：**

- 官网下载: <https://nodejs.org/>
- 建议下载 LTS（长期支持）版本

### 2. Python (v3.8 或更高版本)

**检查是否已安装：**

```bash
python --version
```

**如果未安装，请访问：**

- 官网下载: <https://www.python.org/downloads/>
- 安装时勾选 "Add Python to PATH"

---

## 安装步骤

### 步骤 1: 打开项目目录

```bash
cd E:\GUGE_Antigravity\chengxuyuyanchusheji\xiangmu\academic-paper-search
```

### 步骤 2: 安装 Node.js 依赖

```bash
npm install
```

> 这将安装所有必要的 JavaScript 依赖包，包括 React、Electron、Material-UI 等。
> 预计需要 3-5 分钟（取决于网络速度）。

### 步骤 3: 安装 Python 依赖

```bash
cd backend\python
pip install -r requirements.txt
cd ..\..
```

> 这将安装 PDF 解析和相似度计算所需的 Python 库。

---

## 运行应用

### 开发模式 (推荐用于测试)

```bash
npm run dev
```

这将：

1. 启动 Vite 开发服务器 (端口 5173)
2. 启动 Electron 应用窗口
3. 启用热重载（代码修改后自动刷新）

### 使用应用

1. **上传参考文献**
   - 点击首页的上传区域
   - 选择 1-5 篇 PDF 格式的学术论文
   - 系统会自动解析 PDF 内容

2. **开始检索**
   - 点击 "开始检索" 按钮
   - 等待系统搜索（通常 30-60 秒）
   - 系统会并行搜索 4 个学术数据库

3. **查看结果**
   - 结果按综合得分排序
   - 可以按相似度、引用数、年份重新排序
   - 点击论文卡片查看详细信息

4. **导出和收藏**
   - 点击 "导出 CSV" 保存结果
   - 点击心形图标收藏论文
   - 在 "历史记录" 页面查看收藏

---

## 构建生产版本

### Windows

```bash
npm run build:win
```

生成的安装包位于: `release/` 目录

### macOS

```bash
npm run build:mac
```

### Linux

```bash
npm run build:linux
```

---

## 故障排除

### 问题 1: npm 命令未找到

**解决方案:**

1. 确保已安装 Node.js
2. 重新打开终端/命令提示符
3. 检查环境变量 PATH 中是否包含 Node.js 路径

### 问题 2: Python 命令未找到

**解决方案:**

1. 使用 `python3` 替代 `python`
2. 或使用 `py` 命令（Windows）
3. 确保 Python 已添加到 PATH

### 问题 3: 安装依赖时出错

**解决方案:**

1. 清除缓存: `npm cache clean --force`
2. 删除 node_modules 文件夹
3. 重新运行 `npm install`

### 问题 4: Electron 无法启动

**解决方案:**

1. 确保端口 5173 未被占用
2. 检查防火墙设置
3. 尝试单独运行: `vite` 然后 `electron .`

---

## 注意事项

1. **API 速率限制**
   - 某些学术数据库有 API 调用限制
   - 建议间隔一定时间再次搜索

2. **PDF 质量**
   - 扫描版 PDF 可能无法正确解析
   - 推荐使用文本型 PDF 文件

3. **网络连接**
   - 搜索需要访问互联网
   - 某些地区可能需要合适的网络环境

4. **第一次搜索可能较慢**
   - Python 环境初始化需要时间
   - 后续搜索会更快

---

## 获取帮助

如遇到问题:

1. 查看控制台错误信息
2. 检查 [README.md](file:///E:/GUGE_Antigravity/chengxuyuyanchusheji/xiangmu/academic-paper-search/README.md) 中的详细文档
3. 查看项目代码中的注释

---

## 下一步

- 尝试使用不同领域的参考文献
- 调整设置中的过滤器参数
- 探索收藏和历史功能
- 导出结果进行进一步分析

祝您使用愉快！🎉
