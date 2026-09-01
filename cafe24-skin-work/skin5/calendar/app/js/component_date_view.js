class Cafe24AppCalendarDateView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    CAC.currentElement = this;
    CAC_UTIL.is_mobile = document.documentElement.clientWidth <= 766;

    moment.locale('ko', {
      months: '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
      monthsShort: '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
      weekdays: '일요일_월요일_화요일_수요일_목요일_금요일_토요일'.split('_'),
      weekdaysShort: '일_월_화_수_목_금_토'.split('_'),
      weekdaysMin: '일_월_화_수_목_금_토'.split('_'),
      longDateFormat: {
        LT: 'A h:mm',
        LTS: 'A h:mm:ss',
        L: 'YYYY.MM.DD.',
        LL: 'YYYY년 MMMM D일',
        LLL: 'YYYY년 MMMM D일 A h:mm',
        LLLL: 'YYYY년 MMMM D일 dddd A h:mm',
        l: 'YYYY.MM.DD.',
        ll: 'YYYY년 MMMM D일',
        lll: 'YYYY년 MMMM D일 A h:mm',
        llll: 'YYYY년 MMMM D일 dddd A h:mm',
      },
      calendar: {
        sameDay: '오늘 LT',
        nextDay: '내일 LT',
        nextWeek: 'dddd LT',
        lastDay: '어제 LT',
        lastWeek: '지난주 dddd LT',
        sameElse: 'L',
      },
      relativeTime: {
        future: '%s 후',
        past: '%s 전',
        s: '몇 초',
        ss: '%d초',
        m: '1분',
        mm: '%d분',
        h: '한 시간',
        hh: '%d시간',
        d: '하루',
        dd: '%d일',
        M: '한 달',
        MM: '%d달',
        y: '일 년',
        yy: '%d년',
      },
      dayOfMonthOrdinalParse: /\d{1,2}(일|월|주)/,
      ordinal: function (number, period) {
        switch (period) {
          case 'd':
          case 'D':
          case 'DDD':
            return number + '일';
          case 'M':
            return number + '월';
          case 'w':
          case 'W':
            return number + '주';
          default:
            return number;
        }
      },
      meridiemParse: /오전|오후/,
      isPM: function (token) {
        return token === '오후';
      },
      meridiem: function (hour, minute, isUpper) {
        return hour < 12 ? '오전' : '오후';
      },
    });

    if (window.top !== window.self) {
      //window.top.document.querySelector('.app-body').getAttribute('data-device') 변경을 감지하여 모바일, PC 구분
      const appBodyEl = window.top.document?.querySelector('.app-body') ?? null;
      if (appBodyEl && appBodyEl?.getAttribute('data-device') !== 'undefined') {
        const observer = new MutationObserver(async (mutationsList, observer) => {
          for (let mutation of mutationsList) {
            if (mutation.type === 'attributes') {
              CAC_UTIL.is_mobile = appBodyEl?.getAttribute('data-device') === 'mo';
              // cafe24-app-calendar 태그 삭제후 다시 그리기
              this.shadowRoot.innerHTML = '';
              await this.render();
            }
          }
        });
        observer.observe(appBodyEl, { attributes: true });
      }
    }
  }

  async connectedCallback() {
    // set moment locale
    if (CAC_UTIL.isEcEditor() && document.querySelectorAll('cafe24-app-calendar').length > 1) {
      customAlert('한 페이지에 한 개의 캘린더만 추가할 수 있습니다.');
      return;
    }
    this.shadowRoot.innerHTML = '';
    await this.render();
  }

  async render() {
    const [swiperStyle, resetStyle, calendarStyle, froalaStyle] = await Promise.all([
      CAC_UTIL.loadCSS('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'),
      CAC_UTIL.loadCSS('/calendar/app/css/list/reset.css'),
      CAC_UTIL.loadCSS('/calendar/app/css/list/common.css'),
      CAC_UTIL.loadCSS('/calendar/app/css/froala_style.min.css'),
    ]);

    this.shadowRoot.appendChild(swiperStyle);
    this.shadowRoot.appendChild(resetStyle);
    this.shadowRoot.appendChild(calendarStyle);
    this.shadowRoot.appendChild(froalaStyle);
    const template = CAC_UTIL.isMobile()
      ? document.getElementById('calendar-app-template-date-view-mo').content
      : document.getElementById('calendar-app-template-date-view-pc').content;
    this.shadowRoot.appendChild(template.cloneNode(true));

    // todo 리스트 형에서도 처리가 차이가 날때 바꿔도 됨
    await CAC_LIST_START();
  }
}
