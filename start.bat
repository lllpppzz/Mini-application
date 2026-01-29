@echo off
chcp 65001 >nul
echo ========================================
echo 学术论文检索系统 - 自动安装与启动
echo ========================================
echo.

echo [1/4] 检查环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未安装 Node.js! 请访问 https://nodejs.org/ 下载安装。
    pause
    exit /b 1
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未安装 Python! 请访问 https://python.org/ 下载安装。
    pause
    exit /b 1
)

echo [2/4] 安装 Node.js 依赖...
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo Node.js 依赖安装失败!
        pause
        exit /b 1
    )
)

echo [3/4] 安装 Python 依赖...
cd backend\python
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Python 依赖安装失败!
    pause
    exit /b 1
)
cd ..\..

echo [4/4] 启动应用...
echo 正在启动，请稍候...
npm run dev

pause
