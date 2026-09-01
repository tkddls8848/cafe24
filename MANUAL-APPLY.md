# 카페24 수동 적용 안내

백업 복구가 실패할 때 사용하는 파일 업로드 방식입니다.

## 적용 파일 위치

로컬 폴더: `C:\Users\tkddl\orca\projects\cafe24\manual-apply\skin5`

서버 대상 폴더: `/sde_design/skin5`

## 적용 순서

카페24 관리자에서 `디자인 → 파일 업로더`를 열고 아래 순서로 업로드합니다.

1. 서버의 `/sde_design` 폴더로 이동합니다.
2. 로컬의 `manual-apply\skin5` 폴더를 업로드 영역으로 드래그합니다.
3. 동일한 파일이 있다는 안내가 나오면 덮어쓰기를 선택합니다.
4. 업로드 완료 후 쇼핑몰을 새로고침합니다.

폴더 업로드가 되지 않으면 아래 파일을 각각 같은 서버 경로에 올립니다.

| 순서 | 로컬 파일 | 서버 경로 |
|---|---|---|
| 1 | `SkinImg/mirnuri-office/hero-office.jpg` | `/sde_design/skin5/SkinImg/mirnuri-office/hero-office.jpg` |
| 2 | `modules/mirnuri_office/css/home.css` | `/sde_design/skin5/modules/mirnuri_office/css/home.css` |
| 3 | `modules/mirnuri_office/css/theme.css` | `/sde_design/skin5/modules/mirnuri_office/css/theme.css` |
| 4 | `modules/top_banner/html/text_fixed.html` | `/sde_design/skin5/modules/top_banner/html/text_fixed.html` |
| 5 | `modules/header/html/header.html` | `/sde_design/skin5/modules/header/html/header.html` |
| 6 | `layout/basic/layout.html` | `/sde_design/skin5/layout/basic/layout.html` |
| 7 | `index.html` | `/sde_design/skin5/index.html` |

## 되돌리기

스마트디자인 편집창에서 수정된 파일을 열고 `히스토리`에서 적용 전 버전을 선택한 뒤 저장합니다. 되돌리는 순서는 `index.html`, `layout/basic/layout.html`, `modules/header/html/header.html`, `modules/top_banner/html/text_fixed.html`입니다. 새로 추가한 CSS와 이미지는 기존 파일에서 참조가 제거되면 사이트에 영향을 주지 않습니다.

## 적용 후 상품이 비어 있을 때

메인 상품 영역은 `product_listmain_9`를 사용합니다. 관리자 `상품 → 상품 진열 → 메인 진열`에서 모듈 번호 9에 상품을 등록해야 메인 페이지에 실제 상품이 표시됩니다.
