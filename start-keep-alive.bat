@echo off
REM Auto-start keep-alive service
REM This runs automatically when Windows starts

cd D:\finance-blog
node scripts/keep-alive.js

REM If it crashes, restart automatically
:restart
node scripts/keep-alive.js
goto restart
