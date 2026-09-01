/**
 * Custom Modal Functions
 * 브라우저 기본 alert/confirm을 디자인된 모달로 대체
 *
 * Usage:
 *   customAlert('메시지');
 *   customAlert('메시지', callback);
 *   customConfirm('메시지', onConfirm, onCancel);
 *
 * Behavior:
 *   - 버튼 클릭 또는 ESC 키로 닫기 (배경 클릭 비활성화)
 *   - Alert: ESC = 확인
 *   - Confirm: ESC = 취소
 *
 * Accessibility:
 *   - 포커스 트랩 (Tab/Shift+Tab)
 *   - 열릴 때 첫 버튼 포커스
 *   - 닫힐 때 이전 포커스 복원
 *   - body scroll lock (모달 열릴 때)
 *   - 다중 모달 방지
 */

var CustomModal = (function() {
    var alertCallback = null;
    var confirmCallback = null;
    var cancelCallback = null;
    var previousFocus = null;
    var previousBodyOverflow = null;
    var openModalCount = 0;
    var mainContentSelector = 'main, #wrap, #container, .wrapper, body > *:not([id^="custom"])';

    // 포커스 가능한 요소 선택자
    var FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    // 포커스 가능 여부 필터링 (disabled, hidden, aria-hidden 제외)
    function isElementFocusable(el) {
        if (el.disabled) return false;
        if (el.hidden) return false;
        if (el.getAttribute('aria-hidden') === 'true') return false;
        if (el.tabIndex < 0) return false;
        if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false;
        return true;
    }

    // 모달 내 포커스 가능 요소 목록 (필터링 적용)
    function getFocusableElements(modal) {
        var elements = modal.querySelectorAll(FOCUSABLE_SELECTOR);
        var result = [];
        for (var i = 0; i < elements.length; i++) {
            if (isElementFocusable(elements[i])) {
                result.push(elements[i]);
            }
        }
        return result;
    }

    // 배경 콘텐츠 inert 처리
    function setBackgroundInert(inert) {
        var mainElements = document.querySelectorAll(mainContentSelector);
        for (var i = 0; i < mainElements.length; i++) {
            var el = mainElements[i];
            // 모달 자체는 제외
            if (el.id === 'customAlertModal' || el.id === 'customConfirmModal') continue;
            if (inert) {
                el.setAttribute('inert', '');
                el.setAttribute('aria-hidden', 'true');
            } else {
                el.removeAttribute('inert');
                el.removeAttribute('aria-hidden');
            }
        }
    }

    // body scroll lock
    function lockBodyScroll() {
        if (openModalCount === 0) {
            previousBodyOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
        }
        openModalCount++;
    }

    function unlockBodyScroll() {
        openModalCount--;
        if (openModalCount <= 0) {
            openModalCount = 0;
            document.body.style.overflow = previousBodyOverflow || '';
            previousBodyOverflow = null;
        }
    }

    // 모달 열림 상태 확인
    function isAnyModalOpen() {
        var alertModal = document.getElementById('customAlertModal');
        var confirmModal = document.getElementById('customConfirmModal');
        var isAlertOpen = alertModal && !alertModal.hidden;
        var isConfirmOpen = confirmModal && !confirmModal.hidden;
        return isAlertOpen || isConfirmOpen;
    }

    function trapFocus(modal, e) {
        var focusableElements = getFocusableElements(modal);
        if (focusableElements.length === 0) return;

        var firstElement = focusableElements[0];
        var lastElement = focusableElements[focusableElements.length - 1];

        // activeElement가 모달 밖이면 강제로 첫 요소로 되돌림
        if (!modal.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
            return;
        }

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    // 포커스 이탈 감지 및 복귀 (focusin 이벤트용)
    function handleFocusIn(e) {
        var alertModal = document.getElementById('customAlertModal');
        var confirmModal = document.getElementById('customConfirmModal');

        var isAlertOpen = alertModal && !alertModal.hidden;
        var isConfirmOpen = confirmModal && !confirmModal.hidden;

        if (!isAlertOpen && !isConfirmOpen) return;

        var activeModal = isAlertOpen ? alertModal : confirmModal;

        // 포커스가 모달 밖으로 나갔으면 첫 요소로 되돌림
        if (!activeModal.contains(e.target)) {
            var focusableElements = getFocusableElements(activeModal);
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }

    function handleKeydown(e) {
        var alertModal = document.getElementById('customAlertModal');
        var confirmModal = document.getElementById('customConfirmModal');

        var isAlertOpen = alertModal && !alertModal.hidden;
        var isConfirmOpen = confirmModal && !confirmModal.hidden;

        if (!isAlertOpen && !isConfirmOpen) return;

        // ESC 키로 닫기
        if (e.key === 'Escape' || e.keyCode === 27) {
            e.preventDefault();
            if (isAlertOpen) {
                closeAlert(); // Alert: 확인과 동일
            } else if (isConfirmOpen) {
                closeConfirm(false); // Confirm: 취소와 동일
            }
            return;
        }

        // Tab 키 포커스 트랩
        if (e.key === 'Tab' || e.keyCode === 9) {
            var activeModal = isAlertOpen ? alertModal : confirmModal;
            trapFocus(activeModal, e);
        }
    }

    function saveFocus() {
        previousFocus = document.activeElement;
    }

    function restoreFocus() {
        if (previousFocus && typeof previousFocus.focus === 'function') {
            try {
                previousFocus.focus();
            } catch (e) {
                // 포커스 복원 실패 시 무시
            }
        }
        previousFocus = null;
    }

    function focusFirstButton(modal) {
        var firstButton = modal.querySelector('button');
        if (firstButton) {
            firstButton.focus();
        }
    }

    function closeAlert() {
        var modal = document.getElementById('customAlertModal');
        if (modal && !modal.hidden) {
            modal.hidden = true;
            setBackgroundInert(false);
            unlockBodyScroll();
        }
        restoreFocus();
        if (typeof alertCallback === 'function') {
            var cb = alertCallback;
            alertCallback = null;
            try {
                cb();
            } catch (e) {
                console.error('CustomAlert callback error:', e);
            }
        }
    }

    function closeConfirm(confirmed) {
        var modal = document.getElementById('customConfirmModal');
        if (modal && !modal.hidden) {
            modal.hidden = true;
            setBackgroundInert(false);
            unlockBodyScroll();
        }
        restoreFocus();
        if (confirmed && typeof confirmCallback === 'function') {
            var cb = confirmCallback;
            confirmCallback = null;
            cancelCallback = null;
            try {
                cb();
            } catch (e) {
                console.error('CustomConfirm callback error:', e);
            }
        } else if (!confirmed && typeof cancelCallback === 'function') {
            var cb = cancelCallback;
            confirmCallback = null;
            cancelCallback = null;
            try {
                cb();
            } catch (e) {
                console.error('CustomConfirm cancel callback error:', e);
            }
        } else {
            confirmCallback = null;
            cancelCallback = null;
        }
    }

    function showAlert(message, callback) {
        // 다중 모달 방지: 이미 모달이 열려있으면 기본 alert 사용
        if (isAnyModalOpen()) {
            alert(message);
            if (typeof callback === 'function') {
                try {
                    callback();
                } catch (e) {
                    console.error('CustomAlert fallback callback error:', e);
                }
            }
            return;
        }

        alertCallback = callback || null;
        var modal = document.getElementById('customAlertModal');
        var title = document.getElementById('customAlertTitle');
        if (!modal || !title) {
            alert(message);
            if (typeof callback === 'function') {
                try {
                    callback();
                } catch (e) {
                    console.error('CustomAlert fallback callback error:', e);
                }
            }
            return;
        }
        saveFocus();
        lockBodyScroll();
        setBackgroundInert(true);
        title.textContent = message;
        modal.hidden = false;
        // 모달 컨테이너에 포커스 후 첫 버튼으로 이동
        var dialogContainer = modal.querySelector('[role="alertdialog"]');
        if (dialogContainer) dialogContainer.focus();
        focusFirstButton(modal);
    }

    function showConfirm(message, onConfirm, onCancel) {
        // 다중 모달 방지: 이미 모달이 열려있으면 기본 confirm 사용
        if (isAnyModalOpen()) {
            if (confirm(message)) {
                if (typeof onConfirm === 'function') {
                    try {
                        onConfirm();
                    } catch (e) {
                        console.error('CustomConfirm fallback callback error:', e);
                    }
                }
            } else {
                if (typeof onCancel === 'function') {
                    try {
                        onCancel();
                    } catch (e) {
                        console.error('CustomConfirm fallback cancel callback error:', e);
                    }
                }
            }
            return;
        }

        confirmCallback = onConfirm || null;
        cancelCallback = onCancel || null;
        var modal = document.getElementById('customConfirmModal');
        var title = document.getElementById('customConfirmTitle');
        if (!modal || !title) {
            if (confirm(message)) {
                if (typeof onConfirm === 'function') {
                    try {
                        onConfirm();
                    } catch (e) {
                        console.error('CustomConfirm fallback callback error:', e);
                    }
                }
            } else {
                if (typeof onCancel === 'function') {
                    try {
                        onCancel();
                    } catch (e) {
                        console.error('CustomConfirm fallback cancel callback error:', e);
                    }
                }
            }
            return;
        }
        saveFocus();
        lockBodyScroll();
        setBackgroundInert(true);
        title.textContent = message;
        modal.hidden = false;
        // 모달 컨테이너에 포커스 후 취소 버튼으로 이동 (안전한 기본값)
        var dialogContainer = modal.querySelector('[role="dialog"]');
        if (dialogContainer) dialogContainer.focus();
        var cancelButton = modal.querySelector('[data-action="cancel"]');
        if (cancelButton) {
            cancelButton.focus();
        }
    }

    // 키보드 이벤트 리스너 등록
    document.addEventListener('keydown', handleKeydown);
    // 포커스 이탈 감지 리스너 등록
    document.addEventListener('focusin', handleFocusIn);

    return {
        alert: showAlert,
        confirm: showConfirm,
        closeAlert: closeAlert,
        closeConfirm: closeConfirm,
        isOpen: isAnyModalOpen
    };
})();

function customAlert(message, callback) {
    CustomModal.alert(message, callback);
}

function customConfirm(message, onConfirm, onCancel) {
    CustomModal.confirm(message, onConfirm, onCancel);
}
