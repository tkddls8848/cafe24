/**
 * 카테고리 마우스 오버 이미지
 * 카테고리 대,중,소,하위분류까지 출력 - 세로형
 * 210827 서정환 수정
 */

$(document).ready(function(){

    var methods = {
        aCategory    : [],
        aSubCategory : {},

        get: function()
        {
             $.ajax({
                url : '/exec/front/Product/SubCategory',
                dataType: 'json',
                success: function(aData) {

                    if (aData == null || aData == 'undefined') return;
                    for (var i=0; i<aData.length; i++)
                    {
                        var sParentCateNo = aData[i].parent_cate_no;

                        if (!methods.aSubCategory[sParentCateNo]) {
                            methods.aSubCategory[sParentCateNo] = [];
                        }

                        methods.aSubCategory[sParentCateNo].push( aData[i] );
                    }
                }
            });
        },

        getParam: function(sUrl, sKey) {

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

        show: function(overNode, iCateNo, index) {
            var oParentNode = overNode;
            var aHtml = [];
            var sMyCateList = localStorage.getItem("myCateList");
            if (methods.aSubCategory[iCateNo] != undefined) {
                aHtml.push('<ul class="sub-category sub_cate01">');
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
                    var anchorHtml = '<a href="/product/list.html'+this.param+'" class="view" cate="'+this.param+'" data-i18n="LIST.PRD_CATE_NO_'+this.cate_no+'" onmouseover="subMenuon(this);" data-i18n-new>'+this.name;
                    // 1뎁스: 하위 카테고리가 있을 때만 <i> 태그 추가
                    if (methods.aSubCategory[sNextParentNo] != undefined) {
                        if (
                            $('.header_A').length > 0 ||
                            $('.header_C_a').length > 0 ||
                            $('.header_C_b').length > 0)
                            {
                            anchorHtml += '<i aria-hidden="true" class="icon icoArrowRight"></i>';
                        }
                    }
                    anchorHtml += '</a>';

                    aHtml.push(anchorHtml);

                    if (methods.aSubCategory[sNextParentNo] != undefined) {
                        aHtml.push('<ul class="sub-category-middle sub_cate02">');
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

                            var anchorHtml2 = '<a href="/product/list.html'+this.param+'" class="view" cate="'+this.param+'" data-i18n="LIST.PRD_CATE_NO_'+this.cate_no+'" onmouseover="subMenuon(this);" data-i18n-new>'+this.name;
                            // 2뎁스: 하위 카테고리가 있을 때만 <i> 태그 추가
                            if (methods.aSubCategory[sNextParentNo2] != undefined) {
                                if ($('.header_A').length > 0 || $('.header_C_a').length > 0 || $('.header_C_b').length > 0) {
                                    anchorHtml2 += '<i aria-hidden="true" class="icon icoArrowRight"></i>';
                                }
                            }
                            anchorHtml2 += '</a>';
                            aHtml.push(anchorHtml2);

                            if (methods.aSubCategory[sNextParentNo2] != undefined) {
                                aHtml.push('<ul class="sub-category-child sub_cate03">');

                                $(methods.aSubCategory[sNextParentNo2]).each(function() {
                                    aHtml.push('<li class="noChild" id="cate'+this.cate_no+'">');
                                    var sCateSelected = (checkInArray(sMyCateList, this.cate_no) == true) ? ' selected' : '';
                                    var anchorHtml3 = '<a href="/product/list.html'+this.param+'" class="view" cate="'+this.param+'" onmouseover="subMenuon(this);" data-i18n="LIST.PRD_CATE_NO_'+this.cate_no+'" data-i18n-new>'+this.name+'</a>';
                                    // 3뎁스: 하위 카테고리가 없으므로 <i> 태그 추가 로직 삭제
                                    aHtml.push(anchorHtml3);
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

            if($(oParentNode).find('.sub_cate01').length <= 0){
                $(oParentNode).append(aHtml.join(''));
            }

            if ( $('.header_B').length > 0 ) {
                let isDuplicate = false;
                const aCategory1 = methods.aSubCategory[iCateNo]; // 1depth
            
                // 2depth 생성
                if (!aCategory1) return;

                const firstDepthName = overNode.children('a').text().trim();
            
                aCategory1.forEach(function(category1) {
                    const cateNo2 = category1.cate_no;
                    const aCategory2 = methods.aSubCategory[cateNo2]; // 3depth
            
                    if ($(`.cate_list[data-name="${firstDepthName}"]`).length > 0) {
                        isDuplicate = true;
                    }
                });
                
                // 중복 체크
                if (isDuplicate) {
                    return;
                }

                let html = `<div class="sub_cate02">`;
            
                aCategory1.forEach(function(category1) {
                    const cateNo2 = category1.cate_no;
                    const aCategory2 = methods.aSubCategory[cateNo2];
            
                    html += `<ul class="cate_list" data-name="${firstDepthName}">`;
                    html += `<li class="cate-name"><a href="/product/list.html${category1.param}">${category1.name}</a></li>`;
            
                    if (aCategory2 !== undefined) {
                        aCategory2.forEach(function(category2) {
                            html += `<li><a href="/product/list.html${category2.param}">${category2.name}</a></li>`;
                        });
                    }
            
                    html += `</ul>`;
                });
            
                html += `</div>`;
                $('#header .gnb_wrap .inner').append(html);
            } else if($('.header_D').length > 0) {
                $('#header .cate_list').each(function () {
                    const $cateListItem = $(this);
                
                    // 1뎁스 이름 추출
                    const cateName = $cateListItem.find('.cate_depth01 .title').text().trim();
                    let iCateNo = null;
                
                    // 1depth name → cate_no 찾기
                    let found = false;
                    for (let parentNo in methods.aSubCategory) {
                        const subList = methods.aSubCategory[parentNo];
                        for (let i = 0; i < subList.length; i++) {
                            if (subList[i].name === cateName) {
                                iCateNo = subList[i].cate_no;
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }
                
                    if (!iCateNo || !methods.aSubCategory[iCateNo]) return;
                
                    const depth2List = methods.aSubCategory[iCateNo];
                    let depth2Name;
                
                    // 2depth 생성
                    if ($cateListItem.find('.cate_depth02').length === 0) {
                        let html2 = ['<ul class="cate_depth02">'];
                        depth2List.forEach(function (d2) {
                            const selected = checkInArray(sMyCateList, d2.cate_no) ? ' selected' : '';
                            depth2Name = d2.name
                            html2.push('<li class="' + selected + '"><a href="/product/list.html' + d2.param + '" class="view" cate="' + d2.param + '">' + d2.name + '</a></li>');
                        });
                        html2.push('</ul>');
                        $cateListItem.append(html2.join(''));
                    }
                
                    // 3depth 생성
                    if ($cateListItem.find('.cate_depth03').length === 0) {
                        let html3 = ['<ul class="cate_depth03">'];
                        depth2List.forEach(function (d2) {
                            const depth3List = methods.aSubCategory[d2.cate_no];
                
                            if (depth3List && depth3List.length > 0) {
                                html3.push('<li data-name="' + depth2Name + '"><ul>');
                                depth3List.forEach(function (d3) {
                                    const selected = checkInArray(sMyCateList, d3.cate_no) ? ' selected' : '';
                                    html3.push('<li class="' + selected + '"><a href="/product/list.html' + d3.param + '" class="view" cate="' + d3.param + '">' + d3.name + '</a></li>');
                                });
                                html3.push('</ul></li>');
                            }
                        });
                        html3.push('</ul>');
                        $cateListItem.append(html3.join(''));
                    }
                });       
            } else if (
                $('.header_search_A').length > 0
            ) {
                setTimeout(() => {
                        let gnbInner = $('.gnb_wrap .depth01');
                        let html = [];
                        const depth1 = overNode.children('a').text().trim();

                        // 중복 체크 (Duplicate check)
                        let isDuplicate = false;
                        const depth2List = methods.aSubCategory[iCateNo];
                        gnbInner.find('a.title').each(function () {
                            const existingText = $(this).text().trim();
                            if (existingText === depth1) {
                                isDuplicate = true;
                                return false; // break
                            }
                        });

                    if (isDuplicate) return;
                    
                    html.push('<li style="order:' + index + '">');

                    let depth1Link = '/product/list.html?cate_no=' + iCateNo;
                    html.push('<a href="' + depth1Link + '" class="title">' + depth1 + '</a>');
    
                    // 각 1depth 항목 (Each 1st depth item)
                    if (depth2List) {
                        html.push('<ul class="depth02">');

                        $.each(depth2List, function (_, depth2) {
                            html.push('<li>');

                            // 3depth 목록 (3rd depth list)
                            const depth3List = methods.aSubCategory[depth2.cate_no];

                            // <a> 태그 시작 (Start <a> tag)
                            let anchorHtml = '<a href="/product/list.html' + depth2.param + '" class="view">' + depth2.name;

                            if (depth3List && depth3List.length > 0) {
                                anchorHtml += '<i aria-hidden="true" class="icon icoArrowBottom"></i>';
                            }

                            anchorHtml += '</a>';
                            html.push(anchorHtml);

                            if (depth3List && depth3List.length > 0) {
                                html.push('<ul class="depth03">');

                                $.each(depth3List, function (_, depth3) {
                                    const depth4List = methods.aSubCategory[depth3.cate_no];

                                    let anchorHtml = '<a href="/product/list.html' + depth3.param + '" class="view">' + depth3.name;

                                    // 4depth 목록 (4th depth list)
                                    if (depth4List && depth4List.length > 0) {
                                        anchorHtml += '<i aria-hidden="true" class="icon icoArrowBottom"></i>';
                                    }

                                    anchorHtml += '</a>';
                                    html.push('<li>' + anchorHtml);

                                    // 4depth ul 생성 (Create 4th depth ul)
                                    if (depth4List && depth4List.length > 0) {
                                        html.push('<ul class="depth04">');
                                        $.each(depth4List, function (_, depth4) {
                                            let depth4Anchor = '<a href="/product/list.html' + depth4.param + '" class="view">' + depth4.name + '</a>';
                                            html.push('<li>' + depth4Anchor + '</li>');
                                        });
                                        html.push('</ul>'); // .depth04
                                    }

                                    html.push('</li>'); // 3depth li
                                });

                                html.push('</ul>'); // .depth03
                            }

                            html.push('</li>'); // 2depth li
                        });

                        html.push('</ul>'); // .depth02
                    }

                    // 결과 삽입
                    if (html.length > 0) {
                        gnbInner.append(html.join(''));
                    }
                }, 80);
            } else if ($('.header_search_B').length > 0) {
                const gnbInner = $('.gnb_wrap .depth01');
                let html = [];
                const depth1Name = overNode.children('a').text().trim();
            
                const existingTitles = new Set();
                gnbInner.find('.title').each(function () {
                    existingTitles.add($(this).text().trim());
                });
            
                const depth1List = methods.aSubCategory[iCateNo];
                if (!depth1List || depth1List.length === 0) return;
            
                $.each(depth1List, function (_, depth1) {
                    const depth2Name = depth1.name.trim();

                    // 중복 체크
                    if (existingTitles.has(depth2Name)) {
                        return true;
                    }
            
                    const depth1CateNo = depth1.cate_no;
                    const depth2List = methods.aSubCategory[depth1CateNo];
                    if (!depth2List || depth2List.length === 0) return;
            
                    html.push('<li data-name="'+depth1Name+'" style="order:' + index + '">');
                    html.push('<span class="title">' + depth2Name + '</span>');
                    html.push('<ul class="depth02">');
            
                    $.each(depth2List, function (_, depth2) {
                        const depth2CateNo = depth2.cate_no;
                        const depth3List = methods.aSubCategory[depth2CateNo];
            
                        html.push('<li>');
                        html.push(
                            '<a href="/product/list.html' + depth2.param + '" class="view">' +
                            depth2.name +
                            '<i aria-hidden="true" class="icon icoArrowBottom"></i>' +
                            '</a>'
                        );
            
                        if (depth3List && depth3List.length > 0) {
                            html.push('<ul class="depth03">');
                            $.each(depth3List, function (_, depth3) {
                                html.push(
                                    '<li>' +
                                    '<a href="/product/list.html' + depth3.param + '" class="view">' +
                                    depth3.name +
                                    '</a>' +
                                    '</li>'
                                );
                            });
                            html.push('</ul>');
                        }
            
                        html.push('</li>');
                    });
            
                    html.push('</ul>');
                    html.push('</li>');
                });
            
                if (html.length > 0) {
                    gnbInner.append(html.join(''));
                }
            }
                       
            if (window.i18nextCafe24) {
            	i18nextCafe24.translate('data-i18n-new');
            } else if ($('.header_search_C').length > 0) {
                const gnbInner = $('.gnb_wrap .inner');
                let html = [];
                const depth1Name = overNode.children('a').text().trim();
            
                const depth1List = methods.aSubCategory[iCateNo];
                if (!depth1List || depth1List.length === 0) return;

                // 중복 체크
                if (gnbInner.find('.cate_list[data-name="' + depth1Name + '"]').length > 0) {
                    return true; // continue
                }

                html.push('<div class="cate_list" data-name="'+depth1Name+'">');
                html.push('<ul class="depth02">');
            
                $.each(depth1List, function (_, depth1) {
                    const depth2Name = depth1.name.trim();
                    const depth1CateNo = depth1.cate_no;
                    const depth2List = methods.aSubCategory[depth1CateNo];
                    if (!depth2List || depth2List.length === 0) return;

                    $.each(depth2List, function (_, depth2) {
                        const depth2CateNo = depth2.cate_no;
                        const depth3List = methods.aSubCategory[depth2CateNo];
            
                        html.push('<li>');
                        html.push(
                            '<a href="/product/list.html' + depth2.param + '">' +
                            depth2.name +
                            '</a>'
                        );
            
                        if (depth3List && depth3List.length > 0) {
                            html.push('<ul class="depth03">');
                            $.each(depth3List, function (_, depth3) {
                                html.push(
                                    '<li>' +
                                    '<a href="/product/list.html' + depth3.param + '">' +
                                    depth3.name +
                                    '</a>' +
                                    '</li>'
                                );
                            });
                            html.push('</ul>');
                        }
            
                        html.push('</li>');
                    });
                });

                html.push('</ul>');
                html.push('</div>');
            
                if (html.length > 0) {
                    gnbInner.append(html.join(''));
                }
            }
                       
            if (window.i18nextCafe24) {
            	i18nextCafe24.translate('data-i18n-new');
            }
        },

        close: function() {
            $('.sub-category').remove();
        }
    };

    methods.get();

    $('#header .xans-layout-category > ul > li').mouseenter(function(e) {
        let $this = $(this).addClass('on');
        index = $this.index() + 1;
        iCateNo = Number(methods.getParam($this.find('a').attr('href'), 'cate_no'));

        if (!iCateNo) iCateNo = Number(methods.getParamSeo($this.find('a').attr('href')));
        if (!iCateNo) return;
        
        methods.show($this, iCateNo, index);
    }).mouseleave(function(e) {
        $(this).removeClass('on');

        methods.close();
    });

    if (
        $('.header_search_A').length > 0 ||
        $('.header_search_B').length > 0 ||
        $('.header_search_C').length > 0
    ) {
        setTimeout(() => {
            const list = $('#header .xans-layout-category > ul > li');
            list.each(function () {
                const $this = $(this);
                const index = $this.index();
                let iCateNo = Number(methods.getParam($this.find('a').attr('href'), 'cate_no'));

                if (!iCateNo) {
                    iCateNo = Number(methods.getParamSeo($this.find('a').attr('href')));
                }
                if (!iCateNo && iCateNo !== 0) return;

                methods.show($this, iCateNo, index);
            });
        }, 50);
    }
});

function subMenuon(obj) {
	$(obj).parent().find('li').removeClass('on');
	$(obj).parent().addClass('on');
	$(obj).parent().siblings().removeClass("on");
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
