/* pages/api/ogp.js */

import ReactDOM from "react-dom/server";
import * as playwright from "playwright-aws-lambda";

const styles = `
  html, body {
    background: #f2f2eb;
    font-weight: bold;
    height: 100%;
  }
  main {
    font-family: monospace;
    font-size: 4em;
    height: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  footer {
    height: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  h1 { margin: auto }
`;

const Content = (props) => (
  <html>
    <body>
      <style>{styles}</style>
      <main>
        {props.title}
      </main>
      <footer>
      ©︎webstock.dev by2001Y
      </footer>
    </body>
  </html>
);

export default async (req, res) => {
  const { ogp } = req.query

  // サイズの設定
  const viewport = { width: 1200, height: 630 };

  // ブラウザインスタンスの生成
  const browser = await playwright.launchChromium();
  const page = await browser.newPage({ viewport });

  // HTMLの生成
  const props = { title: ogp };
  const markup = ReactDOM.renderToStaticMarkup(<Content {...props} />);
  const html = `<!doctype html>${markup}`;

  // HTMLをセットして、ページの読み込み完了を待つ
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  // スクリーンショットを取得する
  const image = await page.screenshot({ type: "png" });
  await browser.close();

  // Vercel Edge Networkのキャッシュを利用するための設定
  res.setHeader("Cache-Control", "s-maxage=31536000, stale-while-revalidate");

  // Content Type を設定
  res.setHeader("Content-Type", "image/png");

  // レスポンスを返す
  res.end(image);
};