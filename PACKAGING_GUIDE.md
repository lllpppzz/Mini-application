# 学术论文检索系统打包指南

本指南将帮助您将应用打包为独立的 Windows 可执行文件 (.exe)，内置 Python 环境，无需用户安装任何依赖。

## 1. 准备 Python 环境

为了实现"不依赖环境"，我们需要将 Python 运行时打包进应用中。

### 步骤 1.1：下载 Python 嵌入式包

1. 访问 [Python Windows Downloads](https://www.python.org/downloads/windows/)。
2. 下载 **Windows embeddable package (64-bit)** (建议版本 3.8 或更高)。
3. 在项目根目录下创建一个名为 `python-env` 的文件夹。
4. 将下载的 zip 文件解压到 `python-env` 文件夹中。
   - 确保 `python.exe` 位于 `python-env/python.exe`。

### 步骤 1.2：配置 Python 环境

1. 打开 `python-env` 文件夹中的 `python38._pth` (文件名取决于版本)。
2. 用记事本打开，取消注释最后一行 `import site` (删除前面的 `#`)。
3. 保存文件。

### 步骤 1.3：安装依赖库

我们需要安装 `PyPDF2` 和 `pdfplumber`。

1. 下载 [get-pip.py](https://bootstrap.pypa.io/get-pip.py) 并保存到 `python-env` 文件夹。
2. 打开终端 (cmd 或 PowerShell)，进入 `python-env` 目录。
3. 运行以下命令安装 pip：

   ```bash
   .\python.exe get-pip.py
   ```

4. 安装所需依赖：

   ```bash
   .\python.exe -m pip install PyPDF2 pdfplumber
   ```

   *(如果需要完整版相似度计算，还可以安装 `scikit-learn numpy`，但这会显著增加体积)*

## 2. 打包应用

环境准备好后，就可以开始打包了。

### 步骤 2.1：运行构建命令

在项目根目录打开终端，运行：

```bash
npm run build:win
```

### 步骤 2.2：等待构建完成

构建过程可能需要几分钟。完成后，您可以在 `release` 文件夹中找到生成的安装程序（通常是 `.exe` 文件）。

## 3. 验证

1. 进入 `release` 文件夹。
2. 运行生成的 `.exe` 文件（或 `win-unpacked` 文件夹中的可执行文件）。
3. 尝试使用 PDF 解析功能，确保 Python 脚本能正常运行。

## 常见问题

**Q: 打包后的文件太大怎么办？**
A: Python 环境和依赖库占用了大部分空间。您可以尝试删除 `python-env/Lib/site-packages` 中不必要的库文件，或者只安装最基本的依赖。

**Q: 运行报错 "Python script failed"？**
A: 检查 `resources/python-env` 是否完整，以及是否正确安装了所有依赖。您可以在打包后的应用目录中手动运行 Python 脚本来测试。
