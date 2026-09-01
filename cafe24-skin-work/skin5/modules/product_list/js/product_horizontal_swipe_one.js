/* PMF-5590 2026-08-18: 모바일 일체형(layout_mobile) 조립은 PC 폭에서도 모바일 UI - 레이아웃 기준 판정 (PMF-5536 이식) */
function product_list_C_d_a_isMobileView() {
    return document.body.classList.contains('layout_mobile') || window.innerWidth <= 1024;
}

const product_list_C_d_a = new Swiper('.product_list_C_d_a .product_swiper', {
    slidesPerView: 1,
    speed: 800,
    loop: false,
    loopAdditionalSlides: 1,
    observer: true,
    observeParents: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    scrollbar: {
        el: ".swiper-scrollbar",
        draggable: true,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
            return `<span class="${className}"><span class="progress-bar"></span></span>`;
        }
    },
    breakpoints: {
        0: {
            slidesPerView: 2,
            spaceBetween: 10,
        },
        1025: {
            slidesPerView: 1,
            spaceBetween: 20,
        }
    }
});

function product_list_C_d_a_toggleFullWidthClass() {
    const section = document.querySelector('.product_list_C_d_a');
    if (!section) return;

    if (product_list_C_d_a_isMobileView()) {
        section.classList.remove('full_width');
    } else {
        section.classList.add('full_width');
    }
}

function product_list_C_d_a_toggleSwiperNav() {
    const pagination = document.querySelector('.product_list_C_d_a .swiper-pagination');
    const scrollbar = document.querySelector('.product_list_C_d_a .swiper-scrollbar');

    if (product_list_C_d_a_isMobileView()) {
        pagination?.classList.add('displaynone');
        scrollbar?.classList.remove('displaynone');
    } else {
        pagination?.classList.remove('displaynone');
        scrollbar?.classList.add('displaynone');
    }
}

function product_list_C_d_a_moveListTextForMobile() {
    const section = document.querySelector('.product_list_C_d_a');
    const bannerBox = section?.querySelector('.banner_box');
    const listText = section?.querySelector('.list_text');
    const contentLeft = section?.querySelector('.content_left');

    if (!bannerBox || !listText || !contentLeft) return;

    if (product_list_C_d_a_isMobileView()) {
        bannerBox.parentNode.insertBefore(listText, bannerBox);
    } else {
        contentLeft.insertBefore(listText, contentLeft.firstChild);
    }
}

function product_list_C_d_a_handleResponsiveActions() {
    product_list_C_d_a_toggleFullWidthClass();
    product_list_C_d_a_toggleSwiperNav();
    product_list_C_d_a_moveListTextForMobile();
}

document.addEventListener('DOMContentLoaded', function () {
    product_list_C_d_a_handleResponsiveActions();
    window.addEventListener('resize', product_list_C_d_a_handleResponsiveActions);
});