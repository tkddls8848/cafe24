function checkAsideA() {
    const asideA = document.querySelector('#aside.aside_A');
    if (!asideA) return;

    let isHidden = false;
    let parent = asideA.parentElement;

    while (parent) {
        const style = window.getComputedStyle(parent);
        if (style.display === 'none') {
            isHidden = true;
            break;
        }
        parent = parent.parentElement;
    }

    if (!isHidden) {
        applyAsideA(asideA);
    }
}

function applyAsideA(asideA) {
    // 중복 적용 방지
    if (!asideA.querySelector('style[data-aside-style]')) {
        // 스타일 적용
        const style = document.createElement('style');
        style.setAttribute('data-aside-style', 'true');
        style.textContent = `
        body.expand { overflow: hidden; }
        body.expand #aside { left: 0; visibility: visible; }
        body.expand #layoutDimmed { display: none; }
        `;
        asideA.appendChild(style);
    }

    document.addEventListener('DOMContentLoaded', function () {
        const bottomNav = document.querySelector('.bottom_nav');
        const aside = document.getElementById('aside');

        if (bottomNav && aside) {
            function setAsideHeightMobileOnly() {
                const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                const bottomNavHeight = bottomNav.offsetHeight || 0;
                aside.style.height = `${Math.max(0, viewportHeight - bottomNavHeight + 1)}px`;
            }

            window.addEventListener('resize', setAsideHeightMobileOnly);
            setAsideHeightMobileOnly();
        }
    });
}

function isElementHidden(element) {
    let current = element;
    while (current) {
        const style = window.getComputedStyle(current);
        if (style.display === 'none') return true;
        current = current.parentElement;
    }
    return false;
}

// 초기 실행
checkAsideA();

// 리사이즈 시 다시 확인
window.addEventListener('resize', checkAsideA);