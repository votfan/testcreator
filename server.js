const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
// Указываем серверу раздавать файлы из папки 'public' (там будет лежать твой index.html)
app.use(express.static('public'));

const USERS_FILE = './users.json';
const TESTS_FILE = './tests.json';

// Инициализация файлов базы данных, если их нет
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
if (!fs.existsSync(TESTS_FILE)) fs.writeFileSync(TESTS_FILE, '[]');

// --- API для Пользователей ---
app.post('/api/register', (req, res) => {
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    if (users.find(u => u.name === req.body.name)) return res.status(400).json({ error: 'Логин занят' });
    users.push(req.body);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ message: 'Успешная регистрация' });
});

app.post('/api/login', (req, res) => {
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    const user = users.find(u => u.name === req.body.name && u.pass === req.body.pass);
    if (!user) return res.status(401).json({ error: 'Неверные данные' });
    res.json(user);
});

// --- API для Тестов ---
app.get('/api/tests', (req, res) => {
    const tests = JSON.parse(fs.readFileSync(TESTS_FILE));
    res.json(tests);
});

app.post('/api/tests', (req, res) => {
    const tests = JSON.parse(fs.readFileSync(TESTS_FILE));
    const newTest = req.body;
    // Если тест с таким ID есть — обновляем, если нет — добавляем
    const idx = tests.findIndex(t => t.code === newTest.code);
    if (idx !== -1) tests[idx] = newTest;
    else tests.push(newTest);
    fs.writeFileSync(TESTS_FILE, JSON.stringify(tests, null, 2));
    res.json({ message: 'Сохранено' });
});

app.delete('/api/tests/:code', (req, res) => {
    let tests = JSON.parse(fs.readFileSync(TESTS_FILE));
    tests = tests.filter(t => t.code !== req.params.code);
    fs.writeFileSync(TESTS_FILE, JSON.stringify(tests, null, 2));
    res.json({ message: 'Удалено' });
});

app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));