#!/usr/bin/env node

/**
 * Скрипт для проверки переменных окружения
 * Запуск: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка конфигурации проекта...\n');

// Проверка наличия файлов
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'vercel.json',
  'env.example'
];

console.log('📁 Проверка файлов:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Проверка package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\n📦 Проверка package.json:');
  console.log(`  ✅ Версия: ${packageJson.version}`);
  console.log(`  ✅ Имя: ${packageJson.name}`);
  
  const scripts = packageJson.scripts || {};
  const requiredScripts = ['dev', 'build', 'preview'];
  requiredScripts.forEach(script => {
    console.log(`  ${scripts[script] ? '✅' : '❌'} Скрипт "${script}"`);
  });
} catch (error) {
  console.log('  ❌ Ошибка чтения package.json');
}

// Проверка переменных окружения
console.log('\n🔐 Проверка переменных окружения:');
const envFile = '.env.local';
const envExists = fs.existsSync(envFile);

if (envExists) {
  console.log(`  ✅ Файл ${envFile} найден`);
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GEMINI_API_KEY'
  ];
  
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName);
    console.log(`  ${hasVar ? '✅' : '❌'} ${varName}`);
  });
} else {
  console.log(`  ⚠️  Файл ${envFile} не найден`);
  console.log('     Создайте файл .env.local с переменными:');
  console.log('     VITE_SUPABASE_URL=your_supabase_url');
  console.log('     VITE_SUPABASE_ANON_KEY=your_supabase_key');
  console.log('     VITE_GEMINI_API_KEY=your_gemini_key');
}

// Проверка node_modules
console.log('\n📚 Проверка зависимостей:');
const nodeModulesExists = fs.existsSync('node_modules');
console.log(`  ${nodeModulesExists ? '✅' : '❌'} node_modules`);

if (!nodeModulesExists) {
  console.log('     Запустите: npm install');
}

console.log('\n🎯 Рекомендации:');
console.log('1. Убедитесь, что все переменные окружения настроены');
console.log('2. Выполните: npm install (если node_modules отсутствует)');
console.log('3. Запустите: npm run dev для локальной проверки');
console.log('4. Следуйте инструкциям в DEPLOYMENT.md для развертывания');

console.log('\n✨ Проверка завершена!'); 