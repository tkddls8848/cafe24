//window popup script
function winPop(url) {
    window.open(url, "popup", "width=300,height=300,left=10,top=10,resizable=no,scrollbars=no");
}
/**
 * document.location.href split
 * return array Param
 */
function getQueryString(sKey)
{
    var sQueryString = document.location.search.substring(1);
    var aParam       = {};

    if (sQueryString) {
        var aFields = sQueryString.split("&");
        var aField  = [];
        for (var i=0; i<aFields.length; i++) {
            aField = aFields[i].split('=');
            aParam[aField[0]] = aField[1];
        }
    }

    aParam.page = aParam.page ? aParam.page : 1;
    return sKey ? aParam[sKey] : aParam;
};

$(function(){
    // tab
    $.eTab = function(ul){
        $(ul).find('a').on('click', function(){
            var _li = $(this).parent('li').addClass('selected').siblings().removeClass('selected'),
                _target = $(this).attr('href'),
                _siblings = '.' + $(_target).attr('class');
            $(_target).show().siblings(_siblings).hide();
            return false
        });
    }
    if ( window.call_eTab ) {
        call_eTab();
    };
});

/**
 * 구매 버튼 플로팅 영역 제어
 * 스크롤 시 원본 버튼이 화면에서 사라지면 플로팅 버튼을 표시
 */
var globalBuyBtnScrollFunc = function() {
    var sFixId = $('#orderFixItem').length > 0 ? 'orderFixItem' : 'fixedActionButton',
        $area = $('#orderFixArea'),
        $item = $('#' + sFixId).length > 0 ? $('#' + sFixId).not($area) : $('.fixedActionButton').not($area);

    // 필수 요소가 없으면 실행하지 않음
    if ($area.length === 0 || $item.length === 0) {
        return;
    }

    $(window).on('scroll', function(){
        try {
            var iCurrentHeightPos = $(this).scrollTop() + $(this).height(),
                iButtonHeightPos = $item.offset().top;

            if (iCurrentHeightPos > iButtonHeightPos || iButtonHeightPos < $(this).scrollTop() + $item.height()) {
                if (iButtonHeightPos < $(this).scrollTop() - $item.height()) {
                    $area.fadeIn('fast');
                } else {
                    $area.hide();
                }
            } else {
                $area.fadeIn('fast');
            }
        } catch(e) { }
    });
};

$(function(){
    globalBuyBtnScrollFunc();
});


/**
 * 메인 상품 목록 스와이퍼 레이어 제어
 * - 특정 버튼 클릭 시 자기 레이어 제외하고 다른 레이어 닫기
 * - 클릭된 li z-index 상승, 다른 li z-index 복원
 */
document.addEventListener('DOMContentLoaded', function(){
    var swiperWrapper = document.querySelector('.main_product_list .prdList.swiper-wrapper');
    if (!swiperWrapper) return;

    // 트리거와 해당 레이어 매핑
    var triggerLayerMap = [
        { trigger: '.discountPeriod > a', layer: '.layerDiscountPeriod' },
        { trigger: '.deliveryBenefitDetailInfo', layer: '.shippingFee .ec-base-tooltip' },
        { trigger: '.description .option', layer: '.xans-product-optionpreview .prdOption' },
        { trigger: '.EC-stockdesign', layer: '.ec-shop-detail-stock-layer' }
    ];

    var allLayerSelectors = [
        '.shippingFee .ec-base-tooltip',
        '.layerDiscountPeriod',
        '.xans-product-optionpreview .prdOption',
        '.ec-shop-detail-stock-layer'
    ];

    document.addEventListener('click', function(e){
        var li = e.target.closest('.main_product_list .prdList.swiper-wrapper > li');
        if (!li) return;

        var clickedTrigger = null;
        for (var i = 0; i < triggerLayerMap.length; i++) {
            if (e.target.closest(triggerLayerMap[i].trigger)) {
                clickedTrigger = triggerLayerMap[i];
                break;
            }
        }

        if (clickedTrigger) {
            var allLis = document.querySelectorAll('.main_product_list .prdList.swiper-wrapper > li');
            allLis.forEach(function(item){
                // 다른 li의 레이어 닫기 + z-index 복원
                if (item !== li) {
                    item.style.zIndex = '';
                    allLayerSelectors.forEach(function(selector){
                        var layer = item.querySelector(selector);
                        if (layer) {
                            layer.style.display = 'none';
                        }
                    });
                } else {
                    // 자기 li의 다른 레이어만 닫기
                    allLayerSelectors.forEach(function(selector){
                        if (selector !== clickedTrigger.layer) {
                            var layer = item.querySelector(selector);
                            if (layer) {
                                layer.style.display = 'none';
                            }
                        }
                    });
                }
            });

            // 클릭된 li z-index 상승
            li.style.zIndex = '2';
        }
    }, true);
});

/**
 * 할인기간 레이어 - 모바일(1024px 이하) 터치 대응
 * - 외부 코드의 mouseover/mouseout 이벤트를 click 토글로 대체
 * - btnClose 클릭 시 레이어 닫기
 * - 외부 클릭 시 레이어 닫기
 * - 적용 범위: 전체 상품 목록
 */
$(function(){
    var noHover = window.matchMedia('(hover: none)').matches;

    // hover 불가 환경에서만 click 토글로 변경
    if (noHover) {
        // hover 이벤트 제거 후 click 토글로 대체
        EC$('.discountPeriod > a').off('mouseover mouseout').on('click', function(e){
            e.preventDefault();
            e.stopPropagation();

            var $layer = EC$(this).parent().find('.layerDiscountPeriod');

            // 다른 레이어 닫기
            EC$('.layerDiscountPeriod').not($layer).hide();

            // 토글
            $layer.toggle();
        });
    }

    // 1024px 이하에서 닫기 처리 (btnClose, 외부 클릭)
    EC$(document).on('click', function(e){
        if (window.innerWidth > 1024) return;

        // btnClose 클릭 시 닫기
        var $btnClose = EC$(e.target).closest('.layerDiscountPeriod .btnClose');
        if ($btnClose.length) {
            e.preventDefault();
            $btnClose.closest('.layerDiscountPeriod').hide();
            return;
        }

        // 외부 클릭 시 닫기
        if (!EC$(e.target).closest('.discountPeriod').length) {
            EC$('.layerDiscountPeriod').hide();
        }
    });
});
