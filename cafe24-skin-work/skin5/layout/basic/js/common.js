// thumbnail onerror
$(window).on('load', function() {
    $(".thumbnail img, img.thumbImage, img.bigImage").each(function($i,$item){
        var $img = new Image();
        $img.onerror = function () {
            $item.src="//img.echosting.cafe24.com/thumb/img_product_big.gif";
        }
        $img.src = this.src;
    });
});

$(function(){

    $('div.eToggle .title').off('click').on('click', function(){
        var toggle = $(this).parent('.eToggle');
        if(toggle.hasClass('disable') === false){
            $(this).parent('.eToggle').toggleClass('selected')
        }
    });

    $('dl.eToggle dt').on('click', function(){
        $(this).toggleClass('selected');
        $(this).next('dd').toggleClass('selected');
    });


    $('[id^="quantity"]').each(function() {
        $(this).get(0).type = 'tel';
    });


    $('.xans-mall-supplyinfo, .supplyInfo').find('table > colgroup').find('col').eq(0).width(98);
    $('.xans-mall-supplyinfo, .supplyInfo').find('th, td').css({padding:'13px 10px 12px'});

    /**
     * toggle
     */
    $('.xans-product-listmain h2').on('click', function() {
        var bClosed = !!$(this).data('is_closed');
        var sUrl;
        if (bClosed) {
            sUrl = "//img.echosting.cafe24.com/skin/mobile_en_PH/layout/bg_title_close.gif";
        } else {
            sUrl = "//img.echosting.cafe24.com/skin/mobile_en_PH/layout/bg_title_open.gif";
        }
        $(this).css('background-image', 'url("'+ sUrl +'")');
        $(this).siblings().toggle();
        $(this).parent().find('div.ec-base-paginate').toggle();
        $(this).parent().next('div.xans-product-listmore').toggle();
        $(this).data('is_closed', !bClosed);
    });

    /* base header 검색 레이어 */
    $('#layout .header').find('.search .btnSearch').on('click', function(){
        var $baseHeader = $('#layout .header');
        $baseHeader.addClass('open');
        $('#dimmedSlider').one('click', function(){
            $baseHeader.removeClass('open');
        });
    });

    /**
     *  Top button
     */
    var globalTopBtnScrollFunc = function() {

        var $btnTop = $('#btnTop');

        $(window).on('scroll', function() {
            try {
                var iCurScrollPos = $(this).scrollTop();

                if (iCurScrollPos > ($(this).height() / 2)) {
                    $btnTop.fadeIn('fast');
                } else {
                    $btnTop.fadeOut('fast');
                }
            } catch(e) { }
        });
    };

    /**
     *  Order button
     */
    var globalBuyBtnScrollFunc = function() {

        var sFixId = $('#orderFixItem').length > 0  ? 'orderFixItem' : 'fixedActionButton',
            $area = $('#orderFixArea'),
            $item = $('#' + sFixId + '').not($area);

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

    globalTopBtnScrollFunc();
    globalBuyBtnScrollFunc();
});


var globalLayerOpenFunc = function(_this) {
    this.id = $(_this).data('id');
    this.param = $(_this).data('param');
    this.basketType = $('#basket_type').val();
    this.url = $(_this).data('url');
    this.layerId = 'ec_temp_mobile_layer';
    this.layerIframeId = 'ec_temp_mobile_iframe_layer';

    var _this = this;

    function paramSetUrl() {
        if (this.param) {
            // if isset param
        } else {
            this.url = this.basketType ?  this.url + '?basket_type=' + this.basketType : this.url;
        }
    };

    if (this.url) {
        window.ecScrollTop = $(window).scrollTop();
        $.ajax({
            url : this.url,
            success : function (data) {
                if (data.indexOf('404 No Page Found') == -1) {

                    try { $(_this).remove(); } catch ( e ) { }

                    var $layer = $('<div>', {
                        html: $("<iframe>", { src: _this.url, id: _this.layerIframeId, scrolling: 'auto', css: { width: '100%', height: '100%', overflowY: 'auto', border: 0 } } ),
                        id: _this.layerId,
                        css : { position: 'absolute', top: 0, left:0, width: '100%', height: $(window).height(), 'z-index': 9999 }
                    });

                    $('body').append($layer);
                    $('html, body').css({'overflowY': 'hidden', height: '100%', width: '100%'});
                    $('#' + this.layerId).show();
                }
            }
        });
    }
};

// Popup close
var globalLayerCloseFunc = function() {
    this.layerId = 'ec_temp_mobile_layer';

    if (window.parent === window)
        self.close();
    else {
        parent.$('html, body').css({'overflowY': 'auto', height: 'auto', width: '100%'});
        parent.$('html, body').scrollTop(parent.window.ecScrollTop);
        parent.$('#' + this.layerId).remove();
    }
};

/**
 * document.location.href split
 * return array Param
 */
var getQueryString = function(sKey)
{
    var sQueryString = document.location.search.substring(1);
    var aParam = {};

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

// PC ver
var isPCver = function() {
    var sUrl = window.location.hostname;
    var aTemp = sUrl.split(".");

    var pattern = /^(mobile[\-]{2}shop[0-9]+)$/;

    if (aTemp[0] == 'm' || aTemp[0] == 'skin-mobile' || aTemp[0] == 'mobile') {
        sUrl = sUrl.replace(aTemp[0]+'.', '');
    } else if (pattern.test(aTemp[0]) === true) {
        var aExplode = aTemp[0].split('--');
        aTemp[0] = aExplode[1];
        sUrl = aTemp.join('.');
    }
    window.location.href = '//'+sUrl+'/?is_pcver=T';
};

// tooltip
$('body').on('click', '.eTooltip .eTip', function(e){
    var findTarget = $($(this).siblings('.tooltip'));
    var findTooltip = $('.tooltip');
    $('.eTooltip').removeClass('show');
    $(this).parents('.eTooltip').first().addClass('show');
    findTooltip.hide();
    findTarget.show();
    e.preventDefault();
});

$('.eTooltip').find('input').on('focusout', function() {
    var findTarget = $(this).parents('.eTooltip').find('.tooltip');
    $('.eTooltip').removeClass('show');
    findTarget.hide();
});

/* tooltip */
$('body').on('click', '.ec-base-tooltip-area .eTip', function(e){
    console.log('1111');
    
    var findArea = $($(this).parents('.ec-base-tooltip-area'));
    var findTarget = $($(this).siblings('.ec-base-tooltip'));
    var findTooltip = $('.ec-base-tooltip');
    $('.ec-base-tooltip-area').removeClass('show');
    $(this).parents('.ec-base-tooltip-area').first().addClass('show');
    findTooltip.hide();
    findTarget.show();
    e.preventDefault();
});

$('body').on('click', '.ec-base-tooltip-area .eClose', function(e){
    console.log('2222222');
    
    var findTarget = $(this).parents('.ec-base-tooltip').first();
    $('.ec-base-tooltip-area').removeClass('show');
    findTarget.hide();
    e.preventDefault();
});

$('.ec-base-tooltip-area').find('input').on('focusout', function() {
    console.log('3333');
    
    var findTarget = $(this).parents('.ec-base-tooltip-area').find('.ec-base-tooltip');
    $('.ec-base-tooltip-area').removeClass('show');
    findTarget.hide();
});

/**
 * popup resize
 */

function setResizePopup() {
    var checkPopup = $('#popup').length,
        iWrapWidth = $('#popup').width(),
    	iWrapHeight = $('#popup').height();
    
    var iWindowWidth = $(window).width(),
    	iWindowHeight = $(window).height();
    
    if(checkPopup > 0) {
         window.resizeBy(iWrapWidth - iWindowWidth, iWrapHeight - iWindowHeight);
    }
    
}
setResizePopup();

$( window ).on('load', function() {
    setResizePopup();
});