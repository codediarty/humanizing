# -*- coding: utf-8 -*-
"""한국휴머나이징 로고(대표가 준 K 표지 + 한국 휴머나이징 / KOREAN HUMANIZING, 2026.11.21 22:25)로 사이트 그림 만들기
2026.11.22 부터 글자는 붙여서 '한국휴머나이징'(아래 _attach)
logo-source.png(흰 바탕) -> 흰색을 투명으로 바꿔
  docs/assets/img/logo-k.png      K 표지만(머리글 · 바닥글, 높이 138px)
  docs/assets/img/logo-full.png   로고 전체(공유 그림 · 상품 그림용, 투명)
  favicon.ico · favicon.svg · apple-touch-icon.png · logo-192/512.png  K 표지를 흰 바탕 정사각에
python3 _src/brand/make_brand.py"""
import os, io, base64
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
IMG = os.path.join(ROOT, "docs", "assets", "img")
os.makedirs(IMG, exist_ok=True)
src = Image.open(os.path.join(HERE, "logo-source.png")).convert("RGB")

# 2026.11.22 대표: '한국휴머나이징은 붙이는 게 낫지, 한국 휴머나이징보다' -> 대표가 준 그림(logo-source.png)은 그대로 두고,
# '국'과 '휴' 사이 띄어쓰기(40px)를 다른 글자 사이(약 12px)만큼으로 줄인 판을 만들어 씀(logo-source-attached.png).
# 아래 영문 줄 ─ KOREAN HUMANIZING ─ 도 한글 끝에 맞게: 왼쪽 · 오른쪽 줄표를 14px씩 줄여 글자는 14px, 오른쪽 끝은 28px 당김.
def _attach(im):
    a = np.asarray(im).copy()
    W = a.shape[1]
    def cut(y0, y1, c0, k):
        band = a[y0:y1]
        band[:, c0:W - k] = band[:, c0 + k:W].copy()
        band[:, W - k:] = 255
    cut(232, 436, 1080, 28)     # 한글 줄: 띄어쓰기 칸(1077~1116)에서 28px
    cut(440, 510, 790, 14)      # 영문 줄: 왼쪽 줄표 안에서 14px
    cut(440, 510, 1880, 14)     # 영문 줄: 오른쪽 줄표 안에서 14px
    return Image.fromarray(a, "RGB")


src = _attach(src)
src.save(os.path.join(HERE, "logo-source-attached.png"), optimize=True)


def white_to_alpha(im):
    """흰 바탕을 투명으로(색은 흰 바탕 위에서와 똑같이 보이게 되돌림)"""
    a = np.asarray(im).astype(np.float32) / 255.0
    alpha = np.max(1.0 - a, axis=-1)
    alpha = np.clip((alpha - 0.03) / 0.97, 0, 1)           # 바탕의 아주 옅은 얼룩은 0으로
    safe = np.maximum(alpha, 1e-4)[..., None]
    rgb = np.clip(1.0 - (1.0 - a) / safe, 0, 1)
    out = np.concatenate([rgb, alpha[..., None]], -1)
    return Image.fromarray((out * 255).round().astype(np.uint8), "RGBA")


def tight(im, th=12):
    return im.crop(im.getchannel("A").point(lambda v: 255 if v > th else 0).getbbox())


full = tight(white_to_alpha(src.crop((120, 200, 2010, 560))))
full.save(os.path.join(HERE, "logo-full.png"), optimize=True)
w = 1200
full.resize((w, round(full.height * w / full.width)), Image.LANCZOS).save(os.path.join(IMG, "logo-full.png"), optimize=True)

k = tight(white_to_alpha(src.crop((125, 205, 645, 555))))          # 세로 줄(x 660 부근) 앞에서 자름
k.save(os.path.join(HERE, "logo-k.png"), optimize=True)
k.resize((round(k.width * 138 / k.height), 138), Image.LANCZOS).save(os.path.join(IMG, "logo-k.png"), optimize=True)

# 흰 글씨 판(어두운 바탕용): K 표지는 그대로, 글자 로고는 따로 HTML 로 씀
def square(size, pad, bg=(255, 255, 255, 255)):
    inner = round(size * (1 - 2 * pad))
    r = k.copy(); r.thumbnail((inner, inner), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), bg)
    out.alpha_composite(r, ((size - r.width) // 2, (size - r.height) // 2))
    return out


square(192, .1).convert("RGB").save(os.path.join(IMG, "logo-192.png"), optimize=True)
square(512, .1).convert("RGB").save(os.path.join(IMG, "logo-512.png"), optimize=True)
square(180, .1).convert("RGB").save(os.path.join(IMG, "apple-touch-icon.png"), optimize=True)
square(256, .03, (0, 0, 0, 0)).save(os.path.join(ROOT, "docs", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
b = io.BytesIO(); square(96, .03, (0, 0, 0, 0)).save(b, "PNG", optimize=True)
open(os.path.join(IMG, "favicon.svg"), "w").write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><image width="96" height="96" href="data:image/png;base64,%s"/></svg>' % base64.b64encode(b.getvalue()).decode())
print("ok full", full.size, "k", k.size)
