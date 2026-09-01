document.addEventListener('DOMContentLoaded', function () {
    const topButton = document.querySelector('.moveToTop_module');
    const floatMenu = document.querySelector('.floatMenu_B');
    const foldBtn = document.querySelector('.fold_btn');

    topButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', () => {
        if (!topButton) return;
        if (window.scrollY > 1000) {
            topButton.classList.add('visible');
        } else { topButton.classList.remove('visible'); }
    });

    setTimeout(() => {
        if (floatMenu && topButton) {
            if(floatMenu.classList.contains('is-folded')){
                topButton.classList.remove('active_b');
            } else {
                topButton.classList.add('active_b');
            }
        }
    }, 100)

    if (foldBtn && floatMenu && topButton) {
        foldBtn.addEventListener('click', () => {
            if (floatMenu.classList.contains('is-folded')) {
                topButton.classList.add('active_b');
            } else {
                topButton.classList.remove('active_b');
            }
        });
    }

});