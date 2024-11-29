const express = require('express');
const app = express();
const port = process.env.PORT || 7860;

// JSONパーサーの設定
app.use(express.json());

// 静的ファイルの提供
app.use(express.static('public'));

// メインのルート
app.get('/', (req, res) => {
  res.send('Lighthouse Analyzer API is running');
});

// Lighthouse分析エンドポイント
app.post('/analyze', require('./index.js'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 