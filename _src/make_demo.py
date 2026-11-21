# -*- coding: utf-8 -*-
"""엔진 실측(HG서버.gs hgDemoAll 의 HGB 줄, 한국휴머나이징 배포)을 예시 화면 데이터(demo.json)로. python3 _src/make_demo.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
META = {"t3": ("논문", "석사논문_결론.hwp"), "report": ("대학 레포트", "배달용기_레포트.docx"), "resume": ("자기소개서", "자기소개서_성장과정.docx"), "g2": ("블로그 글", "블로그_봄나들이.txt")}
ORDER = ["t3", "report", "resume", "g2"]
raw = json.load(open(os.path.join(HERE, "demo_raw", "hgb_20261121.json"), encoding="utf-8"))
out = []
for k in ORDER:
    o = raw[k]
    out.append({"k": k, "label": META[k][0], "file": META[k][1], "src": o["src"], "dst": o["dst"],
                "ai": [i for i, s in enumerate(o["sc"]) if s[1]], "scores": {str(i): s[0] for i, s in enumerate(o["sc"]) if s[1]},
                "after_scores": {str(i): s[0] for i, s in enumerate(o.get("afterSc", []))},
                "before": {"rate": o["before"]["rate"], "band": o["before"]["band"], "n": o["before"]["n"]},
                "after": {"rate": o["after"]["rate"], "band": o["after"]["band"], "n": o["after"]["n"]}, "applied": o.get("ch", 0)})
json.dump({"samples": out, "measured": "2026.11.21 한국휴머나이징 엔진 실측값(AIMarker 엔진 그대로 · 판정 기준 1.6 · 인간화 엔진 HUM 2.5, 한 번의 휴머나이징). 글마다 결과는 다릅니다."},
          open(os.path.join(HERE, "demo.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("samples", [(s["k"], s["before"]["rate"], s["after"]["rate"]) for s in out])
