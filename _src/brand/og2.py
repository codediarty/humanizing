# -*- coding: utf-8 -*-
"""공유 그림(og.png 1200x630): 새 로고(K 표지, 2026.11.21 22:00) + 첫 화면 문구. python3 _src/brand/og2.py"""
import os, asyncio
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
FONT = "file://" + os.path.join(ROOT, "_src", "shop", "pretendard.css")
FULL = "file://" + os.path.join(HERE, "logo-full.png")
K = "file://" + os.path.join(HERE, "logo-k.png")
HTML = """<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="%s"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;height:630px;overflow:hidden;position:relative;font-family:'Pretendard Variable',Pretendard,sans-serif;-webkit-font-smoothing:antialiased;letter-spacing:-.02em;color:#0a1b44;
 background:radial-gradient(620px 460px at 88%% 46%%,rgba(28,111,209,.12),transparent 70%%),linear-gradient(135deg,#ffffff 0%%,#f2f5fa 100%%)}
.lg{position:absolute;left:76px;top:62px;height:84px}
h1{position:absolute;left:76px;top:196px;font-size:64px;line-height:1.17;font-weight:800;letter-spacing:-.045em}
p{position:absolute;left:78px;top:380px;font-size:25px;line-height:1.55;color:#475569;font-weight:500}
.chips{position:absolute;left:78px;bottom:66px;display:flex;gap:12px}
.chips span{height:46px;padding:0 20px;border-radius:23px;display:flex;align-items:center;font-size:21px;font-weight:700;border:1.5px solid #cbd5e1;color:#334155;background:#fff}
.chips span:first-child{background:#0e9f6e;border-color:#0e9f6e;color:#fff}
.k{position:absolute;right:70px;top:150px;height:330px}
</style></head><body>
<img class="lg" src="%s" alt="">
<h1>AI 작성률은 낮추고,<br>원문의 의미는 그대로.</h1>
<p>킬러에서 검출되는 AI 패턴을 분석해 문장을 바꾸는<br>한국어 전용 휴머나이징 서비스</p>
<div class="chips"><span>무료 AI 작성률 검사</span><span>한글 · 워드 · PDF</span></div>
<img class="k" src="%s" alt="">
</body></html>"""


async def main():
    path = os.path.join(HERE, "_og2.html")
    open(path, "w", encoding="utf-8").write(HTML % (FONT, FULL, K))
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--allow-file-access-from-files"])
        pg = await b.new_page(viewport={"width": 1200, "height": 630})
        await pg.goto("file://" + path); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=os.path.join(ROOT, "docs", "assets", "img", "og.png"))
        await b.close()
    os.remove(path)
    print("ok")

asyncio.run(main())
