/**
 * Q&A
 */
$(function(){
    $('.xans-product-qna a').on('click', function(e) {
        e.preventDefault();

        var no = $(this).attr('href').replace(/(\S*)[?&]no=(\d+)(\S*)/g, '$2');
        var $obj = $('#product-qna-read_'+no);


        if ($obj.length > 0) {
            if ($obj.css('display') =='none') {
                $obj.show();
            } else {
                $obj.hide();
            }
            return;
        }

        QNA.getReadData($(this));

    });
});

var PARENT = '';

var OPEN_QNA = '';

var QNA = {
    getReadData : function(obj, eType)
    {
        if (obj != undefined) {
            PARENT = obj;
            var sHref = obj.attr('href');
            var pNode = obj.parents('tr');
            var pass_check = '&pass_check=F';
        } else {
            var sHref = PARENT.attr('href');
            var pNode = PARENT.parents('tr');
            var pass_check = '&pass_check=T';
        }

        var sQuery = sHref.split('?');

        var sQueryNo = sQuery[1].split('=');
        if (OPEN_QNA == sQueryNo[1]) {
            $('#product-qna-read').remove();
            OPEN_QNA = '';
            return false;
        } else {
            OPEN_QNA = sQueryNo[1];
        }

        $.ajax({
            url : '/exec/front/board/product/6?'+sQuery[1]+pass_check,
            dataType: 'json',
            success: function(data) {
                $('#product-qna-read').remove();

                var sPath = document.location.pathname;
                var sPattern = /^\/product\/(.+)\/([0-9]+)(\/.*)/;
                var aMatchResult = sPath.match(sPattern);

                if (aMatchResult) {
                    var iProductNo = aMatchResult[2];
                } else {
                    var iProductNo = getQueryString('product_no');
                }

                var aHtml = [];


                if (false === data.read_auth && eType == undefined) {
                    customAlert(decodeURIComponent(data.alertMSG), function() {
                        if (data.returnUrl != undefined) {
                            location.replace("/member/login.html?returnUrl=" + data.returnUrl);
                        }
                    });
                    return false;
                }

                if (data.is_secret == true) {

                    aHtml.push('<form name="SecretForm_6" id="SecretForm_6">');
                    aHtml.push('<input type="text" name="a" style="display:none;">');
                    aHtml.push('<div class="view"><p>Password <input type="password" id="secure_password" name="secure_password" onkeydown="if (event.keyCode == 13) '+data.action_pass_submit+'"> <input type="button" value="Submit" onclick="'+data.action_pass_submit+'"></p></div>');
                    aHtml.push('</form>');
                } else {

                    if (data.read['content_image'] != null) {
                        var sImg = data.read['content_image'];
                    } else {
                        var sImg = '';
                    }

                    aHtml.push('<div class="view">');
					aHtml.push('<div id="ec-ucc-media-box-'+ data.read['no'] +'"></div>');
                    aHtml.push('<p>'+data.read['content']+'</p>');
                    aHtml.push('<p>'+sImg+'</p>');
                    aHtml.push('<p class="ec-base-button"><span class="gLeft">');
                    if (data.write_auth == true) {
                        aHtml.push('<a href="#none" onclick="EC_PRODUCT_FRONT_BOARD_QNA.modify(' + data.no + ', ' + iProductNo + ');" class="btnEm sizeS">수정</a>');
                    }
                    aHtml.push('</span></p>');
                    aHtml.push('<p class="ec-base-button"><span class="gRight">');
                    aHtml.push('<a href="#none" class="btnNormalFix sizeS ' + data.read['report_open_btn'] +'" onclick="'+ data.read['report_open_layer_action'] +'">Report</a>');
                    aHtml.push('</span</p>');
                    aHtml.push('</div>');


                    if (data.comment != undefined && data.comment.length != undefined) {
                        aHtml.push('<ul class="boardComment">');
                        for (var i=0; data.comment.length > i; i++) {

                            if (data.comment[i]['comment_reply_css'] == undefined) {
                                aHtml.push('<li>');
                                aHtml.push('<strong class="name">'+data.comment[i]['member_icon']+' '+data.comment[i]['comment_name']+'</strong>');
                                aHtml.push('<span class="date">'+data.comment[i]['comment_write_date']+'</span>');
                                aHtml.push('<span class="grade '+data.use_point+'"><img src="//img.echosting.cafe24.com/skin/base_en_US/board/ico_point'+data.comment[i]['comment_point_count']+'.gif" alt="'+data.comment[i]['comment_point_count']+'Points" /></span>');
                                if (data.comment[i]['comment_reply_display'] == true) {
                                    aHtml.push('<span class="button">'+'<a href="#none" onclick="'+data.comment[i]['action_comment_reply']+'" class="btnNormal" >Comment <img src="//img.echosting.cafe24.com/skin/base/common/btn_icon_reply.gif" alt="" /></a>'+'</span>');
                                }
                                aHtml.push('<p class="comment">'+data.comment[i]['comment_icon_lock']+' '+data.comment[i]['comment_content']+'</p>');
                                aHtml.push('</li>');
                            } else {

                                aHtml.push('<li class="replyArea">');
                                aHtml.push('<strong class="name">'+data.comment[i]['member_icon']+' '+data.comment[i]['comment_name']+'</strong>');
                                aHtml.push('<span class="date">'+data.comment[i]['comment_write_date']+'</span>');
                                aHtml.push('<p class="comment">'+data.comment[i]['comment_icon_lock']+' '+data.comment[i]['comment_content']+'</p>');
                                aHtml.push('</li>');
                            }
                        }
                        aHtml.push('</ul>');
                    }


                    if (data.comment_write != undefined) {
                        aHtml.push('<form name="commentWriteForm_6'+data.key+'" id="commentWriteForm_6'+data.key+'">');
                        aHtml.push('<div class="memoCont">');
                        aHtml.push('<div class="writer">');
                        aHtml.push('<div class="user"><div class="nameArea">이름 '+data.comment_write['comment_name']+' 비밀번호 '+data.comment_write['comment_password']);
                        if (data.comment_write['comment_secret_display'] == true) {
                            aHtml.push('<label class="secret">'+data.comment_write['secure']+' 비밀 댓글</label>');
                        }
                        aHtml.push('<p class="ec-base-help '+data.comment_write['password_rule_help_display_class']+'">Combination in 10-16 characters containing at least two of the followings: upper and lower case letters/numbers/special letters</p>');
                        aHtml.push('</div>');
                        aHtml.push(''+data.comment_write['comment']+'<a href="#none" onclick="'+data.comment_write['action_comment_insert']+'" class="btnSubmit">댓글 작성</a></div>');
                        aHtml.push('<p class="rating '+data.comment_write['use_point']+'">'+data.comment_write['comment_point']+'</p>');
                        aHtml.push('<p class="text '+data.comment_write['use_comment_size']+'">'+data.comment_write['comment_byte']+' / '+data.comment_write['comment_size']+' byte</p>');
                        aHtml.push('<p class="captcha '+data.comment_write['use_captcha']+'">'+data.comment_write['captcha_image']+data.comment_write['captcha_refresh']+data.comment_write['captcha']+'<img src="//img.echosting.cafe24.com/skin/base_en_US/product/ico_information.gif" alt="" />* Please type with no dashes.(case sensitive)</p>');
                        aHtml.push('</div>');
                        aHtml.push('</div>');
                        aHtml.push('</form>');
                    }


                    if (data.comment_reply != undefined) {
                        aHtml.push('<form name="commentReplyWriteForm_6'+data.key+'" id="commentReplyWriteForm_6'+data.key+'" style="display:none">');
                        aHtml.push('<div class="memoCont reply">');
                        aHtml.push('<div class="writer">');
                        aHtml.push('<div class="user"><div class="nameArea">이름 '+data.comment_reply['comment_name']+' 비밀번호 '+data.comment_reply['comment_password']);
                        if (data.comment_reply['comment_secret_display'] == true) {
                            aHtml.push('<label class="secret">'+data.comment_reply['secure']+' 비밀 댓글</label>');
                        }
                        aHtml.push('<p class="ec-base-help '+data.comment_write['password_rule_help_display_class']+'">Combination in 10-16 characters containing at least two of the followings: upper and lower case letters/numbers/special letters</p>');
                        aHtml.push('</div>');
                        aHtml.push(''+data.comment_reply['comment']+'<a href="#none" onclick="'+data.comment_reply['action_comment_insert']+'" class="btnSubmit">댓글 작성</a></div>');
                        aHtml.push('<p class="text '+data.comment_reply['use_comment_size']+'">'+data.comment_reply['comment_byte']+' / '+data.comment_reply['comment_size']+' byte</p>');
                        aHtml.push('<p class="captcha '+data.comment_reply['use_captcha']+'">'+data.comment_reply['captcha_image']+data.comment_reply['captcha_refresh']+data.comment_reply['captcha']+'<img src="//img.echosting.cafe24.com/skin/base_en_US/product/ico_information.gif" alt="" />* Please type with no dashes.(case sensitive)</p>');
                        aHtml.push('</div>');
                        aHtml.push('</div>');
                        aHtml.push('</form>');
                    }

                    if (data.comment_secret != undefined) {
                        aHtml.push('<form name="commentSecretForm_4'+data.key+'" id="commentSecretForm_4'+data.key+'" style="display:none">');
                        aHtml.push('<div class="commentSecret">');
                        aHtml.push('<p>Password : '+data.comment_secret['secure_password']);
                        aHtml.push(' <a href="#none" onclick="'+data.comment_secret['action_secret_submit']+'" class="btnNormal">submit</a>');
                        aHtml.push(' <a href="#none" onclick="'+data.comment_secret['action_secret_cancel']+'" class="btnNormal">cancel</a></p>');
                        aHtml.push('</div>');
                        aHtml.push('</form>');
                    }
                }

                $(pNode).after('<tr id="product-qna-read'+data.key+'"><td colspan="6">'+aHtml.join('')+'</td></tr>');


                PRODUCT_COMMENT.comment_colspan(pNode);

                APP_BOARD_REPORT.setReportLayerActions(data.read['report_action'], data.read['report_close_layer_action'], data.write_auth);

                if (data.comment_write != undefined && data.comment_write['use_comment_size'] == '') PRODUCT_COMMENT.comment_byte(6, data.key);
                if (data.comment_reply != undefined && data.comment_write['use_comment_size'] == '') PRODUCT_COMMENT.comment_byte(6, data.key, 'commentReplyWriteForm');
				if (data.read['ucc_url']) $('#ec-ucc-media-box-'+ data.read['no']).replaceWith(APP_BOARD_UCC.getPreviewElement(data.read['ucc_url']));
            }
        });
    },

    END : function() {},

    getReadDataList: function(sArticleNoListQueryString, oArticleSectionElementMap) {
        $.ajax({
            url : '/exec/front/board/spread/6?spread_flag=T&&pass_check=F&' + sArticleNoListQueryString,
            dataType: 'json',
            success: function(aDataList) {
                aDataList.forEach(function(data) {
                    $('#product-qna-read').remove();

                    var sPath = document.location.pathname;
                    var sPattern = /^\/product\/(.+)\/([0-9]+)(\/.*)/;
                    var aMatchResult = sPath.match(sPattern);

                    if (aMatchResult) {
                        var iProductNo = aMatchResult[2];
                    } else {
                        var iProductNo = getQueryString('product_no');
                    }

                    var aHtml = [];


                    if (false === data.read_auth && eType == undefined) {
                        customAlert(decodeURIComponent(data.alertMSG), function() {
                        if (data.returnUrl != undefined) {
                            location.replace("/member/login.html?returnUrl=" + data.returnUrl);
                        }
                    });
                        return false;
                    }

                    if (data.is_secret == true) {

                        aHtml.push('<form name="SecretForm_6" id="SecretForm_6">');
                        aHtml.push('<input type="text" name="a" style="display:none;">');
                        aHtml.push('<div class="view"><p>Password <input type="password" id="secure_password" name="secure_password" onkeydown="if (event.keyCode == 13) '+data.action_pass_submit+'"> <input type="button" value="Submit" onclick="'+data.action_pass_submit+'"></p></div>');
                        aHtml.push('</form>');
                    } else {

                        if (data.read['content_image'] != null) {
                            var sImg = data.read['content_image'];
                        } else {
                            var sImg = '';
                        }

                        aHtml.push('<div class="view">');
                        aHtml.push('<div id="ec-ucc-media-box-'+ data.read['no'] +'"></div>');
                        aHtml.push('<p>'+data.read['content']+'</p>');
                        aHtml.push('<p>'+sImg+'</p>');
                        aHtml.push('<p class="ec-base-button"><span class="gLeft">');
                        if (data.write_auth == true) {
                            aHtml.push('<a href="#none" onclick="EC_PRODUCT_FRONT_BOARD_QNA.modify(' + data.no + ', ' + iProductNo + ');" class="btnEm sizeS">수정</a>');
                        }
                        aHtml.push('</span></p>');
                        aHtml.push('<p class="ec-base-button"><span class="gRight">');
                        aHtml.push('<a href="#none" class="btnNormalFix sizeS ' + data.read['report_open_btn'] +'" onclick="'+ data.read['report_open_layer_action'] +'">Report</a>');
                        aHtml.push('</span</p>');
                        aHtml.push('</div>');


                        if (data.comment != undefined && data.comment.length != undefined) {
                            aHtml.push('<ul class="boardComment">');
                            for (var i=0; data.comment.length > i; i++) {

                                if (data.comment[i]['comment_reply_css'] == undefined) {
                                    aHtml.push('<li>');
                                    aHtml.push('<strong class="name">'+data.comment[i]['member_icon']+' '+data.comment[i]['comment_name']+'</strong>');
                                    aHtml.push('<span class="date">'+data.comment[i]['comment_write_date']+'</span>');
                                    aHtml.push('<span class="grade '+data.use_point+'"><img src="//img.echosting.cafe24.com/skin/base_en_US/board/ico_point'+data.comment[i]['comment_point_count']+'.gif" alt="'+data.comment[i]['comment_point_count']+'Points" /></span>');
                                    if (data.comment[i]['comment_reply_display'] == true) {
                                        aHtml.push('<span class="button">'+'<a href="#none" onclick="'+data.comment[i]['action_comment_reply']+'" class="btnNormal" >Comment <img src="//img.echosting.cafe24.com/skin/base/common/btn_icon_reply.gif" alt="" /></a>'+'</span>');
                                    }
                                    aHtml.push('<p class="comment">'+data.comment[i]['comment_icon_lock']+' '+data.comment[i]['comment_content']+'</p>');
                                    aHtml.push('</li>');
                                } else {

                                    aHtml.push('<li class="replyArea">');
                                    aHtml.push('<strong class="name">'+data.comment[i]['member_icon']+' '+data.comment[i]['comment_name']+'</strong>');
                                    aHtml.push('<span class="date">'+data.comment[i]['comment_write_date']+'</span>');
                                    aHtml.push('<p class="comment">'+data.comment[i]['comment_icon_lock']+' '+data.comment[i]['comment_content']+'</p>');
                                    aHtml.push('</li>');
                                }
                            }
                            aHtml.push('</ul>');
                        }


                        if (data.comment_write != undefined) {
                            aHtml.push('<form name="commentWriteForm_6'+data.key+'" id="commentWriteForm_6'+data.key+'">');
                            aHtml.push('<div class="memoCont">');
                            aHtml.push('<div class="writer">');
                            aHtml.push('<div class="user"><div class="nameArea">이름 '+data.comment_write['comment_name']+' 비밀번호 '+data.comment_write['comment_password']);
                            if (data.comment_write['comment_secret_display'] == true) {
                                aHtml.push('<label class="secret">'+data.comment_write['secure']+' 비밀 댓글</label>');
                            }
                            aHtml.push('<p class="ec-base-help '+data.comment_write['password_rule_help_display_class']+'">Combination in 10-16 characters containing at least two of the followings: upper and lower case letters/numbers/special letters</p>');
                            aHtml.push('</div>');
                            aHtml.push(''+data.comment_write['comment']+'<a href="#none" onclick="'+data.comment_write['action_comment_insert']+'" class="btnSubmit">댓글 작성</a></div>');
                            aHtml.push('<p class="rating '+data.comment_write['use_point']+'">'+data.comment_write['comment_point']+'</p>');
                            aHtml.push('<p class="text '+data.comment_write['use_comment_size']+'">'+data.comment_write['comment_byte']+' / '+data.comment_write['comment_size']+' byte</p>');
                            aHtml.push('<p class="captcha '+data.comment_write['use_captcha']+'">'+data.comment_write['captcha_image']+data.comment_write['captcha_refresh']+data.comment_write['captcha']+'<img src="//img.echosting.cafe24.com/skin/base_en_US/product/ico_information.gif" alt="" />* Please type with no dashes.(case sensitive)</p>');
                            aHtml.push('</div>');
                            aHtml.push('</div>');
                            aHtml.push('</form>');
                        }


                        if (data.comment_reply != undefined) {
                            aHtml.push('<form name="commentReplyWriteForm_6'+data.key+'" id="commentReplyWriteForm_6'+data.key+'" style="display:none">');
                            aHtml.push('<div class="memoCont reply">');
                            aHtml.push('<div class="writer">');
                            aHtml.push('<div class="user"><div class="nameArea">이름 '+data.comment_reply['comment_name']+' 비밀번호'+data.comment_reply['comment_password']);
                            if (data.comment_reply['comment_secret_display'] == true) {
                                aHtml.push('<label class="secret">'+data.comment_reply['secure']+' 비밀 댓글</label>');
                            }
                            aHtml.push('<p class="ec-base-help '+data.comment_write['password_rule_help_display_class']+'">Combination in 10-16 characters containing at least two of the followings: upper and lower case letters/numbers/special letters</p>');
                            aHtml.push('</div>');
                            aHtml.push(''+data.comment_reply['comment']+'<a href="#none" onclick="'+data.comment_reply['action_comment_insert']+'" class="btnSubmit">댓글 작성</a></div>');
                            aHtml.push('<p class="text '+data.comment_reply['use_comment_size']+'">'+data.comment_reply['comment_byte']+' / '+data.comment_reply['comment_size']+' byte</p>');
                            aHtml.push('<p class="captcha '+data.comment_reply['use_captcha']+'">'+data.comment_reply['captcha_image']+data.comment_reply['captcha_refresh']+data.comment_reply['captcha']+'<img src="//img.echosting.cafe24.com/skin/base_en_US/product/ico_information.gif" alt="" />* Please type with no dashes.(case sensitive)</p>');
                            aHtml.push('</div>');
                            aHtml.push('</div>');
                            aHtml.push('</form>');
                        }

                        if (data.comment_secret != undefined) {
                            aHtml.push('<form name="commentSecretForm_4'+data.key+'" id="commentSecretForm_4'+data.key+'" style="display:none">');
                            aHtml.push('<div class="commentSecret">');
                            aHtml.push('<p>Password : '+data.comment_secret['secure_password']);
                            aHtml.push(' <a href="#none" onclick="'+data.comment_secret['action_secret_submit']+'" class="btnNormal">submit</a>');
                            aHtml.push(' <a href="#none" onclick="'+data.comment_secret['action_secret_cancel']+'" class="btnNormal">cancel</a></p>');
                            aHtml.push('</div>');
                            aHtml.push('</form>');
                        }
                    }

                    var pNode = oArticleSectionElementMap[data.no];
                    $(pNode).after('<tr id="product-qna-read'+data.key+'"><td colspan="6">'+aHtml.join('')+'</td></tr>');


                    PRODUCT_COMMENT.comment_colspan(pNode);

                    if (data.read['report_action'] && data.read['report_close_layer_action']) {
                        APP_BOARD_REPORT.setReportLayerActions(data.read['report_action'], data.read['report_close_layer_action'], data.write_auth);
                    }

                    if (data.comment_write != undefined && data.comment_write['use_comment_size'] == '') PRODUCT_COMMENT.comment_byte(6, data.key);
                    if (data.comment_reply != undefined && data.comment_write['use_comment_size'] == '') PRODUCT_COMMENT.comment_byte(6, data.key, 'commentReplyWriteForm');
                    if (data.read['ucc_url']) $('#ec-ucc-media-box-'+ data.read['no']).replaceWith(APP_BOARD_UCC.getPreviewElement(data.read['ucc_url']));
                });
            }
        });
    }
};