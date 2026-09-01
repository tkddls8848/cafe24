$(function(){
    // All check
    $('#product_select_all').on('click', function() {
        var _status = $(this).data('status');

        $('[id^="basket_chk_id_"]').each(function(){
            var bChecked = $(this).is(":checked");

            if (_status == 'off') {
                if (bChecked === false) $(this).prop('checked', true);
            } else {
                $(this).prop('checked', false);
            }
        });

        $(this).data('status', _status == 'off' ? 'on' : 'off');
        fixedLayerPriceSet();
    });
  

    var fixedLayerPriceSet = function() {
        var iSumPrice = 0;
        var iCheckPrdCnt = 0;
        $('[id^="basket_chk_id_"]').each(function(){
            if ($(this).prop('checked') === true) {
                var sCheckId = $(this).attr('id');
                var aTemp = sCheckId.split('_');
                var iCheckId = aTemp[3];
                var iQuantity = $('#quantity_id_'+iCheckId).val();
                var iProductPrice = aBasketProductData[iCheckId].product_sum_price * iQuantity;
                iSumPrice = iSumPrice + iProductPrice;
                iCheckPrdCnt = iCheckPrdCnt + 1;
             }
        });
        if (iCheckPrdCnt > 0) {
            var sTotalPrice = SHOP_PRICE_FORMAT.toShopPrice(iSumPrice);
            $('#checked_order_count').html('<strong>' + sprintf(__('%s'),iCheckPrdCnt) + '</strong>' +'item(s) selected').css('padding-bottom','5px');
            $('#checked_order_price').html('Amount Due <strong><em><span id="checked_total_order_price">'+sTotalPrice+'</span></em></strong>').css('padding-bottom','5px');

            var sPriceRef = SHOP_PRICE_FORMAT.shopPriceToSubPrice(iSumPrice);
            if (sPriceRef != '') $('#checked_order_price').find('strong').append(sPriceRef);
        } else {
            fixLayerPriceRest();
        }        
    };


    var fixLayerPriceRest = function() {
        $('#checked_order_count, #checked_order_price').html('').css('padding-bottom','0');
    };

    fixLayerPriceRest();


    $('[id^="basket_chk_id_"]').on('click', function(e) {
        fixedLayerPriceSet();
    });
});


function selBasketDel(id) {
    $('[id^="'+BASKET_CHK_ID_PREFIX+'"]').prop('checked', false);
    $('[id="'+id+'"]').prop('checked', true);
    Basket.deleteBasket();
}
