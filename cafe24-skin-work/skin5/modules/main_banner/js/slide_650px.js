// 메인 비주얼 슬라이드
// PMF-5643 2026-08-24: 배너 1장 요청 시(PMF-5524 슬롯 축소) loop:true 가 슬라이드를 복제해
// 동일 배너가 3개처럼 노출되던 문제 - 슬라이드 2장 이상일 때만 loop/autoplay, 1장이면 UI 숨김
const visualAaSlideCount = document.querySelectorAll('.visual_A_a .swiper-wrapper .swiper-slide').length;
const visual_A_a = new Swiper('.visual_A_a', {
    slidesPerView: 'auto',
    speed: 800,
    loop: visualAaSlideCount > 1, // PMF-5643 2026-08-24
    observer: true,
    observeParents: true,
    autoplay: visualAaSlideCount > 1 ? { delay: 5000, disableOnInteraction: false } : false, // PMF-5643 2026-08-24
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
            return `<span class="${className}"><span class="progress-bar"></span></span>`;
        },
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});
// PMF-5643 2026-08-24: 배너 1장이면 페이지네이션/내비게이션 숨김 (복제 불릿/무의미 화살표 제거)
if (visualAaSlideCount <= 1) {
    document.querySelectorAll('.visual_A_a .swiper-pagination, .visual_A_a .swiper-button-prev, .visual_A_a .swiper-button-next')
        .forEach((el) => { el.style.display = 'none'; });
}

/*
수동추가
디바이스에 따라서 배너 텍스트 색상 변경하기 위해서 색상 변경 로직 추가
["black", "black", "black"], ["black", "white", "black"] 코드상 치환
*/
// 디바이스 타입 감지 함수 (CSS @container 767px 기준)
function getDeviceType() {
    return window.innerWidth <= 767 ? 'Mobile' : 'PC';
}

// 현재 디바이스 타입 추적 변수
let currentDeviceType = getDeviceType();

// 슬라이드별 텍스트 색상 설정 배열
const textColorSettings = ["black", "black", "black"];
const mobileTextColorSettings = ["black", "white", "black"];

// 텍스트 색상 클래스 업데이트 함수
function updateTextColor(slideIndex) {
    const slides = document.querySelectorAll('.visual_A_a .swiper-slide');
    slides.forEach((slide) => {
        const textBox = slide.querySelector('.text_box');
        const deviceType = getDeviceType();
        const textColor = deviceType === 'Mobile' ? mobileTextColorSettings : textColorSettings;
        // PMF-5643 2026-08-24: loop 비활성(배너 1장) 시 data-swiper-slide-index 미부여 - DOM 순번 폴백
        const slideIndexAttr = slide.getAttribute('data-swiper-slide-index');
        const slideDataIndex = slideIndexAttr !== null ? parseInt(slideIndexAttr) : Array.prototype.indexOf.call(slide.parentNode.children, slide);

        if (textBox && slideDataIndex === slideIndex) {
            // 기존 text_btn_white 클래스 제거
            textBox.classList.remove('text_btn_white');
            // 해당 슬라이드가 현재 슬라이드이고 설정이 white인 경우 클래스 추가
            if (textColor[slideDataIndex] === 'white') {
                textBox.classList.add('text_btn_white');
            }
        }
    });
}

// 슬라이드 이동 시마다 현재 슬라이드 번호 추적 및 텍스트 색상 업데이트
visual_A_a.on('slideChange', function() {
    // 텍스트 색상 업데이트
    updateTextColor(this.realIndex);
});

// 초기 텍스트 색상 설정
updateTextColor(visual_A_a.realIndex);

// 화면 크기 변경 시 디바이스 타입 변화 감지 및 텍스트 색상 업데이트
window.addEventListener('resize', function() {
    const newDeviceType = getDeviceType();

    // 디바이스 타입이 변경된 경우에만 텍스트 색상 업데이트 실행
    if (newDeviceType !== currentDeviceType) {
        currentDeviceType = newDeviceType;
        updateTextColor(visual_A_a.realIndex);
    }
});