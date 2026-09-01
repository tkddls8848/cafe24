$(function(){
    var loginButtons = document.querySelectorAll('.header-login-btn');
    
    loginButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var contentValue = document.querySelector('meta[name="path_role"]').getAttribute('content');

            if (contentValue == 'MEMBER_JOIN' || contentValue == 'MEMBER_AGREEMENT' || contentValue == 'MEMBER_LOGIN') {
                window.location.href = '/member/login.html';
                return true;
            }

            var existingParams = new URLSearchParams(window.location.search);
            var returnUrl = existingParams.has('returnUrl') ? existingParams.get('returnUrl') : window.location.pathname + window.location.search;
            existingParams.set('returnUrl', returnUrl);

            window.location.href = '/member/login.html?' + existingParams.toString();
        });
    });
});