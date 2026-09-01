document.addEventListener('DOMContentLoaded', function () {    
    //fade-in 애니메이션
    const prdFade = document.querySelectorAll('.prd_fade');

    const prdScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('prd_fade_in');
                observer.unobserve(entry.target); // 한 번만 실행
            }
        });
    }, { threshold: 0.2 });

    prdFade.forEach(el => prdScroll.observe(el));
});