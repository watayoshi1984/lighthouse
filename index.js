// index.js
const express = require('express');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

// Chromeパスの設定を追加
const chromePath = process.env.CHROME_PATH || null;

const app = express();
app.use(express.json());

app.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Chromeの起動設定
    const chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage'
      ],
      chromePath: chromePath  // Chromeパスを設定
    });

    // Lighthouse設定
    const options = {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance', 'seo'],
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      }
    };

    const results = await lighthouse(url, options);
    await chrome.kill();

    // 必要な情報を抽出
    const lhr = JSON.parse(results.report);
    
    const response = {
      url: lhr.finalDisplayedUrl,
      fetchTime: lhr.fetchTime,
      
      // メインカテゴリースコア
      categoryScores: {
        performance: lhr.categories.performance.score * 100,
        seo: lhr.categories.seo.score * 100
      },

      // パフォーマンスメトリクス
      performanceMetrics: {
        firstContentfulPaint: lhr.audits['first-contentful-paint'],
        largestContentfulPaint: lhr.audits['largest-contentful-paint'],
        totalBlockingTime: lhr.audits['total-blocking-time'],
        cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'],
        speedIndex: lhr.audits['speed-index'],
        timeToInteractive: lhr.audits['interactive']
      },

      // パフォーマンス最適化
      performanceOptimizations: {
        renderBlockingResources: lhr.audits['render-blocking-resources'],
        unminifiedJavascript: lhr.audits['unminified-javascript'],
        unminifiedCSS: lhr.audits['unminified-css'],
        unusedCSS: lhr.audits['unused-css-rules'],
        unusedJavaScript: lhr.audits['unused-javascript'],
        imageOptimization: lhr.audits['uses-optimized-images'],
        responsiveImages: lhr.audits['uses-responsive-images'],
        efficientCache: lhr.audits['uses-long-cache-ttl'],
        modernImageFormats: lhr.audits['modern-image-formats']
      },

      // SEO分析
      seoAudit: {
        metaDescription: lhr.audits['meta-description'],
        httpStatusCode: lhr.audits['http-status-code'],
        crawlable: lhr.audits['is-crawlable'],
        robotsTxt: lhr.audits['robots-txt'],
        canonical: lhr.audits['canonical'],
        hreflang: lhr.audits['hreflang'],
        fontSize: lhr.audits['font-size'],
        linkText: lhr.audits['link-text'],
        crawlableAnchors: lhr.audits['crawlable-anchors'],
        mobileViewport: lhr.audits['viewport']
      },

      // リンク分析を追加
      linkAnalysis: {
        // 内部/外部リンクの情報
        links: lhr.audits['links'],
        
        // リンクの詳細情報
        linkDetails: {
          internal: [],
          external: [],
          broken: []
        }
      }
    };

    // リンクの詳細情報を収集
    const baseUrl = new URL(lhr.finalDisplayedUrl).origin;
    const links = lhr.audits['links'].details?.items || [];

    links.forEach(link => {
      const linkUrl = link.href;
      try {
        const url = new URL(linkUrl);
        const linkInfo = {
          url: linkUrl,
          text: link.text,
          rel: link.rel || '',
          target: link.target || '',
          isValid: true
        };

        if (url.origin === baseUrl) {
          response.linkAnalysis.linkDetails.internal.push(linkInfo);
        } else {
          response.linkAnalysis.linkDetails.external.push(linkInfo);
        }
      } catch (e) {
        // 無効なURLの場合
        response.linkAnalysis.linkDetails.broken.push({
          url: linkUrl,
          text: link.text,
          error: e.message
        });
      }
    });

    // リンクの統計情報を追加
    response.linkAnalysis.statistics = {
      totalLinks: links.length,
      internalLinks: response.linkAnalysis.linkDetails.internal.length,
      externalLinks: response.linkAnalysis.linkDetails.external.length,
      brokenLinks: response.linkAnalysis.linkDetails.broken.length
    };

    res.json(response);
  } catch (error) {
    console.error('Lighthouse分析エラー:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));