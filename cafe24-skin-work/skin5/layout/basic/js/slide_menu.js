var aCategory = [];
$(function(){
    var methods = {
        aCategory    : [],
        aSubCategory : {},
        get: function() {
             $.ajax({
                url : '/exec/front/Product/SubCategory',
                dataType: 'json',
                success: function(aData) {
                    if (aData == null || aData == 'undefined') {
                        methods.checkSub();
                        return;
                    }
                    for (var i=0; i<aData.length; i++)
                    {
                        var sParentCateNo = aData[i].parent_cate_no;
                        var sCateNo = aData[i].cate_no;
                        if (!methods.aSubCategory[sParentCateNo]) {
                            methods.aSubCategory[sParentCateNo] = [];
                        }
                        if (!aCategory[sCateNo]) {
                            aCategory[sCateNo] = [];
                        }
                        methods.aSubCategory[sParentCateNo].push( aData[i] );
                        aCategory[sCateNo] = aData[i];
                    }
                    methods.checkSub();
                }
            });
        },
        getParam: function(sUrl, sKey) {
            if (typeof sUrl !== 'string') return;
            var aUrl         = sUrl.split('?');
            var sQueryString = aUrl[1];
            var aParam       = {};
            if (sQueryString) {
                var aFields = sQueryString.split("&");
                var aField  = [];
                for (var i=0; i<aFields.length; i++) {
                    aField = aFields[i].split('=');
                    aParam[aField[0]] = aField[1];
                }
            }
            return sKey ? aParam[sKey] : aParam;
        },
        getParamSeo: function(sUrl) {
            var aUrl = EC_ROUTE.getCleanUrl(sUrl).split('/');
            return aUrl[3] ? aUrl[3] : null;
        },

        show: function(overNode, iCateNo) {
             var oParentNode = overNode;
            var aHtml = [];
            var sMyCateList = localStorage.getItem("myCateList");
            if (methods.aSubCategory[iCateNo] != undefined) {
                aHtml.push('<ul class="slideSubMenu sub_cate01">');
                $(methods.aSubCategory[iCateNo]).each(function() {
                    var sNextParentNo = this.cate_no;
                    var sCateSelected = (checkInArray(sMyCateList, this.cate_no) == true) ? ' selected' : '';
                    if (methods.aSubCategory[sNextParentNo] == undefined) {
                        aHtml.push('<li class="noChild" id="cate'+this.cate_no+'">');
                        var sHref = '/product/list.html'+this.param;
                    } else {
                        aHtml.push('<li id="cate'+this.cate_no+'">');
                        var sHref = '#none';
                    }
                    aHtml.push('<a href="/product/list.html'+this.param+'" class="view" cate="'+this.param+'" data-i18n="LIST.PRD_CATE_NO_'+this.cate_no+'" data-i18n-new>'+this.name+'</a>');
                    if (methods.aSubCategory[sNextParentNo] != undefined)  aHtml.push('<a href="'+sHref+'"'+this.param+'" onclick="subMenuEvent(this);" class="cate">more</a>');

                    if (methods.aSubCategory[sNextParentNo] != undefined) {
                        aHtml.push('<ul class="sub_cate02">');
                        $(methods.aSubCategory[sNextParentNo]).each(function() {
                            var sNextParentNo2 = this.cate_no;
                            var sCateSelected = (checkInArray(sMyCateList, this.cate_no) == true) ? ' selected' : '';
                            if (methods.aSubCategory[sNextParentNo2] == undefined) {
                                aHtml.push('<li class="noChild" id="cate'+this.cate_no+'">');
                                var sHref = '/product/list.html'+this.param;
                            } else {
                                aHtml.push('<li id="cate'+this.cate_no+'">');
                                var sHref = '#none';
                            }
                            aHtml.push('<a href="/product/list.html'+this.param+'" class="view" cate="'+this.param+'" data-i18n="LIST.PRD_CATE_NO_'+this.cate_no+'" data-i18n-new>'+this.name+'</a>');
                            if (methods.aSubCategory[sNextParentNo] != undefined)  aHtml.push('<a href="'+sHref+'"'+this.param+'" onclick="subMenuEvent(this);" class="cate">more</a>');

                            if (methods.aSubCategory[sNextParentNo2] != undefined) {
                                aHtml.push('<ul class="sub_cate03">');

                                $(methods.aSubCategory[sNextParentNo2]).each(function() {
                                    aHtml.push('<li class="noChild" id="cate'+this.cate_no+'">');
                                    var sCateSelected = (checkInArray(sMyCateList, this.cate_no) == true) ? ' selected' : '';
                                    aHtml.push('<a href="/product/list.html'+this.param+'" class="view" cate="'+this.param+'" onclick="subMenuEvent(this);" data-i18n="LIST.PRD_CATE_NO_'+this.cate_no+'" data-i18n-new>'+this.name+'</a>');
                                    aHtml.push('</li>');
                                });
                                aHtml.push('</ul>');
                            }
                            aHtml.push('</li>');
                        });
                        aHtml.push('</ul>');
                    }
                    aHtml.push('</li>');
                });
                aHtml.push('</ul>');
            }
            $(oParentNode).append(aHtml.join(''));
            if (window.i18nextCafe24) {
            	i18nextCafe24.translate('data-i18n-new');
            }
        },
        close: function() {
            $('.slideSubMenu').remove();
        },
        checkSub: function() {
            $('.cate').each(function(){
                var sParam = $(this).attr('cate');
                if (!sParam) return;
                var iCateNo = Number(methods.getParam(sParam, 'cate_no'));
                var result = methods.aSubCategory[iCateNo];
                if (result == undefined) {
                    if ($(this).closest('#slideProjectList').length) {
                        var sHref = '/product/project.html'+sParam;
                    } else {
                        var sHref = '/product/list.html'+sParam;
                    }

                    $(this).attr('href', sHref);
                    $(this).parent().attr('class', 'noChild');
                }
            });
        }
    };

    methods.get();

    // 하위 카테고리가 없을때 more 버튼 숨김 처리
    function fnCateNone01(list){
        list.each(function () {
            const $li = $(this);
            const $link = $li.children('.view').children('a');
            
            if ($link.length === 0) return;
    
            const href = $link.attr('href');
            let iCateNo = Number(methods.getParam(href, 'cate_no'));
    
            if (!iCateNo) {
                iCateNo = Number(methods.getParamSeo(href));
            }
    
            if (methods.aSubCategory[iCateNo] == undefined && $link.siblings('.sub_cate01').length === 0) {
                const $moreBtn = $li.find('.more');
                if ($moreBtn.length) {
                    $moreBtn.hide();
                }
            }
        });
    }
    function fnCateNone02(list){
        list.each(function () {
            const $li = $(this);
            const $link = $li.children('.view');
    
            if ($link.length === 0) return;
    
            const href = $link.attr('href');
            let iCateNo = Number(methods.getParam(href, 'cate_no'));
            
            
            if (!iCateNo) {
                iCateNo = Number(methods.getParamSeo(href));
            }
    
            if (methods.aSubCategory[iCateNo] == undefined) {
                const $moreBtn = $li.find('.cate');
                if ($moreBtn.length) {
                    $moreBtn.hide();
                }
            }
        });
    }
    setTimeout(() => {
        fnCateNone01($('#slideCateList #slide_add_category > li'));
    }, 500);

    $('#slideCateList').on('click', '.sub_cate01 > li > .cate', function(e) {
        fnCateNone02($('#slideCateList #slide_add_category .sub_cate02 > li'));
    });
    $('#slideCateList').on('click', '.sub_cate02 > li > .cate', function(e) {
        fnCateNone02($('#slideCateList #slide_add_category .sub_cate03 > li'));
    });

    $('#slideCateList li .more').on('click', function (e) {
        if($('.aside_A')){
            const link = $(this).siblings('a')
            let iCateNo = Number(methods.getParam(link.attr('href'), 'cate_no'));
            
            if (!iCateNo) {
                iCateNo = Number(methods.getParamSeo(link.attr('href')));
            }
    
            if($(this).closest('li').hasClass('noChild') && !$(this).closest('li').hasClass('xans-record-')){
    
                if(link.parent().hasClass('selected')) {
                    link.parent().removeClass('selected');
                } else {
                    $('#aside #slideCateList li.selected').removeClass('selected');
                    $('#aside #slideCateList .view.selected').removeClass('selected');
                    link.parent().addClass('selected');
                }
            }
    
            if (!iCateNo) {
               return;
            }
            let hasClass =  link.parent().hasClass('selected');
            
            if(hasClass) {
                methods.close();
                link.parent().removeClass('selected');
            } else {
                $('#aside #slideCateList li.selected').removeClass('selected');
                $('#aside #slideCateList .view.selected').removeClass('selected');
                link.parent().addClass('selected');
                methods.close();
                methods.show(this.parentNode, iCateNo);
            }
            e.preventDefault();
        } else if($('.aside_B')){
            e.preventDefault();
    
            const $moreBtn = $(this);
            const $link = $moreBtn.siblings('a');
            const $li = $link.parent();
            const $subCate = $moreBtn.siblings('.sub_cate01');
        
            let iCateNo = Number(methods.getParam($link.attr('href'), 'cate_no'));
            if (!iCateNo) {
                iCateNo = Number(methods.getParamSeo($link.attr('href')));
            }
        
            const isSelected = $li.hasClass('selected');
        
            if (iCateNo) {
                if (isSelected) {
                    methods.close();
                    $li.removeClass('selected');
                } else {
                    $('#aside #slideCateList li').removeClass('selected');
                    $li.addClass('selected');
                    methods.close();
                    methods.show($li[0], iCateNo);
                }
            } else if ($subCate.length) {
                if (isSelected) {
                    $li.removeClass('selected');
                } else {
                    $('#aside #slideCateList li').removeClass('selected');
                    $li.addClass('selected');
                }
            }
        }
    });

	/* 모바일 슬라이드바 카테고리 중분류체크 */
	jQuery('#slide_add_category li').each(function(){
		if( jQuery(this).children('ul').length == 0 ){
			jQuery(this).addClass('noChild');
		} else {
			jQuery(this).append('<a href="#none" class="cate">상품보기</a>');
		}
    });

    /* 모바일 슬라이드바 카테고리 */
    $('#aside ul a.cate').on('click', function(e){
        var sParam = $(this).attr('cate');
        if(sParam) return;

        $(this).parent().find('li').removeClass('selected');
        $('#slideCateList .categoryList li').removeClass('selected');
        $(this).parent().toggleClass('selected');

        if (!$(this).parent('li').hasClass('noChild')){
            e.preventDefault();
        }
    });

	/* 슬라이드 고객센터 토글 */
    jQuery('#aside .navigation-menu__board .icoCategory').click(function() {
        var target = jQuery(this).parents('#aside .navigation-menu__board');
        if(target.find('.categoryList').css("display") == "none"){
            target.find('.categoryList').show();
        }else{
            target.find('.categoryList').hide();
        }

        jQuery(this).parents('.title').toggleClass('selected');
    });

    $('#slideCateList h2').on('click', function() {
        var oParentId = $(this).parent().attr('id');
        if (oParentId == 'slideCateList' || oParentId == 'slideMultishopList' || oParentId == 'slideProjectList') {
            ($(this).attr('class') == 'selected') ? $(this).next().hide() : $(this).next().show();
        }
        $(this).toggleClass('selected');
    });

    $('#slideProjectList .icoCategory').on('click', function() {
        var target = $(this).parents('#slideProjectList');
        if(target.find('.categoryList').css("display") == "none"){
            target.find('.categoryList').show();
        }else{
            target.find('.categoryList').hide();
        }

        $(this).parents('.title').toggleClass('selected');
    });

});
function subMenuEvent(obj) {
    $(obj).parent().find('li').removeClass('selected');
    $(obj).parent().toggleClass('selected');
}

function checkInArray(sBookmarkList, iCateNo) {
    if (sBookmarkList == null) return false;
    var aBookmarkList = sBookmarkList.split("|");
    for (var i = 0; i < aBookmarkList.length; i++) {
        if (aBookmarkList[i] == iCateNo) {
            return true;
        }
    }
    return false;
}