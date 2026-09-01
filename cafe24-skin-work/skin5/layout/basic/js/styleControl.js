/**
 * 텍스트 정규화 (공백 제거)
 */
const normalizeKey = (text) => text?.replace(/\s+/g, '') || '';

/**
 * styleMap에서 항목명 매칭
 * @param {string} key - 정규화된 항목명
 * @returns {Object|null} { id, class } 또는 null
 */
const findStyleMatch = (key) => {
    if (!window.styleMap || !key) return null;

    for (const id in window.styleMap) {
        const config = window.styleMap[id];
        if (!config?.label) continue;

        const label = config.label;

        // 정확 매칭 우선 ($ 없는 label)
        if (!label.startsWith('$') && key === label) {
            return { id, class: config.class };
        }

        // 부분 매칭 ($ 붙은 label)
        if (label.startsWith('$') && key.includes(label.substring(1))) {
            return { id, class: config.class };
        }
    }

    return null;
};

/**
 * inline style 제거 (img 태그 제외)
 */
const removeInlineStyles = (element) => {
    element.querySelectorAll('*[style]:not(img)').forEach(el => el.removeAttribute('style'));
};

/**
 * 상품 목록 처리 (메인/목록/검색)
 */
function processListItems(listItems) {
    if (!listItems?.length) return;

    let hasDiscountPrice = false;
    let hasSalePrice = false;
    let hasOptimumPrice = false;
    let priceElement = null;
    const highlightedItems = [];

    // 상품명 처리 (첫 번째 li 기준)
    const firstItem = listItems[0];
    const prdListItem = firstItem?.closest('.prdList__item');
    const nameElement = prdListItem?.querySelector('.description .name');

    if (nameElement && window.styleMap?.product_name) {
        nameElement.classList.add(window.styleMap.product_name.class);
        removeInlineStyles(nameElement);
        nameElement.querySelector('strong.title')?.classList.add('displaynone');
    }

    // li 항목 처리
    listItems.forEach(item => {
        const titleSpans = item?.querySelectorAll('strong.title span');
        if (!titleSpans?.length) return;

        titleSpans.forEach(titleSpan => {
            const key = normalizeKey(titleSpan.textContent);
            const liElement = titleSpan.closest('li');
            if (!liElement) return;

            // 항목명 숨김
            titleSpan.closest('strong.title')?.classList.add('displaynone');

            // styleMap 매칭
            const matched = findStyleMatch(key);

            if (matched) {
                // 강조 대상 항목
                liElement.classList.add(matched.class);
                removeInlineStyles(liElement);
                highlightedItems.push({ liElement, matched });

                // 부가세 표시문구 숨김
                liElement.querySelector('#span_product_tax_type_text')?.classList.add('displaynone');

                // 할인가 유형 체크
                if (['sale_price', 'member_sale_price'].includes(matched.id)) {
                    hasSalePrice = true;
                    hasDiscountPrice = true;
                }
                if (['optimum_price', 'member_optimum_price'].includes(matched.id)) {
                    hasOptimumPrice = true;
                    hasDiscountPrice = true;
                }

                // 판매가 저장
                if (matched.id === 'price') {
                    priceElement = liElement;
                }
            } else {
                // 비강조 항목 숨김
                liElement.classList.add('displaynone');
            }
        });
    });

    // 판매가 취소선 적용
    if (hasDiscountPrice && priceElement && window.styleClasses?.strikethrough) {
        priceElement.classList.add(window.styleClasses.strikethrough);
    }

    // 할인/최적 레이블 추가 (둘 다 있을 때만, 최적할인가만 표시)
    if (hasSalePrice && hasOptimumPrice && window.styleClasses?.memberOptimumPriceLabel) {
        highlightedItems.forEach(({ liElement, matched }) => {
            const config = window.styleMap?.[matched.id];

            if (config?.detailLabel && ['optimum_price', 'member_optimum_price'].includes(matched.id)) {
                const valueSpan = liElement.querySelector(':scope > span');
                const innerSpan = valueSpan?.querySelector('span'); // 내부 span 찾기
                const existingLabel = innerSpan?.querySelector(`.${window.styleClasses.memberOptimumPriceLabel}`);

                if (innerSpan && !existingLabel) {
                    const label = document.createElement('span');
                    label.className = window.styleClasses.memberOptimumPriceLabel;
                    label.textContent = ` ${config.detailLabel}`;
                    innerSpan.appendChild(label);
                }
            }
        });
    }

    // 하나만 있을 때 single 클래스 추가
    if ((hasSalePrice && !hasOptimumPrice) || (!hasSalePrice && hasOptimumPrice)) {
        highlightedItems.forEach(({ liElement, matched }) => {
            if (['sale_price', 'member_sale_price', 'optimum_price', 'member_optimum_price'].includes(matched.id)) {
                liElement.classList.add('single');
            }
        });
    }
}

/**
 * 상품 상세 처리
 */
function processDetailItems(rows) {
    if (!rows?.length) return;

    let hasDiscountPrice = false;
    let hasSalePrice = false;
    let hasOptimumPrice = false;
    let priceRow = null;
    const highlightedRows = [];
    const rowDataMap = new Map();

    // 1단계: 모든 tr 처리
    rows.forEach(tr => {
        const thSpan = tr.querySelector('th span');
        if (!thSpan) return;

        const key = normalizeKey(thSpan.textContent);
        const matched = findStyleMatch(key);

        if (matched) {
            // 강조 대상 항목
            highlightedRows.push(tr);
            rowDataMap.set(tr, matched);

            // 항목명 숨김
            thSpan.closest('th')?.classList.add('displaynone');

            // 클래스 추가
            tr.classList.add(matched.class);

            // inline style 제거
            const td = tr.querySelector('td');
            if (td) {
                removeInlineStyles(td);
                // deco_와 price가 둘 다 포함된 클래스일 때만 colspan 추가
                if (matched.class.includes('deco_') && matched.class.includes('price')) {
                    td.setAttribute('colspan', '2');
                }
            }

            // 할인가 유형 체크
            if (['sale_price', 'member_sale_price'].includes(matched.id)) {
                hasSalePrice = true;
                hasDiscountPrice = true;
            }
            if (['optimum_price', 'member_optimum_price'].includes(matched.id)) {
                hasOptimumPrice = true;
                hasDiscountPrice = true;
            }

            // 판매가 저장
            if (matched.id === 'price') {
                priceRow = tr;
            }
        }
    });

    // 2단계: 순서 재정렬 (order 기준 정렬)
    const tbody = rows[0]?.closest('tbody');
    if (tbody && highlightedRows.length) {
        // order 값으로 정렬 (낮을수록 위)
        const sortedRows = highlightedRows.sort((a, b) => {
            const orderA = window.styleMap?.[rowDataMap.get(a)?.id]?.order || 999;
            const orderB = window.styleMap?.[rowDataMap.get(b)?.id]?.order || 999;
            return orderA - orderB;
        });

        // 정렬된 순서대로 맨 위에 배치
        sortedRows.reverse().forEach(tr => tbody.prepend(tr));
    }

    // 3단계: 판매가 취소선 적용
    if (hasDiscountPrice && priceRow && window.styleClasses?.strikethrough) {
        priceRow.classList.add(window.styleClasses.strikethrough);
    }

    // 4단계: member 등급명 이동 처리
    highlightedRows.forEach(tr => {
        const rowData = rowDataMap.get(tr);

        // member_sale_price 등급명 이동
        if (rowData?.id === 'member_sale_price') {
            const td = tr.querySelector('td');
            if (td) {
                const spans = td.querySelectorAll(':scope > span');
                if (spans.length > 1) {
                    const gradeSpan = spans[0];
                    const gradeText = gradeSpan.textContent.trim();
                    const valueSpan = spans[1].querySelector('span[id*="sale"]');

                    if (valueSpan && gradeText && window.styleClasses?.memberSaleDisplayText) {
                        const existingLabel = valueSpan.querySelector(`.${window.styleClasses.memberSaleDisplayText}`);
                        if (!existingLabel) {
                            const gradeLabel = document.createElement('span');
                            gradeLabel.className = window.styleClasses.memberSaleDisplayText;
                            gradeLabel.textContent = ` ${gradeText}`;
                            valueSpan.appendChild(gradeLabel);
                            gradeSpan.classList.add('displaynone');
                        }
                    }
                }
            }
        }

        // member_optimum_price 등급명 이동
        if (rowData?.id === 'member_optimum_price') {
            const td = tr.querySelector('td');
            if (td) {
                const spans = td.querySelectorAll(':scope > span');
                if (spans.length > 1) {
                    const gradeSpan = spans[0];
                    const gradeText = gradeSpan.textContent.trim();
                    const valueSpan = spans[1].querySelector('span[id^="span_optimum"]');

                    if (valueSpan && gradeText && window.styleClasses?.memberOptimumDisplayText) {
                        const existingLabel = valueSpan.querySelector(`.${window.styleClasses.memberOptimumDisplayText}`);
                        if (!existingLabel) {
                            const gradeLabel = document.createElement('span');
                            gradeLabel.className = window.styleClasses.memberOptimumDisplayText;
                            gradeLabel.textContent = ` ${gradeText}`;
                            valueSpan.appendChild(gradeLabel);
                            gradeSpan.classList.add('displaynone');
                        }
                    }
                }
            }
        }
    });

    // 5단계: 할인/최적 레이블 추가 및 중복 등급명 숨김 (둘 다 있을 때만)
    if (hasSalePrice && hasOptimumPrice) {
        highlightedRows.forEach(tr => {
            const rowData = rowDataMap.get(tr);
            const config = window.styleMap?.[rowData?.id];

            // member_sale_price 등급명 숨김
            if (rowData?.id === 'member_sale_price' && window.styleClasses?.memberSaleDisplayText) {
                const td = tr.querySelector('td');
                if (td) {
                    const gradeLabel = td.querySelector(`.${window.styleClasses.memberSaleDisplayText}`);
                    if (gradeLabel) {
                        gradeLabel.classList.add('displaynone');
                    }
                }
            }

            // 최적할인가 레이블 추가
            if (config?.detailLabel && ['optimum_price', 'member_optimum_price'].includes(rowData?.id) && window.styleClasses?.memberOptimumPriceLabel) {
                const td = tr.querySelector('td');
                if (td) {
                    const valueSpan = td.querySelector('span[id^="span_optimum"]');
                    const existingLabel = valueSpan?.querySelector(`.${window.styleClasses.memberOptimumPriceLabel}`);

                    if (valueSpan && !existingLabel) {
                        const label = document.createElement('span');
                        label.className = window.styleClasses.memberOptimumPriceLabel;
                        label.textContent = ` ${config.detailLabel}`;
                        valueSpan.appendChild(label);
                    }
                }
            }
        });
    }

    // 하나만 있을 때 single 클래스 추가
    if ((hasSalePrice && !hasOptimumPrice) || (!hasSalePrice && hasOptimumPrice)) {
        highlightedRows.forEach(tr => {
            const rowData = rowDataMap.get(tr);
            if (rowData && ['sale_price', 'member_sale_price', 'optimum_price', 'member_optimum_price'].includes(rowData.id)) {
                tr.classList.add('single');
            }
        });
    }
}

/**
 * 상품 목록 동적 변경 감지
 */
const observeProductList = () => {
    const containers = document.querySelectorAll('.xans-product-listnormal, .xans-product-listmain, .xans-product-listnew');

    containers.forEach(container => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;

                    const items = node.matches?.('.prdList__item')
                        ? [node]
                        : [...(node.querySelectorAll?.('.prdList__item') || [])];

                    items.forEach(item => {
                        const ul = item.querySelector('ul.spec');
                        if (ul) {
                            processListItems([...ul.querySelectorAll('li')]);
                        }
                    });
                });
            });
        });

        observer.observe(container, { childList: true, subtree: true });
    });
};

/**
 * 초기화
 */
(() => {
    // 상품 목록
    document.querySelectorAll('.prdList__item').forEach(item => {
        const ul = item.querySelector('ul.spec');
        if (ul) {
            processListItems([...ul.querySelectorAll('li')]);
        }
    });

    // 동적 상품 감지
    observeProductList();

    // 상품 상세
    document.querySelectorAll('.xans-product-detail table.info_table tbody').forEach(tbody => {
        processDetailItems([...tbody.querySelectorAll('tr')]);
    });
})();

/**
 * 위시리스트 버튼 후처리
 */
document.addEventListener('DOMContentLoaded', () => {
    const updateWishStatus = (button) => {
        const img = button.querySelector('img');
        if (!img) return;

        const status = img.getAttribute('icon_status');
        button.classList.toggle('active', status === 'on');
    };

    const handleWishClick = (button) => {
        const img = button.querySelector('img');
        if (img) {
            img.click();
            setTimeout(() => updateWishStatus(button), 300);
        }
    };

    document.querySelectorAll('.top_btn .wish').forEach(button => {
        const img = button.querySelector('img');
        if (img) {
            button.style.display = 'flex';
            setTimeout(() => updateWishStatus(button), 300);
            button.addEventListener('click', () => handleWishClick(button));
        }
    });
});
