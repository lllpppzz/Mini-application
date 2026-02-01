# 学术论文检索系统 (Academic Paper Search)

基于参考文献模板的智能文献发现平台 - A template-based intelligent literature discovery platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📖 简介 (Introduction)

学术论文检索系统是一个跨平台桌面应用程序，通过上传参考文献PDF文件，系统能够智能提取关键词并在多个学术数据库中搜索相关高质量论文。支持中英文文献，提供基于相似度、引用量和期刊影响力的智能排序。

This is a cross-platform desktop application that enables intelligent academic paper search using reference papers as templates. Upload up to 5 PDF reference papers, and the system will automatically extract keywords and search multiple academic databases for relevant high-quality papers.

## ✨ 核心功能 (Key Features)

- 📚 **多数据库整合** - 集成 Semantic Scholar、arXiv、PubMed、CrossRef
- 🔍 **智能关键词提取** - 使用 TF-IDF 自动提取参考文献关键词
- 📊 **智能排序算法** - 基于相似度、引用量、时效性的综合评分
- 🌐 **中英文支持** - 自动识别和处理中英文文献
- 🎯 **高级筛选** - 按年份、引用数、数据源、期刊等多维度过滤
- 💾 **批量导出** - 支持导出搜索结果为 CSV 格式
- ⭐ **收藏管理** - 收藏感兴趣的论文，方便后续查阅
- 📜 **搜索历史** - 保存搜索记录，支持重新运行
- 🌙 **深色模式** - 支持明暗主题切换

## 🚀 快速开始 (Quick Start)

### 前置要求 (Prerequisites)

- Node.js (v18+)
- Python (v3.8+)
- npm or yarn

### 安装步骤 (Installation)

1. **安装 Node.js 依赖**

```bash
cd academic-paper-search
npm install
```

2. **安装 Python 依赖**

```bash
cd backend/python
pip install -r requirements.txt
```

### 运行应用 (Running the Application)

**开发模式 (Development Mode)**

```bash
npm run dev
```

**构建生产版本 (Build for Production)**

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

构建完成后，可执行文件将位于 `release/` 目录中。

## 📁 项目结构 (Project Structure)

```
academic-paper-search/
├── electron/              # Electron 主进程
│   ├── main.js           # 主进程入口
│   └── preload.js        # 预加载脚本
├── backend/              # 后端服务
│   ├── node/             # Node.js 服务
│   │   ├── api/          # API 集成
│   │   │   ├── semanticScholar.js
│   │   │   ├── arxiv.js
│   │   │   ├── crossref.js
│   │   │   └── pubmed.js
│   │   ├── search/       # 搜索引擎
│   │   │   └── searchEngine.js
│   │   └── pythonBridge.js
│   └── python/           # Python 服务
│       ├── pdf_parser.py     # PDF 解析
│       ├── similarity.py     # 相似度计算
│       └── requirements.txt
├── src/                  # React 前端
│   ├── components/       # UI 组件
│   │   ├── Layout.jsx
│   │   ├── ReferenceUploader.jsx
│   │   └── PaperCard.jsx
│   ├── pages/            # 页面组件
│   │   ├── HomePage.jsx
│   │   ├── SearchResultsPage.jsx
│   │   ├── PaperDetailsPage.jsx
│   │   ├── HistoryPage.jsx
│   │   └── SettingsPage.jsx
│   ├── store/            # 状态管理
│   │   └── useStore.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 使用指南 (User Guide)

### 1. 上传参考文献

- 在首页点击上传区域或拖放 PDF 文件
- 最多可上传 5 篇参考文献
- 系统会自动提取标题、作者、摘要和关键词

### 2. 开始检索

- 上传完参考文献后，点击"开始检索"按钮
- 系统将自动提取关键词并搜索多个数据库
- 搜索过程会显示实时进度

### 3. 查看结果

- 结果按综合得分自动排序
- 可以按相似度、引用数、年份等重新排序
- 支持搜索标题、作者、摘要等内容
- 点击论文卡片查看详细信息

### 4. 导出和收藏

- 点击"导出 CSV"按钮导出搜索结果
- 点击心形图标收藏感兴趣的论文
- 在"历史记录"页面查看收藏和搜索历史

## 🔧 技术栈 (Tech Stack)

### 前端 (Frontend)

- **React 18** - UI 框架
- **Material-UI 5** - UI 组件库
- **Zustand** - 状态管理
- **React Router** - 路由管理
- **PapaParse** - CSV 处理

### 后端 (Backend)

- **Node.js** - 主要后端逻辑
- **Electron** - 跨平台桌面框架
- **Python** - PDF 解析和相似度计算
- **scikit-learn** - 机器学习库（TF-IDF）
- **PyPDF2 & pdfplumber** - PDF 处理

### API 集成 (API Integration)

- **Semantic Scholar API** - 综合学术搜索
- **arXiv API** - 预印本论文
- **CrossRef API** - DOI 和期刊信息
- **PubMed API** - 医学文献

## 📊 评分算法 (Scoring Algorithm)

综合得分由以下因素组成：

- **相似度** (50%) - 基于 TF-IDF 和余弦相似度
- **引用影响力** (30%) - 归一化引用数（对数尺度）
- **时效性** (20%) - 基于发表年份的新近度

## 🔒 隐私和安全 (Privacy & Security)

- 所有数据处理在本地完成
- 不上传任何文件到云端
- API 调用使用官方免费接口
- 搜索历史和收藏存储在本地

## 🤝 贡献 (Contributing)

欢迎提交 Issue 和 Pull Request！

## 📄 许可证 (License)

## 📮 联系方式 (Contact)

如有问题或建议，请提交 Issue。

---

**注意事项 (Notes):**

1. 确保已安装 Python 和 Node.js
2. 某些 API 有速率限制，请合理使用
3. PDF 解析质量取决于原文件质量
4. 推荐使用高质量的参考文献以获得更好的搜索结果

**已知限制 (Known Limitations):**

- Google Scholar 无官方 API，未集成
- 影响因子数据使用免费的 SJR 替代
- 中文数据库（CNKI、万方）需要机构访问权限，当前未集成
- PDF 解析对扫描版 PDF 支持有限

**未来计划 (Future Plans):**

- [ ] 添加引文网络可视化
- [ ] 支持批量搜索
- [ ] 集成更多数据库
- [ ] 添加论文对比功能
- [ ] 支持自定义排序权重
