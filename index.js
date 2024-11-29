// index.js
const express = require('express');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const app = express();
app.use(express.json());

app.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const results = await lighthouse(url, {
      port: chrome.port,
    });
    await chrome.kill();
    res.json(JSON.parse(results.report));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));