# 한국휴머나이저 아임웹 상품 이미지 만들기 (성균관컨설팅 skkc.co.kr 상품용)
# python3 render.py  ->  out/hz-<id>-1x1.jpg (1200x1200), out/hz-tokens-guide.png (1080x1350)
import os, asyncio
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)

PACKS = [
    {"id": "lt", "name": "라이트", "tok": "100", "price": "9,900원", "list": "19,800원", "per": "토큰당 99원", "save": "", "badge": ""},
    {"id": "pl", "name": "플러스", "tok": "300", "price": "19,900원", "list": "39,800원", "per": "토큰당 약 66원", "save": "", "badge": ""},
    {"id": "pr", "name": "프로", "tok": "750", "price": "39,900원", "list": "79,800원", "per": "토큰당 약 53원", "save": "플러스 대비 토큰당 약 20% 절약", "badge": "BEST 추천"},
    {"id": "mx", "name": "맥스", "tok": "1,500", "price": "69,900원", "list": "139,800원", "per": "토큰당 약 47원", "save": "플러스 대비 토큰당 약 30% 절약", "badge": "최고 혜택"},
]

LOGO = ('<svg viewBox="0 0 40 40" width="%d" height="%d"><defs><linearGradient id="lg%s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1730"/><stop offset="1" stop-color="#13254a"/></linearGradient></defs>'
        '<rect width="40" height="40" rx="11" fill="url(#lg%s)"/><path d="M12 11v18M28 11v18M12 20h16" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>'
        '<circle cx="31.5" cy="31.5" r="5.5" fill="#10b981" stroke="#0b1730" stroke-width="2"/><path d="m29.2 31.6 1.6 1.6 3-3.2" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')
GLYPH = ('<svg viewBox="0 0 24 24" width="34" height="34"><rect x="1.5" y="1.5" width="21" height="21" rx="6.5" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.8"/>'
         '<path d="M8 7v10M16 7v10M8 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>')

BASE_CSS = """
@import url('pretendard.css');
*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'Pretendard Variable',Pretendard,sans-serif;-webkit-font-smoothing:antialiased;letter-spacing:-.02em;color:#0b1730}
"""

def thumb_html(p):
    lg = LOGO % (64, 64, "a", "a")
    badge = ""
    if p["badge"] == "BEST 추천":
        badge = '<div class="badge best">BEST 추천</div>'
    elif p["badge"]:
        badge = '<div class="badge top">%s</div>' % p["badge"]
    save = ('<div class="save">%s</div>' % p["save"]) if p["save"] else '<div class="note">AI 작성률 검사 · 휴머나이징</div>'
    small = len(p["tok"]) > 3
    return """<!doctype html><html><head><meta charset="utf-8"><style>%s
body{width:1200px;height:1200px;background:#fff;position:relative;overflow:hidden}
.brand{position:absolute;left:96px;top:84px;display:flex;align-items:center;gap:18px}
.brand b{font-size:44px;font-weight:800;letter-spacing:-.035em;color:#0b1730}
.brand small{display:block;font-size:15px;font-weight:700;letter-spacing:.24em;color:#64748b;margin-top:2px}
.card{position:absolute;left:96px;top:206px;width:1008px;height:560px;border-radius:44px;overflow:hidden;
 background:radial-gradient(120%% 140%% at 100%% 100%%,#10b981 0%%,rgba(16,185,129,.0) 46%%),linear-gradient(135deg,#0a1530 0%%,#0d2346 52%%,#0b4b55 100%%);
 box-shadow:0 34px 60px -24px rgba(11,23,48,.55)}
.card:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 56px),repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 56px);pointer-events:none}
.hd{position:absolute;left:54px;top:52px;display:flex;align-items:center;gap:14px;color:#fff;font-size:30px;font-weight:700}
.badge{position:absolute;right:52px;top:46px;height:52px;padding:0 24px;border-radius:26px;display:flex;align-items:center;font-size:26px;font-weight:800;z-index:2}
.badge.best{background:#fbbf24;color:#1a1a1a}
.badge.top{background:#fff;color:#0b1730}
.pills{position:absolute;left:52px;top:126px;display:flex;gap:14px;z-index:2}
.pill{height:54px;padding:0 24px;border-radius:27px;display:flex;align-items:center;font-size:27px;font-weight:800}
.pill.n{background:#10b981;color:#fff}
.pill.o{border:2px solid rgba(255,255,255,.32);color:#fff;font-weight:700}
.big{position:absolute;left:46px;top:196px;display:flex;align-items:flex-end;color:#fff;z-index:2}
.big b{font-size:%dpx;font-weight:850;letter-spacing:-.06em;line-height:1}
.big span{font-size:62px;font-weight:800;margin:0 0 22px 16px}
.save{position:absolute;left:52px;bottom:50px;height:52px;padding:0 20px;border-radius:12px;border:2px solid rgba(251,191,36,.75);background:rgba(251,191,36,.08);color:#fcd34d;font-size:24px;font-weight:800;display:flex;align-items:center;z-index:2}
.note{position:absolute;left:54px;bottom:60px;color:rgba(255,255,255,.82);font-size:24px;font-weight:600;z-index:2}
.price{position:absolute;right:52px;bottom:40px;text-align:right;color:#fff;z-index:2}
.price del{display:block;font-size:28px;font-weight:600;color:rgba(255,255,255,.55);text-decoration-thickness:2px;margin-bottom:2px}
.price .row{display:flex;align-items:baseline;gap:14px;justify-content:flex-end}
.price .off{font-size:44px;font-weight:850;color:#ff5c8a}
.price b{font-size:62px;font-weight:850;letter-spacing:-.04em}
.meter{position:absolute;right:52px;top:136px;width:300px;padding:22px 24px 20px;border-radius:24px;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.18);color:#fff;z-index:2}
.meter .t{font-size:19px;font-weight:700;color:rgba(255,255,255,.75)}
.meter .v{display:flex;align-items:baseline;gap:10px;margin:6px 0 14px}
.meter .v s{font-size:40px;font-weight:850;color:#c4b5fd;text-decoration-thickness:3px}
.meter .v i{font-style:normal;font-size:26px;color:rgba(255,255,255,.6)}
.meter .v b{font-size:52px;font-weight:850;color:#34d399}
.bar{height:10px;border-radius:5px;background:rgba(255,255,255,.12);margin:7px 0;position:relative;overflow:hidden}
.bar i{position:absolute;left:0;top:0;bottom:0;border-radius:5px}
.bar.a i{width:92%%;background:linear-gradient(90deg,#7c50f0,#a78bfa)}
.bar.b i{width:7%%;background:#34d399}
.meter .c{font-size:15px;color:rgba(255,255,255,.55);margin-top:10px;font-weight:600}
.ttl{position:absolute;left:96px;top:818px;font-size:46px;font-weight:800;line-height:1.32;letter-spacing:-.035em;color:#0b1730}
.sub{position:absolute;left:96px;top:962px;font-size:27px;line-height:1.68;color:#64748b;font-weight:500}
.dom{position:absolute;left:96px;top:1078px;font-size:30px;font-weight:800;color:#0e9f6e}
</style></head><body>
<div class="brand">%s<div><b>한국휴머나이저</b><small>KOREA HUMANIZER</small></div></div>
<div class="card">
 <div class="hd">%s AI 휴머나이징 토큰</div>%s
 <div class="pills"><div class="pill n">%s</div><div class="pill o">%s</div></div>
 <div class="big"><b>%s</b><span>토큰</span></div>
 <div class="meter"><div class="t">휴머나이징 전 → 후 AI 작성률</div><div class="v"><s>92%%</s><i>→</i><b>7%%</b></div>
  <div class="bar a"><i></i></div><div class="bar b"><i></i></div><div class="c">실측 예시 · 학위논문 결론 1회</div></div>
 %s
 <div class="price"><del>정가 %s</del><div class="row"><span class="off">50%%</span><b>%s</b></div></div>
</div>
<div class="ttl">AI 작성률 낮추기 · AI 휴머나이징<br>(AI 글 인간화) 토큰</div>
<div class="sub">월 구독 없이 한 번 충전 · 쓴 만큼만 빠짐 · 5년 사용<br>검사 1,000자 4토큰 · 휴머나이징 1,000자 8토큰</div>
<div class="dom">humanizer.co.kr</div>
</body></html>""" % (BASE_CSS, 168 if small else 196, lg, GLYPH, badge, p["name"], p["per"], p["tok"], save, p["list"], p["price"])


GUIDE_STEPS = [
    ("메일로 토큰 코드가 갑니다", "결제가 확인되면 보통 5분 안에 주문서의 이메일로 보내 드립니다. 보내는 이름은 '한국휴머나이저'이고, 메일이 안 보이면 스팸함도 확인해 주세요."),
    ("메일의 <em>바로 이어서 하기</em>를 누르면 끝", "코드가 저절로 들어간 채로 열립니다. 다른 기기에서는 위쪽 '토큰 코드'에 코드를 넣으면 됩니다."),
    ("쓴 만큼만 빠집니다", "검사 요약은 0토큰, 전체 결과는 1,000자 4토큰, 휴머나이징은 1,000자 8토큰. 남은 토큰은 위쪽 토큰 단추에서 봅니다."),
    ("남은 토큰은 이어서 씁니다", "충전일부터 5년, 같은 코드에 더 충전할 수 있고 여러 기기에서 같은 코드를 씁니다. 코드를 아는 사람은 누구나 쓸 수 있으니 잘 보관해 주세요."),
]

def guide_html():
    lg = LOGO % (60, 60, "g", "g")
    steps = "".join('<div class="st"><div class="n">%d</div><div><h3>%s</h3><p>%s</p></div></div>' % (i + 1, h, t) for i, (h, t) in enumerate(GUIDE_STEPS))
    return """<!doctype html><html><head><meta charset="utf-8"><style>%s
body{width:1080px;height:1350px;position:relative;overflow:hidden;background:radial-gradient(70%% 50%% at 100%% 0%%,rgba(16,185,129,.16),transparent 70%%),#f6f8fb}
.brand{position:absolute;left:84px;top:80px;display:flex;align-items:center;gap:16px}
.brand b{font-size:40px;font-weight:800;letter-spacing:-.035em}
.brand small{display:block;font-size:14px;font-weight:700;letter-spacing:.24em;color:#64748b;margin-top:2px}
h1{position:absolute;left:84px;top:196px;font-size:84px;font-weight:850;letter-spacing:-.05em}
.lead{position:absolute;left:86px;top:306px;font-size:29px;color:#475569;font-weight:600}
.list{position:absolute;left:84px;top:390px;width:912px;display:flex;flex-direction:column;gap:22px}
.st{display:flex;gap:26px;background:#fff;border:1px solid #e6ebf2;border-radius:26px;padding:30px 32px;box-shadow:0 8px 24px -16px rgba(11,23,48,.25)}
.n{flex:none;width:58px;height:58px;border-radius:50%%;background:#0e9f6e;color:#fff;font-size:28px;font-weight:800;display:flex;align-items:center;justify-content:center}
h3{font-size:34px;font-weight:800;letter-spacing:-.035em;margin:4px 0 10px}
h3 em{font-style:normal;color:#0e9f6e}
p{font-size:23.5px;line-height:1.6;color:#475569;font-weight:500}
.ft{position:absolute;left:84px;right:84px;bottom:56px;border-top:1px solid #e2e8f0;padding-top:24px;display:flex;justify-content:space-between;align-items:flex-end;color:#64748b;font-size:22px;line-height:1.6}
.ft b{color:#0e9f6e;font-size:28px;font-weight:800}
</style></head><body>
<div class="brand">%s<div><b>한국휴머나이저</b><small>KOREA HUMANIZER</small></div></div>
<h1>토큰 이용 안내</h1><div class="lead">월 구독 없이 한 번 충전, 쓴 만큼만 빠집니다</div>
<div class="list">%s</div>
<div class="ft"><div>문의 contact@skkc.co.kr<br>운영 성균관컨설팅</div><b>humanizer.co.kr</b></div>
</body></html>""" % (BASE_CSS, lg, steps)



# ---------- 2026.11.21 밤 대표: 로봇 로고, 'AIMarker 처럼 간단 · 깔끔', 정가 · 50% · 전후 막대(92% → 7%) 상자는 뺌 ----------
ROBOT = "file://" + os.path.join(os.path.dirname(HERE), "brand", "robot_green.png")
LOCKUP = ('<div class="brand"><img src="%s" alt=""><div><b>한국휴머나이저</b><i>%s</i></div></div>'
          % (ROBOT, "".join("<span>%s</span>" % c for c in "HUMANIZER")))
LOCKUP_CSS = """
.brand{position:absolute;left:96px;top:78px;display:flex;align-items:center;gap:18px}
.brand img{height:84px}
.brand b{display:block;font-size:44px;font-weight:800;letter-spacing:-.035em;color:#0b1730;line-height:1}
.brand i{display:flex;justify-content:space-between;margin-top:9px;font-style:normal;font-size:25px;font-weight:800;color:#0b8a5e;line-height:1}
"""


def thumb2_html(p):
    badge = ""
    if p["badge"] == "BEST 추천":
        badge = '<div class="badge best">BEST 추천</div>'
    elif p["badge"]:
        badge = '<div class="badge top">%s</div>' % p["badge"]
    save = ('<div class="save">%s</div>' % p["save"]) if p["save"] else '<div class="note">AI 작성률 검사 · 휴머나이징 서비스</div>'
    small = len(p["tok"]) > 3
    return """<!doctype html><html><head><meta charset="utf-8"><style>%s%s
body{width:1200px;height:1200px;background:#fff;position:relative;overflow:hidden}
.card{position:absolute;left:96px;top:214px;width:1008px;height:560px;border-radius:44px;overflow:hidden;
 background:radial-gradient(120%% 140%% at 100%% 100%%,#10b981 0%%,rgba(16,185,129,0) 46%%),linear-gradient(135deg,#0a1530 0%%,#0d2346 52%%,#0b4b55 100%%);
 box-shadow:0 34px 60px -24px rgba(11,23,48,.55)}
.hd{position:absolute;left:54px;top:50px;display:flex;align-items:center;gap:14px;color:#fff;font-size:30px;font-weight:700}
.badge{position:absolute;right:52px;top:46px;height:52px;padding:0 24px;border-radius:26px;display:flex;align-items:center;font-size:26px;font-weight:800;z-index:2}
.badge.best{background:#fbbf24;color:#1a1a1a}
.badge.top{background:#fff;color:#0b1730}
.pills{position:absolute;left:52px;top:126px;display:flex;gap:14px;z-index:2}
.pill{height:54px;padding:0 24px;border-radius:27px;display:flex;align-items:center;font-size:27px;font-weight:800}
.pill.n{background:#0e9f6e;color:#fff}
.pill.o{border:2px solid rgba(255,255,255,.32);color:#fff;font-weight:700}
.big{position:absolute;left:46px;top:196px;display:flex;align-items:flex-end;color:#fff;z-index:2}
.big b{font-size:%dpx;font-weight:850;letter-spacing:-.06em;line-height:1}
.big span{font-size:62px;font-weight:800;margin:0 0 22px 16px}
.save{position:absolute;left:52px;bottom:50px;height:52px;padding:0 20px;border-radius:12px;border:2px solid rgba(251,191,36,.75);background:rgba(251,191,36,.08);color:#fcd34d;font-size:24px;font-weight:800;display:flex;align-items:center;z-index:2}
.note{position:absolute;left:54px;bottom:62px;color:rgba(255,255,255,.82);font-size:24px;font-weight:600;z-index:2}
.price{position:absolute;right:52px;bottom:44px;color:#fff;z-index:2;font-size:66px;font-weight:850;letter-spacing:-.04em}
.ttl{position:absolute;left:96px;top:826px;font-size:46px;font-weight:800;line-height:1.32;letter-spacing:-.035em;color:#0b1730}
.sub{position:absolute;left:96px;top:970px;font-size:27px;line-height:1.68;color:#64748b;font-weight:500}
.dom{position:absolute;left:96px;top:1086px;font-size:30px;font-weight:800;color:#0e9f6e}
</style></head><body>
%s
<div class="card">
 <div class="hd">AI 휴머나이징 토큰</div>%s
 <div class="pills"><div class="pill n">%s</div><div class="pill o">%s</div></div>
 <div class="big"><b>%s</b><span>토큰</span></div>
 %s
 <div class="price">%s</div>
</div>
<div class="ttl">AI 작성률 낮추기 · AI 휴머나이징<br>(AI 글 인간화) 서비스 토큰</div>
<div class="sub">월 구독 없이 한 번 충전 · 쓴 만큼만 빠짐 · 5년 사용<br>검사 1,000자 4토큰 · 휴머나이징 1,000자 8토큰</div>
<div class="dom">humanizer.co.kr</div>
</body></html>""" % (BASE_CSS, LOCKUP_CSS, 168 if small else 196, LOCKUP, badge, p["name"], p["per"], p["tok"], save, p["price"])


def guide2_html():
    h = guide_html()
    # 로고만 로봇으로(내용은 그대로)
    lg = LOGO % (60, 60, "g", "g")
    old_brand = '<div class="brand">%s<div><b>한국휴머나이저</b><small>KOREA HUMANIZER</small></div></div>' % lg
    new_brand = ('<div class="brand"><img src="%s" alt="" style="height:76px"><div><b>한국휴머나이저</b>'
                 '<small style="display:flex;justify-content:space-between;letter-spacing:0;font-size:21px;font-weight:800;color:#0b8a5e;margin-top:7px">%s</small></div></div>'
                 % (ROBOT, "".join("<span>%s</span>" % c for c in "HUMANIZER")))
    assert old_brand in h
    return h.replace(old_brand, new_brand)


# ---------- 2026.11.21 22:00 대표: 새 로고(K 표지 + 한국휴머나이저 / HUMANIZER)로. 그림 짜임은 그대로 ----------
FULL = "file://" + os.path.join(os.path.dirname(HERE), "brand", "logo-full.png")
LOCKUP = '<div class="brand"><img src="%s" alt="" style="height:92px"></div>' % FULL
LOCKUP_CSS = """
.brand{position:absolute;left:92px;top:76px}
"""


def guide3_html():
    h = guide_html()
    lg = LOGO % (60, 60, "g", "g")
    old_brand = '<div class="brand">%s<div><b>한국휴머나이저</b><small>KOREA HUMANIZER</small></div></div>' % lg
    assert old_brand in h
    return h.replace(old_brand, '<div class="brand"><img src="%s" alt="" style="height:80px"></div>' % FULL)

async def main():
    async with async_playwright() as pw:
        br = await pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--allow-file-access-from-files"])
        pg = await br.new_page(viewport={"width": 1200, "height": 1200}, device_scale_factor=1)
        for p in PACKS:
            f = os.path.join(HERE, "_t_%s.html" % p["id"])
            open(f, "w").write(thumb2_html(p))
            await pg.goto("file://" + f)
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(250)
            await pg.screenshot(path=os.path.join(OUT, "hz-%s-1x1.jpg" % p["id"]), type="jpeg", quality=92)
        await pg.set_viewport_size({"width": 1080, "height": 1350})
        f = os.path.join(HERE, "_t_guide.html")
        open(f, "w").write(guide3_html())
        await pg.goto("file://" + f)
        await pg.evaluate("document.fonts.ready")
        await pg.wait_for_timeout(250)
        await pg.screenshot(path=os.path.join(OUT, "hz-tokens-guide.png"))
        await br.close()

asyncio.run(main())
print("ok", sorted(os.listdir(OUT)))
