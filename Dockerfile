FROM node:18-slim

# Chrome依存関係のインストール
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# アプリケーションファイルをコピー
COPY . .

# 環境変数の設定
ENV CHROME_PATH=/usr/bin/chromium
ENV PORT=7860

# ポートの公開
EXPOSE 7860

# アプリケーションの起動
CMD ["node", "index.js"] 