const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hello from Node.js CI/CD Pipeline!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP'
  });
});

module.exports = app;
