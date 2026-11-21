# 한국휴머나이징 (humanizing.ai.kr)

한국어 AI 휴머나이징 사이트입니다. AI 작성률을 무료로 검사하고, AI 탐지기에 걸리는 문장만 사람 문장으로 바꿉니다.

- `docs/` : GitHub Pages로 배포되는 사이트(정적 파일, 사용자 도메인 humanizing.ai.kr)
- `_src/build.py` · `_src/pages.py` · `_src/landings.py` · `_src/guides.py` : 사이트 생성기(`python3 _src/build.py` 를 실행하면 `docs/` 를 다시 만듭니다)
- `_src/brand/make_brand.py` : 대표가 준 로고(K 표지 + 한국 휴머나이징 / KOREAN HUMANIZING)로 로고 · 파비콘 만들기
- `_src/make_demo.py` : 엔진 실측값(HG서버.gs hgDemoAll)을 첫 화면 예시 데이터로
- 엔진: AIMarker 서버(Apps Script)의 AIMarker 엔진 그대로, 한국휴머나이징 배포(버전 36, HG서버.gs 층). 교차검증 AIMarker ↔ 한국휴머나이징 8/8 일치

운영 성균관컨설팅 · contact@skkc.co.kr
