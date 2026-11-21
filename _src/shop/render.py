# -*- coding: utf-8 -*-
"""한국휴머나이징 아임웹 상품 이미지 만들기(성균관컨설팅 skkc.co.kr 상품용)
python3 _src/shop/render.py
  -> _src/shop/out/hg-<id>-1x1.jpg (1200x1200), hg-tokens-guide.png (1080x1350)
  -> docs/assets/product/ 에도 복사(사이트 Product 구조화 데이터 · 아임웹 상세 그림에서 씀)
정가 표시 없이(대표 2026.11.21 밤: AIMarker 처럼 간단 · 깔끔하게). 전후 AI 작성률은 _src/demo.json(한국휴머나이징 엔진 실측값) 논문 예시 그대로"""
import asyncio, json, os, shutil
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(HERE)
ROOT = os.path.dirname(SRC)
OUT = os.path.join(HERE, "out")
PROD = os.path.join(ROOT, "docs", "assets", "product")
os.makedirs(OUT, exist_ok=True)
os.makedirs(PROD, exist_ok=True)
FONT = "file://" + os.path.join(HERE, "pretendard.css")
LOGO = "file://" + os.path.join(SRC, "brand", "logo-full.png")
KMARK = "file://" + os.path.join(SRC, "brand", "logo-k.png")

DEMO = json.load(open(os.path.join(SRC, "demo.json"), encoding="utf-8"))
T = DEMO["samples"][0]
B_RATE, A_RATE, T_LABEL = T["before"]["rate"], T["after"]["rate"], T["label"]

PACKS = [
    {"id": "lt", "name": "라이트", "tok": "100", "price": "9,900원", "per": "토큰당 99원", "save": "", "badge": "", "fit": "자기소개서 · 짧은 과제", "pg": "레포트 약 10페이지"},
    {"id": "pl", "name": "플러스", "tok": "350", "price": "19,900원", "per": "토큰당 약 57원", "save": "", "badge": "", "fit": "레포트 · 과제 여러 편", "pg": "레포트 약 35페이지"},
    {"id": "pr", "name": "프로", "tok": "1,000", "price": "39,900원", "per": "토큰당 약 40원", "save": "플러스보다 토큰당 약 30% 절약", "badge": "BEST 추천", "fit": "논문 · 학위논문", "pg": "논문 약 100페이지"},
    {"id": "mx", "name": "맥스", "tok": "2,000", "price": "69,900원", "per": "토큰당 약 35원", "save": "플러스보다 토큰당 약 39% 절약", "badge": "최고 혜택", "fit": "논문 전체 · 여러 편", "pg": "논문 약 250페이지"},
]

CHECK = ('<svg viewBox="0 0 24 24" width="30" height="30" fill="none"><circle cx="12" cy="12" r="11" fill="#ebf2ff"/>'
         '<path d="m7.5 12.3 3 3 6-6.3" stroke="#1463e3" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>')

BASE = ("<!doctype html><html><head><meta charset='utf-8'><link rel='stylesheet' href='%s'><style>"
        "*{box-sizing:border-box;margin:0;padding:0}html,body{font-family:'Pretendard Variable',Pretendard,sans-serif;-webkit-font-smoothing:antialiased;letter-spacing:-.02em;color:#0c1730;word-break:keep-all}"
        "%%s</style></head><body>%%s</body></html>") % FONT

THUMB_CSS = """
body{width:1200px;height:1200px;position:relative;overflow:hidden;background:linear-gradient(180deg,#ffffff 0%,#f2f5fb 100%)}
.lg{position:absolute;left:92px;top:76px;height:92px}
.card{position:absolute;left:92px;top:212px;width:1016px;height:600px;border-radius:46px;overflow:hidden;color:#fff;
 background:radial-gradient(560px 380px at 100% 0%,rgba(28,111,209,.75),transparent 70%),radial-gradient(520px 360px at 0% 108%,rgba(227,38,45,.42),transparent 64%),linear-gradient(150deg,#00245a 0%,#001a44 58%,#00122f 100%);
 box-shadow:0 40px 70px -30px rgba(0,36,90,.6)}
.card:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:56px 56px}
.km{position:absolute;right:-40px;bottom:-56px;height:420px;opacity:.13;filter:grayscale(1) brightness(3)}
.hdr{position:absolute;left:58px;top:54px;display:flex;align-items:center;gap:14px;font-size:30px;font-weight:700;color:#cfe0ff;z-index:2}
.badge{position:absolute;right:56px;top:46px;height:56px;padding:0 26px;border-radius:28px;display:flex;align-items:center;font-size:27px;font-weight:850;z-index:2}
.badge.best{background:linear-gradient(180deg,#fcd34d,#fbbf24);color:#1a1205}
.badge.top{background:#fff;color:#00245a}
.pills{position:absolute;left:56px;top:128px;display:flex;gap:14px;z-index:2}
.pill{height:58px;padding:0 26px;border-radius:29px;display:flex;align-items:center;font-size:29px;font-weight:850}
.pill.n{background:#1463e3;color:#fff;box-shadow:0 10px 22px -10px rgba(20,99,227,.9)}
.pill.o{border:2px solid rgba(255,255,255,.36);color:#fff;font-weight:700}
.big{position:absolute;left:48px;top:206px;display:flex;align-items:flex-end;z-index:2}
.big b{font-size:@BIG@px;font-weight:880;letter-spacing:-.06em;line-height:.8;text-shadow:0 18px 40px rgba(0,0,0,.35)}
.big span{font-size:60px;font-weight:850;margin:0 0 6px 16px}
.fit{position:absolute;left:58px;bottom:124px;font-size:27px;font-weight:650;color:rgba(255,255,255,.86);z-index:2}
.save{position:absolute;left:56px;bottom:50px;height:54px;padding:0 20px;border-radius:12px;border:2px solid rgba(252,211,77,.75);background:rgba(252,211,77,.1);color:#fcd34d;font-size:25px;font-weight:800;display:flex;align-items:center;z-index:2}
.note{position:absolute;left:58px;bottom:58px;font-size:25px;font-weight:650;color:#9ec2ff;z-index:2}
.price{position:absolute;right:56px;bottom:44px;text-align:right;z-index:2}
.price b{display:block;font-size:78px;font-weight:880;letter-spacing:-.04em;line-height:1}
.price small{display:block;font-size:25px;font-weight:650;color:rgba(255,255,255,.75);margin-top:10px}
.feat{position:absolute;left:92px;right:92px;top:852px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.feat div{display:flex;align-items:center;gap:12px;height:96px;padding:0 22px;border-radius:22px;background:#fff;border:1.5px solid #e1e6ef;font-size:27px;font-weight:750;color:#0c1730}
.proof{position:absolute;left:92px;right:92px;bottom:76px;height:120px;border-radius:24px;background:#fff;border:1.5px solid #e1e6ef;display:flex;align-items:center;gap:26px;padding:0 34px}
.proof .k{font-size:24px;font-weight:800;color:#69738a;letter-spacing:-.01em}
.proof .v{display:flex;align-items:baseline;gap:14px;font-weight:880;letter-spacing:-.04em}
.proof .v s{font-size:50px;color:#e5154f;text-decoration-thickness:4px}
.proof .v i{font-style:normal;font-size:38px;color:#98a2b3}
.proof .v b{font-size:62px;color:#0b8f63}
.proof .t{margin-left:auto;text-align:right;font-size:23px;font-weight:650;color:#38435b;line-height:1.45}
"""


def thumb_html(p):
    badge = ('<div class="badge best">%s</div>' % p["badge"]) if p["badge"] == "BEST 추천" else (('<div class="badge top">%s</div>' % p["badge"]) if p["badge"] else "")
    low = ('<div class="save">%s</div>' % p["save"]) if p["save"] else '<div class="note">AI 작성률 검사 · AI 휴머나이징 서비스</div>'
    big = 250 if len(p["tok"]) <= 3 else 205
    css = THUMB_CSS.replace("@BIG@", str(big))
    body = ('<img class="lg" src="%s" alt="">'
            '<div class="card"><img class="km" src="%s" alt=""><div class="hdr">AI 작성률 낮추기 · AI 휴머나이징</div>%s'
            '<div class="pills"><span class="pill n">%s</span><span class="pill o">토큰 충전</span></div>'
            '<div class="big"><b>%s</b><span>토큰</span></div><div class="fit">%s · %s</div>%s'
            '<div class="price"><b>%s</b><small>%s · 부가세 포함</small></div></div>'
            '<div class="feat"><div>%s월 구독 없음</div><div>%s남은 토큰 5년</div><div>%s메일로 바로 코드</div></div>'
            '<div class="proof"><span class="k">실측 예시</span><span class="v"><s>%d%%</s><i>→</i><b>%d%%</b></span><span class="t">%s · 한 번의 휴머나이징<br>실제 엔진으로 잰 값 · 글마다 다릅니다</span></div>') % (
        LOGO, KMARK, badge, p["name"], p["tok"], p["fit"], p["pg"], low, p["price"], p["per"], CHECK, CHECK, CHECK, B_RATE, A_RATE, T_LABEL)
    return BASE % (css, body)


GUIDE_CSS = """
body{width:1080px;height:1350px;position:relative;overflow:hidden;background:linear-gradient(180deg,#ffffff,#f2f5fb)}
.lg{position:absolute;left:72px;top:64px;height:74px}
h1{position:absolute;left:72px;top:176px;font-size:56px;line-height:1.22;font-weight:850;letter-spacing:-.045em;color:#00245a}
h1 em{font-style:normal;color:#1463e3}
.sub{position:absolute;left:74px;top:328px;font-size:26px;color:#38435b;font-weight:550;line-height:1.6}
.steps{position:absolute;left:72px;right:72px;top:410px;display:grid;gap:14px}
.st{display:flex;gap:22px;align-items:flex-start;padding:22px 26px;border-radius:24px;background:#fff;border:1.5px solid #e1e6ef}
.st i{flex:none;width:58px;height:58px;border-radius:50%;background:#00245a;color:#fff;font-style:normal;font-weight:850;font-size:28px;display:grid;place-items:center}
.st b{display:block;font-size:31px;font-weight:850;letter-spacing:-.03em;color:#0c1730}
.st p{margin-top:4px;font-size:22.5px;line-height:1.5;color:#38435b}
.cost{position:absolute;left:72px;right:72px;bottom:56px;padding:30px 34px;border-radius:26px;color:#fff;background:radial-gradient(420px 260px at 100% 0%,rgba(28,111,209,.7),transparent 70%),linear-gradient(150deg,#00245a,#00122f)}
.cost h2{font-size:30px;font-weight:850;letter-spacing:-.03em}
.cost ul{list-style:none;margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px 26px;font-size:24px;color:#dbe6fb}
.cost b{color:#fff}
"""


def guide_html():
    steps = [("결제", "토큰을 고르고 성균관컨설팅 결제 페이지에서 결제합니다. 회원가입 없이 카드 · 간편결제로 끝납니다."),
             ("메일로 코드", "결제가 확인되면 보통 1분 안에 주문서의 이메일로 16자리 토큰 코드가 갑니다. 보내는 이름은 '한국휴머나이징'입니다."),
             ("바로 이어서", "메일의 '바로 이어서 하기'를 누르면 코드가 들어간 채로 humanizing.ai.kr 이 열리고, 하던 글을 그대로 이어 갑니다."),
             ("쓴 만큼만", "글을 넣고 검사 · 휴머나이징을 누르면 글자 수만큼만 빠집니다. 남은 토큰은 5년 동안 그대로입니다.")]
    s = "".join('<div class="st"><i>%d</i><div><b>%s</b><p>%s</p></div></div>' % (i + 1, a, b) for i, (a, b) in enumerate(steps))
    body = ('<img class="lg" src="%s" alt=""><h1>결제하고 <em>1분</em>,<br>메일로 받은 코드로 바로</h1><p class="sub">AI 작성률 검사 · AI 휴머나이징 서비스에 쓰는 토큰 이용 안내</p><div class="steps">%s</div>'
            '<div class="cost"><h2>토큰은 이렇게 빠집니다</h2><ul><li>검사 요약 <b>무료</b></li><li>전체 결과 <b>1,000자 4토큰</b></li><li>휴머나이징 <b>1,000자 8토큰</b></li><li>1토큰 <b>100원</b> · 구독 없음</li></ul></div>') % (LOGO, s)
    return BASE % (GUIDE_CSS, body)


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--allow-file-access-from-files"])
        for p in PACKS:
            path = os.path.join(HERE, "_t_%s.html" % p["id"])
            open(path, "w", encoding="utf-8").write(thumb_html(p))
            pg = await b.new_page(viewport={"width": 1200, "height": 1200})
            await pg.goto("file://" + path); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(250)
            fp = os.path.join(OUT, "hg-%s-1x1.jpg" % p["id"])
            await pg.screenshot(path=fp, type="jpeg", quality=90)
            shutil.copy(fp, os.path.join(PROD, os.path.basename(fp)))
            await pg.close(); os.remove(path)
        path = os.path.join(HERE, "_t_guide.html")
        open(path, "w", encoding="utf-8").write(guide_html())
        pg = await b.new_page(viewport={"width": 1080, "height": 1350})
        await pg.goto("file://" + path); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(250)
        fp = os.path.join(OUT, "hg-tokens-guide.png")
        await pg.screenshot(path=fp)
        shutil.copy(fp, os.path.join(PROD, os.path.basename(fp)))
        await pg.close(); os.remove(path)
        await b.close()
    print("ok", sorted(os.listdir(OUT)))

asyncio.run(main())
