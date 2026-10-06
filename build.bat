@echo off
REM Gop toan bo ES modules trong js/ thanh js/bundle.js de mo truc tiep index.html (file://) van chay.
REM Can Node.js. Chay lai file nay moi khi sua code trong js/.
cd /d "%~dp0"
npx --yes esbuild js/main.js --bundle --format=iife --target=es2020 --outfile=js/bundle.js
if errorlevel 1 (echo BUILD LOI & pause & exit /b 1)
echo Build xong: js/bundle.js
