# Lighthouse Analysis API ドキュメント

このAPIは、指定されたURLに対してLighthouse分析を実行し、パフォーマンス、SEO、リンク分析などの包括的な情報を提供します。

## 基本的な使用方法

### エンドポイント
```
POST /analyze
```

### リクエスト形式
```json
{
  "url": "https://example.com",
  "options": {
    "formFactor": "desktop",
    "onlyCategories": ["performance", "seo"],
    "throttling": {
      "rttMs": 40,
      "throughputKbps": 10240,
      "cpuSlowdownMultiplier": 1
    }
  }
}
```

### オプションパラメーター

| パラメーター | 型 | デフォルト値 | 説明 |
|------------|-----|------------|------|
| formFactor | string | "desktop" | "desktop" または "mobile" |
| onlyCategories | array | ["performance", "seo"] | 分析するカテゴリー |
| throttling.rttMs | number | 40 | ネットワークレイテンシー（ミリ秒） |
| throttling.throughputKbps | number | 10240 | スループット（Kbps） |
| throttling.cpuSlowdownMultiplier | number | 1 | CPU速度の乗数 |

## レスポンス例

```json
{
  "url": "https://example.com",
  "fetchTime": "2024-01-01T12:00:00.000Z",
  "categoryScores": {
    "performance": 95,
    "seo": 98
  },
  "performanceMetrics": {
    "firstContentfulPaint": {
      "score": 0.95,
      "numericValue": 1205.6,
      "displayValue": "1.2 s"
    },
    "largestContentfulPaint": {
      "score": 0.94,
      "numericValue": 1856.3,
      "displayValue": "1.9 s"
    }
  },
  "linkAnalysis": {
    "statistics": {
      "totalLinks": 25,
      "internalLinks": 15,
      "externalLinks": 9,
      "brokenLinks": 1
    },
    "linkDetails": {
      "internal": [
        {
          "url": "https://example.com/about",
          "text": "会社概要",
          "rel": "",
          "target": "",
          "isValid": true
        }
      ],
      "external": [
        {
          "url": "https://twitter.com/example",
          "text": "Twitter",
          "rel": "nofollow",
          "target": "_blank",
          "isValid": true
        }
      ]
    }
  }
}
```

## 主要な分析項目

### パフォーマンスメトリクス
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Speed Index
- Time to Interactive (TTI)

### SEO分析
- メタディスクリプション
- HTTPステータスコード
- クロール可能性
- robots.txt
- canonical設定
- hreflang設定
- フォントサイズ
- リンクテキスト

### リンク分析
- 内部リンク数
- 外部リンク数
- 破損リンク数
- リンクの詳細情報（URL、テキスト、rel属性、target属性）

## 使用例

### cURL
```bash
curl -X POST \
  https://your-api-endpoint/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "options": {
      "formFactor": "desktop",
      "onlyCategories": ["performance", "seo"]
    }
  }'
```

### JavaScript (Node.js)
```javascript
const axios = require('axios');

async function analyzeSite() {
  try {
    const response = await axios.post('https://your-api-endpoint/analyze', {
      url: 'https://example.com',
      options: {
        formFactor: 'desktop',
        onlyCategories: ['performance', 'seo']
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('分析エラー:', error);
  }
}
```

### Python
```python
import requests

def analyze_site():
    try:
        response = requests.post(
            'https://your-api-endpoint/analyze',
            json={
                'url': 'https://example.com',
                'options': {
                    'formFactor': 'desktop',
                    'onlyCategories': ['performance', 'seo']
                }
            }
        )
        return response.json()
    except Exception as e:
        print(f'分析エラー: {e}')
```

## エラーレスポンス

エラーが発生した場合、以下の形式でレスポンスが返されます：

```json
{
  "error": "エラーメッセージ",
  "stack": "スタックトレース（開発環境のみ）"
}
```

## 制限事項

1. リクエスト制限
   - 同時実行数: 5リクエスト/分
   - 最大実行時間: 30秒/リクエスト

2. URL制限
   - HTTPSプロトコルのみサポート
   - Basic認証が必要なサイトは非対応
   - IPアドレスによる直接アクセスは非対応

3. レスポンスサイズ
   - 最大レスポンスサイズ: 10MB

## 拡張機能

### カスタムメトリクス
特定のHTML要素やJavaScriptメトリクスを追加で取得する場合：

```json
{
  "url": "https://example.com",
  "options": {
    "customMetrics": [
      {
        "name": "main-heading",
        "selector": "h1",
        "type": "element"
      },
      {
        "name": "custom-timing",
        "expression": "window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart",
        "type": "timing"
      }
    ]
  }
}
```

### バッチ分析
複数URLを一括で分析する場合：

```json
{
  "urls": [
    "https://example.com",
    "https://example.com/about",
    "https://example.com/contact"
  ],
  "options": {
    "formFactor": "desktop",
    "onlyCategories": ["performance", "seo"]
  }
}
```

### 定期的な監視
特定のURLを定期的に監視する場合：

```json
{
  "url": "https://example.com",
  "monitoring": {
    "interval": "1h",
    "duration": "7d",
    "alertThresholds": {
      "performance": 90,
      "seo": 95
    }
  }
}
```

## サポート

問題や質問がある場合は、GitHubのIssuesでお問い合わせください。 