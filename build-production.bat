@echo off
echo 🚀 Создание чистого production билда...

REM Временно заменяем index.html на production версию
move index.html index.html.backup
copy index.production.html index.html

REM Создаём билд
call npm run build

REM Возвращаем обратно оригинальный index.html
del index.html
move index.html.backup index.html

echo.
echo ✅ Production билд готов в папке dist/
echo 📦 Файлы готовы для размещения на хостинге
echo.
echo Чтобы разместить на хостинге:
echo 1. Скачайте содержимое папки dist/
echo 2. Загрузите на ваш хостинг (Nginx, Apache, Vercel, Netlify)
echo 3. Настройте редиректы для SPA (все запросы → index.html)
pause
