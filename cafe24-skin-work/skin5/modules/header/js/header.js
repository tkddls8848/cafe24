// 스크롤 이벤트
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    const topBanners = document.querySelectorAll('.top_banner');

    let threshold = 1;

    if (topBanners.length > 0) {
        threshold = 0;
        topBanners.forEach(banner => {
            threshold += banner.offsetHeight;
        });
    }

    let hasClass = header.classList.contains('fixed');

    if (window.scrollY > threshold) {
        if (!hasClass) header.classList.add('fixed');
    } else {
        if (hasClass) header.classList.remove('fixed');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // searchBarForm에 top값 적용
    const searchIcon = document.querySelector('#header .top_mypage .eSearch');
    const bannerClose = document.querySelectorAll('.top_banner .btn_banner_close');

    searchIcon.addEventListener('click', function () {
        searchBarTop();
    });
    bannerClose.forEach(function(btn) {
        btn.addEventListener('click', function () {
            searchBarTop();
        });
    });

    function searchBarTop() {
        const header = document.getElementById('header');
        const searchBarForm = document.getElementById('searchBarForm');

        if (header && searchBarForm) {
            const headerRect = header.getBoundingClientRect();
            let headerBottom;

            if (header.classList.contains('fixed')) {
                // fixed 상태일 때는 뷰포트 기준 위치
                headerBottom = headerRect.bottom;
                searchBarForm.style.position = 'fixed';
            } else {
                // fixed 아닐 때는 스크롤 위치까지 더하기
                headerBottom = headerRect.bottom + window.scrollY;
                searchBarForm.style.position = 'absolute';
            }

            searchBarForm.style.top = `${headerBottom}px`;
        }
    }
});