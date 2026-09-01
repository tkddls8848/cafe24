/**
 * 상품 정보 표시 설정
 *
 * @property {string} label - 항목명 표시 텍스트 (운영자 수정 가능)
 *   - $ prefix: 부분 매칭 (예: '$할인가' → 'VIP할인가', '최고회원할인가' 매칭)
 * @property {string} class - 적용할 데코레이션 클래스 (고정)
 * @property {string} detailLabel - 상세 페이지 레이블 (할인판매가/최적할인가 둘 다 있을 때 표시)
 * @property {number} order - 상세 페이지 노출 순서 (낮을수록 위)
 */
window.styleMap = {
    product_name: {
        label: '상품명',
        class: 'deco_title',
        order: 1
    },
    price: {
        label: '판매가',
        class: 'deco_price',
        order: 2
    },
    sale_price: {
        label: '할인판매가',
        class: 'deco_sale_price',
        detailLabel: '할인판매가',
        order: 3
    },
    optimum_price: {
        label: '최적할인가',
        class: 'deco_optimum_price',
        detailLabel: '최적할인가',
        order: 5
    },
    member_sale_price: {
        label: '$할인가',
        class: 'deco_member_sale_price',
        detailLabel: '할인판매가',
        order: 4
    },
    member_optimum_price: {
        label: '$최적가',
        class: 'deco_member_optimum_price',
        detailLabel: '최적할인가',
        order: 6
    }
};

/**
 * 스타일 클래스 정의
 */
window.styleClasses = {
    strikethrough: 'deco_strikethrough',
    memberSaleDisplayText: 'member_sale_display_text',
    memberOptimumDisplayText: 'member_optimum_display_text',
    memberOptimumPriceLabel: 'member_optimum_price_label'
};
