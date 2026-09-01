CAC_VIEW = {
  isDev: true, // 개발모드
  calendar: null, // 캘린더 DOM
  basic_setting: null, // 기본설정
  calendar_list: null, // 캘린더 데이터
  calendar_group_list: null, // 캘린더 그룹 데이터
  promotion_data: null, // 마켓프로모션 데이터
  season_data: null, // 시즌이벤트 데이터
  group_id: null, // 캘린더 그룹코드
  holiday: null, // 공휴일
  debounceSearch: null, // 검색 디바운스
  token: null, // 토큰
  member_id: null, // 멤버아이디
  group_no: null, // 그룹번호

  set basicSetting(value) {
    this.basic_setting = value;
  },

  set calendarList(value) {
    this.calendar_list = value;
  },
  get calendarList() {
    if (!!this.group_id) {
      return this.calendar_list.filter((event) => event.calendar_group_id === this.group_id);
    }
    return this.calendar_list;
  },

  set calendarGroupList(value) {
    this.calendar_group_list = value;
  },
  get calendarGroupList() {
    if (!!this.group_id) {
      return this.calendar_group_list.filter(
        (group) => group._id === this.group_id && group.use_single_calendar === 'T',
      );
    } else {
      // calendar_group
      const calendarGroup = this.calendar_group_list
        .filter((group) => group.category === 'MY' && group.type === 'MY' && group.display_front === 'T')
        .sort((a, b) => {
          return a.sort - b.sort;
        });

      // 시즌 이벤트
      const seasonEventGroup = this.calendar_group_list
        .filter((group) => group.category === 'SEASON' && group.type === 'SEASON_EVENT' && group.display_front === 'T')
        .sort((a, b) => {
          return a.sort - b.sort;
        });

      // 마켓프로모션
      const promotionGroup = this.calendar_group_list
        .filter(
          (group) => group.category === 'PROMOTION' && group.type === 'MARKET_PROMOTION' && group.display_front === 'T',
        )
        .sort((a, b) => {
          return a.sort - b.sort;
        });

      return [...calendarGroup, ...seasonEventGroup, ...promotionGroup];
    }
  },
  set groupId(value) {
    this.group_id = value;
  },

  set holidayList(value) {
    this.holiday = value;
  },
  get holidayList() {
    return this.holiday;
  },

  get eventList() {
    const eventList = [];
    this.calendar_list &&
      this.calendarList.forEach((event) => {
        if (this.group_id && event.calendar_group_id !== this.group_id) {
          return;
        }

        const group = this.calendarGroupList.find((group) => group._id === event.calendar_group_id);
        eventList.push({
          ...event,
          title: he.decode(event.title),
          color: group?.group_color ?? '',
          id: event._id,
          start: event.is_day === 'T' ? moment(event.start_datetime).format('YYYY-MM-DD') : event.start_datetime || '',
          end:
            !moment(event.end_datetime).isSame(moment(event.start_datetime), 'day') || event.is_day === 'T'
              ? moment(event.end_datetime).add(1, 'day').format('YYYY-MM-DD')
              : event.end_datetime || '',
          groupId: event.calendar_group_id || '',
          allDay: !moment(event.end_datetime).isSame(moment(event.start_datetime), 'day') || event.is_day === 'T',
          is_promotion: false,
        });
      });
    return eventList;
  },

  // 캘린더 데이터를 파싱하여 이벤트 리스트로 반환
  parseEvent(calendarList) {
    const eventList = [];
    calendarList.forEach((event) => {
      if (this.group_id && event.calendar_group_id !== this.group_id) {
        return;
      }

      const group = this.calendarGroupList.find((group) => group._id === event.calendar_group_id);
      eventList.push({
        ...event,
        title: he.decode(event.title),
        color: group?.group_color ?? '',
        id: event._id,
        start: event.is_day === 'T' ? moment(event.start_datetime).format('YYYY-MM-DD') : event.start_datetime || '',
        end:
          !moment(event.end_datetime).isSame(moment(event.start_datetime), 'day') || event.is_day === 'T'
            ? moment(event.end_datetime).add(1, 'day').format('YYYY-MM-DD')
            : event.end_datetime || '',
        groupId: event.calendar_group_id || '',
        allDay: !moment(event.end_datetime).isSame(moment(event.start_datetime), 'day') || event.is_day === 'T',
        is_promotion: false,
      });
    });
    return eventList;
  },

  parsePromotionEvent(promotionData) {
    const promotionGroup = this.calendarGroupList.find(
      (group) => group.category === 'PROMOTION' && group.type === 'MARKET_PROMOTION',
    );

    if (!promotionGroup) return;
    const promotionList = [];
    promotionData.forEach((item) => {
      if (promotionGroup?.includes?.includes(item.market_code) === false) return;

      promotionList.push({
        _id: item.board_no,
        id: item.board_no,
        description: item.body,
        title: `[${item.market_name}] ${he.decode(item.promotion_title?.trim() ?? '') || he.decode(item.title?.trim() ?? '')}`,
        color: promotionGroup?.group_color || '',
        is_promotion: true,
        start_datetime: item.market_reg_timestamp,
        end_datetime: item.market_reg_timestamp,
        start: item.market_reg_timestamp,
        end: item.market_reg_timestamp,
        is_day: 'F',
        allDay: true,
        is_complete: 'F',
        is_important: 'F',
        calendar_group_id: promotionGroup?._id,
        calendar_group_category: 'PROMOTION',
        calendar_group_type: 'MARKET_PROMOTION',
      });
    });
    return promotionList;
  },

  parseSeasonEvent(seasonEventData) {
    const seasonEventList = [];
    const seasonEventGroup = this.calendarGroupList.find(
      (group) => group.category === 'SEASON' && group.type === 'SEASON_EVENT',
    );
    if (!seasonEventGroup) return;

    seasonEventData.forEach((item) => {
      if (seasonEventGroup?.includes?.includes(item.type) === false) return;

      seasonEventList.push({
        _id: item.id,
        id: item.id,
        title: he.decode(item.title),
        color: seasonEventGroup?.group_color || '',
        is_promotion: true,
        start_datetime: item.start_datetime,
        end_datetime: !!item.end_datetime ? item.end_datetime : item.start_datetime,
        start: item.start_datetime,
        end: !!item.end_datetime ? moment(item.end_datetime).add(1, 'day').format('YYYY-MM-DD') : '',
        is_day: 'T',
        allDay: true,
        is_complete: item.is_complete ?? 'F',
        is_important: item.is_important ?? 'F',
        calendar_group_id: seasonEventGroup?._id,
        calendar_group_category: 'SEASON',
        calendar_group_type: 'SEASON_EVENT',
      });
    });
    return seasonEventList;
  },

  // 접근권한 체크
  checkPermission: function () {
    /**
     * 프론트에서 전체캘린더 노출시 기본설정의 접근권한을 타고,
     * 단독은 그룹의 접근 권한을 타고
     * this.basic_setting.front_use_permission === T:전체|F:회원만
     */
    let isTrue = true;
    if (this.group_id === null) {
      if (this.member_id === CAFE24API.MALL_ID) return isTrue;
      if (this.basic_setting?.front_use_permission === 'T') {
        const Index = this.basic_setting?.front_permission.find((item) => item.group_no === CAC_VIEW.group_no);

        if (!Index) {
          isTrue = false;
        }
      }
    } else {
      if (this.member_id === CAFE24API.MALL_ID) return isTrue;
      const group = this.calendarGroupList.find((group) => group._id === this.group_id);
      if (group?.single_calendar_use_front_permission === 'T') {
        const Index = group?.single_calendar_front_permission.find((item) => item.group_no === CAC_VIEW.group_no);
        if (!Index) {
          isTrue = false;
        }
      }
    }

    return isTrue;
  },

  // 캘린더 타이틀
  setCalendarTitle: function () {
    if (this.group_id == null || this.group_id === '') {
      // 전체 캘린더명 설정
      const groupCalendarName = CAC_CAFE24API.getSiteName() ?? '';
      CAC$('.eShopName', CAC.getRoot()).text(`${he.decode(groupCalendarName)} 캘린더`);
    } else {
      // 단독 캘린더 그룹명
      const groupCalendarName =
        this.calendarGroupList[0]?.use_front_group_name === 'T'
          ? this.calendarGroupList[0]?.front_group_name
          : this.calendarGroupList[0]?.group_name;

      // 단독 캘린더명 설정
      CAC$('.eShopName', CAC.getRoot()).text(`${he.decode(groupCalendarName) || ''} 캘린더`);
    }
  },
  // 캘린더 그룹
  setCalendarGroup: function (groupCode) {
    CAC$('.calendar_filter .calendar_list', CAC.getRoot()).html('');
    if (this.calendarGroupList.length === 0) {
      CAC$('.calendar_filter .btn_select', CAC.getRoot()).css('padding-right', '0px');
      CAC$('.calendar_filter .btn_select', CAC.getRoot()).css('height', '28px');
      CAC$('.calendar_filter .calendar_list_wrap', CAC.getRoot()).remove();

      // .calendar_filter > button  remove btn_select class
      CAC$('.calendar_filter > button', CAC.getRoot()).removeClass('btn_select');

      return;
    }

    let groupHtml = '';
    this.calendarGroupList.forEach(function (item) {
      let group = document.createElement('div');
      group.classList.add('calendar_group');
      group.setAttribute('group-code', item.group_code);
      groupHtml += `
				<li>
					<label class="label_ckeck">
						<input type="checkbox" class="event_filter" name="event_filter" data-type="group" id="${item._id}" value="${item._id}" checked>
						<span class="check_mark
						" style="background:${item.group_color}; border-color:${item.group_color}"></span>
						<span class="check_text">${item.use_front_group_name === 'T' ? item.front_group_name : item.group_name}</span>
					</label>
				</li>
			`;
    });

    CAC$('.calendar_filter .calendar_list', CAC.getRoot()).html(groupHtml);
  },

  getStartCalendar: function (source) {
    return CAC_UTIL.isMobile()
      ? source?.single_calendar_front_start_calendar_mobile || source?.front_start_calendar_mobile
      : source?.single_calendar_front_start_calendar || source?.front_start_calendar;
  },

  /**
   * 초기 뷰 설정
   * @returns {string}
   */
  computedInitialView: function () {
    let startCalendar;
    // 단독캘린더시
    if (!!this.group_id) {
      const calendarGroup = this.calendarGroupList.find((group) => group._id === this.group_id);
      startCalendar = this.getStartCalendar(calendarGroup);
    } else {
      startCalendar = this.getStartCalendar(this.basic_setting);
    }

    switch (startCalendar) {
      case 'W':
        return 'timeGridWeek';
      case 'D':
        return 'timeGridDay';
      default:
        return 'dayGridMonth';
    }
  },

  /**
   * 시작 요일 설정
   * @returns {number}
   */
  getStartWeek: function (source) {
    return source?.single_calendar_front_start_week || source?.front_start_week;
  },
  computedStartWeek: function () {
    let startWeek;
    // 단독캘린더시
    if (!!this.group_id) {
      const calendarGroup = this.calendarGroupList.find((group) => group._id === this.group_id);
      startWeek = this.getStartWeek(calendarGroup);
    } else {
      startWeek = this.getStartWeek(this.basic_setting);
    }

    return startWeek === 'M' ? 1 : 0;
  },

  /**
   * 표시 제한 설정
   * @returns {*|number}
   */
  computedDisplayLimit: function () {
    return this.basic_setting?.display_limit || 999;
  },

  /**calendar_list sorting */
  sortCalendarList: function (a, b) {
    // 1. 프로모션 여부 비교
    if (a?.is_promotion && !b?.is_promotion) {
      return 1;
    } else if (!a?.is_promotion && b?.is_promotion) {
      return -1;
    }

    // 2. 종일 여부 비교
    if (a?.is_day === 'T' && b?.is_day === 'F') {
      return -1;
    } else if (a?.is_day === 'F' && b?.is_day === 'T') {
      return 1;
    }

    return moment(a?.start_datetime).isBefore(moment(b?.start_datetime)) ? -1 : 1;
  },

  datesSetHandler: async function (dateInfo) {
    if (CAC_VIEW.calendarGroupList.length === 0) return;
    const beginDate = moment(dateInfo.start).format('YYYY-MM-DD');
    const endDate = moment(dateInfo.end).format('YYYY-MM-DD');

    const beginDateTime = moment(dateInfo.start).format('YYYY-MM-DD') + ' 00:00';
    const endDateTime = moment(dateInfo.end).format('YYYY-MM-DD') + ' 23:59';

    // 월달이동시 원격데이터 요청
    const calendar_list = await CAC_DATA.loadRemoteCalendarData(beginDateTime, endDateTime);
    const filterCalendarList = this.group_id
      ? calendar_list?.lists
      : calendar_list?.lists.filter((item) => item.display_front !== 'F');
    this.calendarList = filterCalendarList ?? [];

    // 마켓프로모션 데이터 요청
    const promotionGroup = this.calendarGroupList.find(
      (group) => group.category === 'PROMOTION' && group.type === 'MARKET_PROMOTION',
    );

    if (!this.group_id && promotionGroup?.display_front !== 'T') {
      CAC_VIEW.promotion_data = [];
    } else {
      const promotionRemoteData =
        (promotionGroup && (await CAC_DATA.loadMarketPromotionData(beginDate, endDate))) || [];
      const filterPromotionData = this.group_id
        ? promotionRemoteData
        : promotionRemoteData.filter((item) => item.display_front !== 'F');
      CAC_VIEW.promotion_data = promotionGroup ? CAC_VIEW.parsePromotionEvent(filterPromotionData) : [];
    }

    // 시즌 이벤트 데이터 요청
    const seasonEventGroup = this.calendarGroupList.find(
      (group) => group.category === 'SEASON' && group.type === 'SEASON_EVENT',
    );

    if (!this.group_id && seasonEventGroup?.display_front !== 'T') {
      CAC_VIEW.season_data = [];
    } else {
      const seasonEventRemoteData =
        (seasonEventGroup && (await CAC_DATA.loadSeasonEventData(beginDate, endDate))) || [];
      const filterSeasonEventData = this.group_id
        ? seasonEventRemoteData
        : seasonEventRemoteData.filter((item) => item.display_front !== 'F');
      CAC_VIEW.season_data = seasonEventGroup ? CAC_VIEW.parseSeasonEvent(filterSeasonEventData) : [];
    }

    // 새 이벤트를 기존 이벤트에 추가
    this.calendar_list = [...this.calendarList];

    // 이벤트 필터 적용
    this.applyEventFilter();
  },

  // 일반 캘린더 (pc)
  renderCalendar: function () {
    // 일반 캘린더
    let calendarEl = CAC.getRoot().getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
      locale: 'ko',
      buttonText: {
        today: '오늘',
        month: '월',
        week: '주',
        day: '일',
        list: 'list',
      },
      titleFormat: {
        year: 'numeric',
        month: 'long',
        //day: 'numeric'
      },
      dayHeaderFormat: {
        weekday: 'long',
      },
      dayHeaderContent: (args) => {
        let headerDay = document.createElement('span');
        let headerWeek = document.createElement('span');

        headerDay.classList.add('date');

        if (args.view.type === 'timeGridDay' || args.view.type === 'timeGridWeek') {
          if (moment(args.date).format('YYYY-MM-DD') in CAC_VIEW.holiday) {
            headerDay.style.color = 'red';
            headerWeek.style.color = 'red';
          }
          headerDay.innerHTML =
            args.view.type === 'timeGridDay'
              ? moment(args.date).format('Do').replace('일', '')
              : moment(args.date).format('Do');
          headerWeek.innerHTML =
            args.view.type === 'timeGridDay' ? moment(args.date).format(' dd') : moment(args.date).format(' (dd)');
          return {
            html: headerDay.outerHTML + headerWeek.outerHTML,
          };
        } else if (args.view.type === 'dayGridMonth') {
          return moment(args.date).format('dddd');
        }
      },
      dayCellContent: (info) => {
        let number = document.createElement('a');
        number.classList.add('fc-daygrid-day-number');
        number.innerHTML = info.dayNumberText.replace('일', '').replace('日', '');

        let holidayEl = document.createElement('span');
        holidayEl.style.color = 'red';

        // 공휴일 설정
        if (CAC_VIEW.holiday) {
          if (moment(info.date).format('YYYY-MM-DD') in CAC_VIEW.holiday) {
            holidayEl.innerHTML = CAC_VIEW.holiday[moment(info.date).format('YYYY-MM-DD')];
            number.style.color = 'red';
          }
        }

        if (info.view.type === 'dayGridMonth') {
          return {
            html: number.outerHTML + holidayEl.outerHTML,
          };
        }
        return {
          domNodes: [],
        };
      },
      // style
      initialView: this.computedInitialView(),
      height: 'auto',
      slotMinTime: '00:00',
      slotMaxTime: '24:00',
      navLinks: false, // 요일, 날짜 클릭 시 일/주 단위 화면으로 넘어감
      expandRows: true,
      editable: false, // 드래그 수정 여부
      selectable: false, //
      nowIndicator: true, //
      showNonCurrentDates: true, // 이전, 다음 달 날짜 표시
      fixedWeekCount: false,
      datesSet: function (dateInfo) {
        CAC_VIEW.datesSetHandler(dateInfo);
      },
      eventOrder: ['-is_promotion', '-is_day', 'start_datetime', 'end_datetime'],
      slotEventOverlap: false,
      firstDay: this.computedStartWeek(),
      dayMaxEvents: this.computedDisplayLimit(), // "more" 표시 전 최대 이벤트 갯수. true - 셀 높이에 따라 결정
      scrollTime:
        (this.computedInitialView() === 'timeGridDay' || this.computedInitialView() === 'timeGridWeek') &&
        moment().subtract(8, 'hover').format('HH:mm:ss'),

      eventDisplay: 'block',

      headerToolbar: {
        left: '',
        center: 'prev,title,next,today',
        right: 'timeGridDay,timeGridWeek,dayGridMonth',
      },

      ///event layer
      eventClick: async (info) => {
        info.jsEvent.preventDefault();
        CAC$('.fc-more-popover', CAC.getRoot()).remove();

        const eventInfo = info.event;
        const eventTitle = eventInfo.title;
        const eventDesc = eventInfo.extendedProps.description;
        const eventUrl = eventInfo.extendedProps.external_link_url;
        const eventBoard = eventInfo.extendedProps.link_board_article;
        const eventImage = eventInfo.extendedProps?.link_products;
        const eventCategories = eventInfo.extendedProps?.link_categories;

        const layer = CAC$('#layerCalendarEvent', CAC.getRoot());
        const layerTitle = layer.find('h1');
        const layerCont = layer.find('.cont');
        if (!eventInfo.extendedProps.is_promotion) {
          CAC_VIEW.renderThirdPartyCalGroups(
            layer,
            eventInfo.extendedProps.calendar_group_id || '',
            eventInfo.extendedProps._id || '',
            eventTitle,
            eventInfo.extendedProps.start_datetime || '',
            eventInfo.extendedProps.end_datetime || '',
            '',
            eventInfo.extendedProps.is_day || 'F',
          );
        } else {
          layer.find('.calendar_groups').html('');
        }

        layer.css('display', 'block');
        layerTitle.text(eventTitle);
        layerCont.find('div').remove();

        if (eventInfo.extendedProps.is_day === 'T') {
          if (
            moment(eventInfo.extendedProps.start_datetime).isSame(eventInfo.extendedProps.end_datetime, 'day') ||
            eventInfo.end === null
          ) {
            layerCont.append(
              `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD')}</div>`,
            );
          } else {
            layerCont.append(
              `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD')} ~ ${moment(eventInfo.extendedProps.end_datetime).format('YYYY-MM-DD')}</div>`,
            );
          }
        } else {
          layerCont.append(
            `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD HH:mm')} ~ ${moment(eventInfo.extendedProps.end_datetime).format('YYYY-MM-DD HH:mm')}</div>`,
          );
        }

        if (eventImage && eventImage.length > 0) {
          let imagesHTML = '';

          for (const item of eventImage) {
            const productHTML = await this.renderProductDetailView(item);
            if (productHTML) {
              imagesHTML += productHTML;
            }
          }
          if (!!imagesHTML) {
            layerCont.append(`<div class="image"><ul>${imagesHTML}</ul></div>`);
          }
        }

        if (eventCategories && eventCategories.length > 0) {
          const categoriesHTML = await this.generateCategoriesHTML(eventCategories);
          if (!!categoriesHTML) {
            layerCont.append(categoriesHTML);
          }
        }

        if (typeof eventBoard === 'object' && Object.keys(eventBoard).length > 0) {
          let urlHTML = `<a href="${CAC_VIEW.getBoardLink(
            eventBoard.board_name,
            eventBoard.board_no,
            eventBoard.article_no,
          )}" target="_blank">${eventBoard?.title}</a>`;
          layerCont.append(`<div class="board">${urlHTML}</div>`);
        }

        if (!eventUrl == '' || !eventUrl == undefined) {
          const newUrl =
            eventUrl.includes('http://') || eventUrl.includes('https://')
              ? encodeURI(eventUrl)
              : 'http://' + encodeURIComponent(eventUrl);
          let urlHTML = `<a href="${newUrl}" target="_blank">${eventUrl}</a>`;
          layerCont.append(`<div class="url">${urlHTML}</div>`);
        }

        if (!eventDesc == '' || !eventDesc == undefined) {
          layerCont.append(`<div class="description fr-view">${eventDesc}</div>`);
        }
      },
      eventContent: (info) => {
        let titleProfix = '';
        if (info.event.extendedProps.is_day !== 'T' && info.event.extendedProps.is_promotion !== true) {
          titleProfix = moment(info.event.extendedProps.start_datetime).format('A hh:mm');
        }

        let dom = null;

        dom = document.createElement('div');
        dom.className = 'fc-event-title';
        dom.style.padding = '2px';
        dom.style.cursor = 'pointer';

        if (info.event.extendedProps.is_complete === 'T') {
          const del = document.createElement('del');
          del.innerText = `${titleProfix} ${info.event.title}`;
          dom.appendChild(del);
        } else {
          dom.innerText = `${titleProfix} ${info.event.title}`;
        }

        return {
          domNodes: [dom],
        };
      },
      eventClassNames: function (info) {
        let result = true;
        let groups = [];
        CAC.getRoot()
          .querySelectorAll('input[name="event_filter"]:checked')
          .forEach(function (item) {
            const type = item.getAttribute('data-type');
            if (type === 'group') {
              groups.push(item.value);
            }
          });

        // 체크 된 일정 클래스 추가
        if (groups.length > 0) {
          result = result && groups.indexOf(info.event.extendedProps?.calendar_group_id) >= 0;
        } else {
          result = false;
        }

        // 체크되지 않은 일정 클래스 추가
        if (!result) {
          result = 'filter-hidden';
        }

        return result;
      },
      events: [],
      moreLinkClick: (info) => {
        CAC_VIEW.layerPopupCloseAll();
      },
      moreLinkDidMount: (info) => {
        // popover가 마운트된 후에 실행되는 콜백
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
              const popover = CAC.getRoot().querySelector('.fc-popover');
              if (popover) {
                // 모든 이벤트 요소를 선택
                const eventElements = popover.querySelectorAll('.fc-event');
                eventElements.forEach((eventEl) => {
                  const titleEl = eventEl.querySelector('.fc-event-title');
                  if (titleEl) {
                    // title 속성 추가
                    eventEl.setAttribute('title', titleEl.textContent || '');
                  }
                });
              }
            }
          });
        });

        // DOM 변화 감지 시작
        observer.observe(CAC.getRoot(), {
          childList: true,
          subtree: true,
        });

        // 컴포넌트 언마운트 시 observer 정리
        return () => observer.disconnect();
      },
    });

    calendar.render();

    CAC.getRoot()
      .querySelectorAll('input[name="event_filter"]')
      .forEach(function (item) {
        item.addEventListener('change', function () {
          CAC_VIEW.applyEventFilter();
        });
      });

    this.calendar = calendar;
  },

  renderCalendarMobile: function (initialView) {
    let calendarEl = CAC.getRoot().getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
      locale: 'ko',
      buttonText: {
        today: '오늘',
        month: '월',
        week: '주',
        day: '일',
        list: 'list',
      },
      titleFormat: {
        month: 'long',
        year: 'numeric',
      },
      views: {
        timeGridWeek: {
          titleFormat: function (date) {
            const start = moment(date.start);
            const end = moment(date.end); // 마지막 날짜 보정

            if (start.year() !== end.year()) {
              return `${start.format('M월')} - ${end.format('YYYY년 M월')}`;
            }

            if (start.month() !== end.month()) {
              return `${start.format('YYYY년 M월')} - ${end.format('M월')}`;
            }

            return start.format('YYYY년 M월');
          },
        },
      },
      dayHeaderFormat: {
        weekday: 'short',
      },
      dayHeaderContent: (args) => {
        let headerDay = document.createElement('span');
        let headerWeek = document.createElement('span');

        headerDay.classList.add('date');

        headerDay.innerHTML = moment(args.date).format('Do').replace('일', '');
        headerWeek.innerHTML = moment(args.date).format(' dd');

        if (args.view.type === 'timeGridDay' || args.view.type === 'timeGridWeek') {
          if (moment(args.date).format('YYYY-MM-DD') in CAC_VIEW.holiday) {
            headerDay.style.color = 'red';
            headerWeek.style.color = 'red';
          }
          return {
            html: headerDay.outerHTML + headerWeek.outerHTML,
          };
        } else if (args.view.type === 'dayGridMonth') {
          return moment(args.date).format('dd');
        }
      },
      dayCellContent: (info) => {
        let number = document.createElement('a');
        number.classList.add('fc-daygrid-day-number');
        number.innerHTML = info.dayNumberText.replace('일', '').replace('日', '');

        if (info.view.type === 'dayGridMonth') {
          // 공휴일 설정
          if (moment(info.date).format('YYYY-MM-DD') in CAC_VIEW.holiday) {
            number.style.color = 'red';
          }
          return {
            html: number.outerHTML,
          };
        }
        return {
          domNodes: [],
        };
      },

      // style
      initialView: this.computedInitialView(),
      height: '700px',
      slotMinTime: '00:00',
      slotMaxTime: '24:00',
      navLinks: false, // 요일, 날짜 클릭 시 일/주 단위 화면으로 넘어감
      expandRows: true,
      editable: false, // 드래그 수정 여부
      selectable: false, //
      nowIndicator: true, //
      dayMaxEvents: this.computedDisplayLimit(),
      eventDisplay: 'block',
      showNonCurrentDates: true, // 이전, 다음 달 날짜 표시
      fixedWeekCount: false,
      eventOrder: ['-is_promotion', '-is_day', 'start_datetime', 'end_datetime'],
      slotEventOverlap: false,
      scrollTime:
        (this.computedInitialView() === 'timeGridDay' || this.computedInitialView() === 'timeGridWeek') &&
        moment().subtract(8, 'hover').format('HH:mm:ss'),
      firstDay: this.computedStartWeek(),
      headerToolbar: {
        left: '',
        center: 'prev,title,next,today',
        right: 'timeGridDay,timeGridWeek,dayGridMonth',
      },
      datesSet: function (dateInfo) {
        CAC_VIEW.datesSetHandler(dateInfo);
      },

      dateClick: function (info) {
        info.jsEvent.preventDefault();

        const currentDate = moment(info.date).format('YYYY-MM-DD');
        const dateDD = moment(info.date).format('D');
        const datedd = moment(info.date).format('dd');
        const eventTitle = `${dateDD}일 (${datedd})`;

        const layer = CAC$('#layerAllEvent', CAC.getRoot());
        const layerTitle = layer.find('h1');
        layerTitle.html(eventTitle);

        // layer .cont .events
        const layerCont = layer.find('.cont');
        layerCont.find('.events').remove();

        const calendarData = CAC_VIEW.eventList.filter((item) => {
          // check info.date in info.start and info.end
          // day
          const infoDate = moment(info.date).format('YYYY-MM-DD');
          const startDate = moment(item.start_datetime).format('YYYY-MM-DD');
          const endDate = moment(item.end_datetime).format('YYYY-MM-DD');

          return moment(infoDate).isBetween(startDate, endDate, null, '[]');
        });

        // 마켓 프로모션
        const promotionData = CAC_VIEW.promotion_data.filter((item) => {
          const infoDate = moment(info.date).format('YYYY-MM-DD');
          const startDate = moment(item.start_datetime).format('YYYY-MM-DD');
          const endDate = moment(item.end_datetime).format('YYYY-MM-DD');

          return moment(infoDate).isBetween(startDate, endDate, null, '[]');
        });

        // 시즌 이벤트
        const seasonEventData = CAC_VIEW.season_data.filter((item) => {
          const infoDate = moment(info.date).format('YYYY-MM-DD');
          const startDate = moment(item.start_datetime).format('YYYY-MM-DD');
          const endDate = moment(item.end_datetime).format('YYYY-MM-DD');

          return moment(infoDate).isBetween(startDate, endDate, null, '[]');
        });

        const checkedEventFilter = CAC.getRoot().querySelectorAll('input[name="event_filter"]:checked');
        const checkedEventFilterArray = Array.from(checkedEventFilter);
        const checkedEventFilterIds = checkedEventFilterArray.map((item) => item.value);

        const events = [...calendarData, ...promotionData, ...seasonEventData].filter((event) => {
          return checkedEventFilterIds.includes(event.calendar_group_id);
        });

        if (events.length === 0) {
          return;
        }

        const eventsHtml = events
          .sort(CAC_VIEW.sortCalendarList)
          .map((event) => {
            let eventStart = '';
            let eventEnd = '';
            if (event.is_day === 'T') {
              eventStart = moment(event.start_datetime).format('YYYY.MM.DD');
              eventEnd = moment(event.end_datetime).format('YYYY.MM.DD');
            } else {
              eventStart = moment(event.start_datetime).format('YYYY.MM.DD HH:mm');
              eventEnd = moment(event.end_datetime).format('YYYY.MM.DD HH:mm');
            }

            const titleEl = document.createElement('div');
            titleEl.classList.add('title');
            titleEl.innerText = event.title;

            return `<a href="javascript:void(0)" style="--eventColor: ${event.color};" onclick="
		CAC_VIEW.showDetail('${event.id}','${currentDate}')">
									${titleEl.outerHTML}
									<div class="date">${eventStart} ~ ${eventEnd}</div>
								</a>`;
          })
          .join('');

        layerCont.append(`<div class="events">${eventsHtml}</div>`);

        CAC_VIEW.appendDimed();
        // 레이어 팝업 열릴 때 body 스크롤 방지
        CAC$('body').css('overflow', 'hidden');
        layer.css('display', 'block');
      },

      eventClick: async (info) => {
        info.jsEvent.preventDefault();
        if (info.view.type !== 'dayGridMonth') {
          const eventId = info.event.id;
          const currentDate = moment(info.event.start).format('YYYY-MM-DD');
          await CAC_VIEW.showDetail(eventId, currentDate);
        }
      },

      //event filter
      eventClassNames: function (info) {
        var result = true;
        var groups = [];

        CAC$("input[name='event_filter']:checked", CAC.getRoot()).each(function () {
          if (CAC$(this).data('type') == 'group') {
            groups.push(CAC$(this).val());
          }
        });

        if (groups.length > 0) {
          result = result && groups.indexOf(info.event.extendedProps?.calendar_group_id) >= 0;
        } else {
          result = false;
        }

        // 체크되지 않은 일정 클래스 추가
        if (!result) {
          result = 'filter-hidden';
        }
        return result;
      },

      eventContent: (info) => {
        let dom = null;

        dom = document.createElement('div');
        dom.className = 'fc-event-title';
        dom.style.padding = '2px';
        dom.style.cursor = 'pointer';

        if (info.event.extendedProps.is_complete === 'T') {
          const del = document.createElement('del');
          del.innerText = `${info.event.title}`;
          dom.appendChild(del);
        } else {
          dom.innerText = `${info.event.title}`;
        }

        return {
          domNodes: [dom],
        };
      },

      //event data
      events: this.eventList,
    });

    calendar.render();

    // 필터 변경시 이벤트 핸들러 추가
    CAC$("input[name='event_filter']", CAC.getRoot()).change(function () {
      CAC_VIEW.applyEventFilter();
    });

    this.calendar = calendar;
  },

  // 검색결과 캘린더
  renderSearchCalendar: function () {
    let calendarEl = CAC.getRoot().getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
      // lang
      locale: 'ko',

      views: {
        listGridForAll: {
          type: 'list',
          visibleRange: (currentDate) => {
            return {
              start: moment(currentDate).subtract(10, 'year').format('YYYY-MM-DD'),
              end: moment(currentDate).add(10, 'year').format('YYYY-MM-DD'),
            };
          },
        },
      },
      // style
      initialView: 'listGridForAll',
      height: 'auto',
      slotMinTime: '00:00',
      slotMaxTime: '24:00',
      navLinks: false, // 요일, 날짜 클릭 시 일/주 단위 화면으로 넘어감
      expandRows: true,
      editable: false, // 드래그 수정 여부
      selectable: false, //
      nowIndicator: true, //
      dayMaxEvents: true, // "more" 표시 전 최대 이벤트 갯수. true - 셀 높이에 따라 결정
      eventDisplay: 'block',
      noEventsContent: '검색 결과가 없습니다.',

      headerToolbar: {
        left: '',
        center: '',
        right: '',
      },

      //event layer
      eventClick: async (info) => {
        info.jsEvent.preventDefault();
        const eventInfo = info.event;
        const eventTitle = eventInfo.title;
        const eventStart = conversion(eventInfo.start);
        const eventEnd = conversion(eventInfo.end);
        const eventDesc = eventInfo.extendedProps?.description;
        const eventUrl = eventInfo.extendedProps?.external_link_url;
        const eventImage = eventInfo?.extendedProps?.link_products;

        const layer = CAC$('#layerCalendarEvent', CAC.getRoot());
        const layerTitle = layer.find('h1');
        const layerCont = layer.find('.cont');
        const layerBtn = layer.find('.btn_wrap a');

        layerTitle.html(eventTitle);
        layerCont.find('div').remove();
        layerBtn.attr('href', '6_viewCalendar.html'); // 일정 상세 url

        if (eventInfo.allDay === true) {
          if (
            moment(eventInfo.extendedProps.start_datetime).isSame(eventInfo.extendedProps.end_datetime, 'day') ||
            eventInfo.end === null
          ) {
            layerCont.append(
              `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD')}</div>`,
            );
          } else {
            layerCont.append(
              `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD')} ~ ${moment(eventInfo.extendedProps.end_datetime).format('YYYY-MM-DD')}</div>`,
            );
          }
        } else {
          layerCont.append(
            `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD HH:mm')} ~ ${moment(eventInfo.extendedProps.end_datetime).format('YYYY-MM-DD HH:mm')}</div>`,
          );
        }

        if (eventImage && eventImage.length > 0) {
          let imagesHTML = '';
          for (const item of eventImage) {
            const productHTML = await this.renderProductDetailView(item);
            if (productHTML) {
              imagesHTML += productHTML;
            }
          }

          layerCont.append(`<div class="image"><ul>${imagesHTML}</ul></div>`);
        }

        if (!eventUrl == '' || !eventUrl == undefined) {
          const newUrl =
            eventUrl.includes('http://') || eventUrl.includes('https://') ? eventUrl : 'http://' + eventUrl;
          let urlHTML = `<a href="${newUrl}" target="_blank">${eventUrl}</a>`;
          layerCont.append(`<div class="url">${urlHTML}</div>`);
        }
        if (!eventDesc == '' || !eventDesc == undefined) {
          layerCont.append(`<div class="description fr-view">${eventDesc}</div>`);
        }

        function conversion(date) {
          if (!date == '' || !date == undefined) {
            moment.locale('ko');
            return moment(date).format('YYYY-MM-DD hh:mm');
            //return date.toISOString().substring(0,16).replace(/\T/g, ' ');
          } else {
            return null;
          }
        }

        if (CAC$('#calendar_wrap', CAC.getRoot()).hasClass('mobile')) {
          this.showDetail(eventInfo.id, eventStart);

          // calendar_head
          CAC$('#calendar_wrap #mobile_search_calendar_head', CAC.getRoot()).css('display', 'none');

          // var link = '2_calendar_m_detail.html';
          // window.open(link);
        } else {
          layer.css('display', 'block');
        }
      },

      //event data
      events: this.eventList,
    });
    calendar.render();

    this.calendar = calendar;
  },

  DOMContentLoaded: function () {
    function showBtnClear(_this) {
      if (_this.val() == '') {
        _this.siblings('.btn_clear').css('display', 'none');
      } else {
        _this.siblings('.btn_clear').css('display', 'block');
      }
    }

    //캘린더 검색
    showBtnClear(CAC$('.inputSearch .inputbox', CAC.getRoot()));
    CAC$('.inputSearch .inputbox', CAC.getRoot()).on('focus focusout input', function () {
      showBtnClear(CAC$(this));
    });

    //캘린더 검색 초기화
    CAC$('.inputSearch .btn_clear', CAC.getRoot()).on('click', function () {
      CAC$(this).siblings('.inputbox').val('');
      CAC$(this).siblings('.inputbox').focus();
      CAC$('.calendar_search .inputSearch .calendar_search_layer', CAC.getRoot()).css('display', 'none');
      if (CAC_UTIL.isMobile()) {
        CAC_VIEW.calendar.removeAllEvents();
      }
    });

    //캘린더 모바일 클릭 검색
    CAC$('.inputSearch .btn_search2', CAC.getRoot()).on('click', function () {
      const searchVal = CAC$(this).siblings('.inputbox').val();

      if (!searchVal) return;
      CAC_VIEW.debounceSearch(searchVal);
    });

    let calendarFilter = CAC$('.calendar_filter', CAC.getRoot());
    // 캘린더 목록 노출
    let btnSelect = calendarFilter.find('.btn_select');

    if (!!CAC_VIEW.group_id) {
      // .calendar_filter .btn_select::after
      btnSelect.addClass('group');
      btnSelect.css('padding-right', '0');
    }

    btnSelect.on('click', function () {
      // 전체 캘린더 일때만 동작 함
      if (!CAC_VIEW.group_id) {
        if (calendarFilter.hasClass('active')) {
          calendarFilter.removeClass('active');
        } else {
          calendarFilter.addClass('active');
        }
      }
    });

    // CAC$('.calendar_search .inputSearch .calendar_search_layer', CAC.getRoot()) 밖의 영역 클릭시 숨김

    this.debounceSearch = CAC_UTIL.debounce(this.searchData, 500);

    this.searchInputByKeyup();
    this.searchEventClick();

    CAC$('.calendar_search .inputSearch #pcSearchBtn', CAC.getRoot()).on('click', function (e) {
      e.preventDefault();
      let searchVal = CAC$('.calendar_search .inputSearch .inputbox', CAC.getRoot()).val();
      CAC_VIEW.searchEvent(searchVal);
    });
    //this.pcSearchBtn();

    this.mobileSearchEvent();
  },

  searchInputByKeyup: function () {
    CAC$('.inputSearch .inputbox', CAC.getRoot()).on('keyup', function () {
      let searchVal = CAC$(this).val();
      if (!searchVal) return;
      CAC_VIEW.debounceSearch(searchVal);
    });
  },

  searchedEventList: null,
  searchData: async function (searchVal) {
    const searchValue = he.decode(searchVal);

    if (!searchValue.trim()) return;

    const products = await CAC_CAFE24API.getProductsByKeyword(searchValue);

    let productsNos = '';
    let productCalendarList = [];
    if (!!products) {
      productsNos = products.map((product) => product.product_no);
      productCalendarList = (await CAC_DATA.loadRemoteCalendarDataByProductsNo(productsNos))?.lists || [];
    }

    let calendar_list = (await CAC_DATA.loadRemoteCalendarData('', '', searchValue))?.lists || [];

    // 중복 제거: calendar_list와 productCalendarList 병합 후 _id 기준으로 중복 제거
    const mergedCalendarList = [...calendar_list, ...productCalendarList];
    const uniqueCalendarList = mergedCalendarList.filter(
      (event, index, self) => index === self.findIndex((e) => e._id === event._id),
    );

    // 마켓프로모션 데이터 요청
    const promotionGroup = CAC_VIEW.calendarGroupList.find(
      (group) => group.category === 'PROMOTION' && group.type === 'MARKET_PROMOTION',
    );

    let promotionData = [];
    if (promotionGroup?.display_front === 'T') {
      const promotionRemoteData =
        (await CAC_DATA.loadMarketPromotionData(
          moment().subtract(92, 'day').format('YYYY-MM-DD'),
          moment().format('YYYY-MM-DD'),
          searchValue,
        )) || [];
      promotionData = CAC_VIEW.parsePromotionEvent(promotionRemoteData);
    }

    // 시즌 이벤트 데이터 요청
    const seasonGroup = CAC_VIEW.calendarGroupList.find(
      (group) => group.category === 'SEASON' && group.type === 'SEASON_EVENT',
    );

    let seasonData = [];
    if (seasonGroup?.display_front === 'T') {
      const seasonRemoteData = (await CAC_DATA.loadSeasonEventData('', '', searchValue)) || [];
      seasonData = CAC_VIEW.parseSeasonEvent(seasonRemoteData);
    }

    const calendarData = this.parseEvent(uniqueCalendarList);
    this.searchedEventList = [...calendarData, ...promotionData, ...seasonData];

    if (!CAC_UTIL.isMobile()) {
      CAC_VIEW.searchEvent(searchValue);
    } else {
      this.calendarList = this.searchedEventList;
      this.renderSearchCalendar();
    }
  },
  // 이벤트 검색
  searchEvent: async function (value) {
    // 검색시 원격데이터 호출

    if (value.trim() === '') {
      CAC$('.calendar_search .inputSearch .calendar_search_layer', CAC.getRoot()).css('display', 'none');
      return;
    }

    if (value.trim().length > 0) {
      CAC$('.calendar_search .inputSearch .calendar_search_layer', CAC.getRoot()).css('display', 'block');

      let searchedData = '';
      CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).empty();

      const searchedEvent = this.searchedEventList;
      if (searchedEvent.length === 0) {
        searchedData = '<div style="padding: 5px 10px">검색 결과가 없습니다.</div>';
        CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).css('height', 'auto');
        CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).html(
          `<div style="display: flex;justify-content: center">${searchedData}</div>`,
        );
      } else {
        searchedData = '';
        CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).css('height', 'auto');
        searchedEvent.forEach((item) => {
          const liEl = document.createElement('li');
          const aEl = document.createElement('a');
          aEl.setAttribute('href', 'javascript:void(0)');
          aEl.setAttribute('data-id', item._id);
          aEl.innerText = item.title;
          liEl.appendChild(aEl);

          searchedData += liEl.outerHTML;
        });
        CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).append(searchedData);
      }
    }
  },
  /**
   * 검색된 이벤트 클릭시 상세 정보 팝업
   */
  searchEventClick: function () {
    // .calendar_search_layer>ul>li 클릭 이벤트
    CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).on('click', 'li', function () {
      const searchVal = CAC$(this).text();
      let eventId = CAC$(this).find('a').data('id');

      const event = CAC_VIEW.searchedEventList.find((item, index) => {
        if (item._id === eventId) {
          return true;
        }
        if (
          item.calendar_group_category === 'PROMOTION' &&
          item.calendar_group_type === 'MARKET_PROMOTION' &&
          item.board_no === eventId
        ) {
          return true;
        }
        if (
          item.calendar_group_category === 'SEASON' &&
          item.calendar_group_type === 'SEASON_EVENT' &&
          item.id === parseInt(eventId)
        ) {
          return true;
        }
      });

      // set search value
      CAC$('.calendar_search .inputSearch .inputbox', CAC.getRoot()).val(searchVal);
      CAC$('.calendar_search .inputSearch .calendar_search_layer', CAC.getRoot()).css('display', 'none');

      // goto date
      CAC_VIEW.calendar.gotoDate(moment(event.start_datetime).format('YYYY-MM-DD'));
      CAC_VIEW.customEventClick(event);
    });
  },

  /**
   * 검색된 이벤트 클릭시 상세 정보 세팅
   * @param event
   */
  customEventClick: async function (event) {
    const eventInfo = event;
    const eventTitle = eventInfo.title;
    const eventDesc = eventInfo?.description;
    const eventBoard = eventInfo.link_board_article;
    const eventUrl = eventInfo?.external_link_url;
    const eventImage = eventInfo?.link_products;
    const eventCategories = eventInfo?.link_categories;

    const layer = CAC$('#layerCalendarEvent', CAC.getRoot());
    const layerTitle = layer.find('h1');
    const layerCont = layer.find('.cont');

    layer.css('display', 'block');
    layerTitle.text(eventTitle);
    layerCont.find('div').remove();

    if (eventInfo.is_day === 'T') {
      if (moment(eventInfo.start_datetime).isSame(eventInfo.end_datetime, 'day') || !eventInfo.end) {
        layerCont.append(`<div class="date">${moment(eventInfo.start_datetime).format('YYYY-MM-DD')}</div>`);
      } else {
        layerCont.append(
          `<div class="date">${moment(eventInfo.start_datetime).format('YYYY-MM-DD')} ~ ${moment(eventInfo.end_datetime).format('YYYY-MM-DD')}</div>`,
        );
      }
    } else {
      layerCont.append(
        `<div class="date">${moment(eventInfo.start_datetime).format('YYYY-MM-DD HH:mm')} ~ ${moment(eventInfo.end_datetime).format('YYYY-MM-DD HH:mm')}</div>`,
      );
    }

    if (eventImage && eventImage.length > 0) {
      let imagesHTML = '';
      for (const item of eventImage) {
        const productHTML = await this.renderProductDetailView(item);
        if (productHTML) {
          imagesHTML += productHTML;
        }
      }

      layerCont.append(`<div class="image"><ul>${imagesHTML}</ul></div>`);
    }

    if (typeof eventBoard === 'object' && Object.keys(eventBoard).length > 0) {
      let urlHTML = `<a href="${CAC_VIEW.getBoardLink(
        eventBoard.board_name,
        eventBoard.board_no,
        eventBoard.article_no,
      )}" target="_blank">${eventBoard?.title}</a>`;
      layerCont.append(`<div class="board">${urlHTML}</div>`);
    }

    if (eventCategories && eventCategories.length > 0) {
      const categoriesHTML = await this.generateCategoriesHTML(eventCategories, (html) => `<ul>${html}</ul>`);
      if (!!categoriesHTML) {
        layerCont.append(`<div class="categories">${categoriesHTML}</div>`);
      }
    }

    if (!eventUrl == '' || !eventUrl == undefined) {
      const newUrl = eventUrl.includes('http://') || eventUrl.includes('https://') ? eventUrl : 'http://' + eventUrl;
      let urlHTML = `<a href="${newUrl}" target="_blank">${eventUrl}</a>`;
      layerCont.append(`<div class="url">${urlHTML}</div>`);
    }

    if (!eventDesc == '' || !eventDesc == undefined) {
      layerCont.append(`<div class="description fr-view">${eventDesc}</div>`);
    }
  },

  /**
   * 모바일 상세정보 팝업
   * @param eventId
   * @param currentDate
   */
  showDetail: async function (eventId, currentDate) {
    const event = [...CAC_VIEW.eventList, ...CAC_VIEW.promotion_data, ...CAC_VIEW.season_data].find(
      (item) => item._id === parseInt(eventId) || item._id === eventId,
    );

    CAC$('.calendar_view', CAC.getRoot()).css('display', 'none');
    CAC$('#layerAllEvent', CAC.getRoot()).css('display', 'none');
    CAC$('#mobile_search_calendar_head', CAC.getRoot()).css('display', 'none');
    CAC$('.dimed', CAC.getRoot()).css('display', 'none');

    // calendar_header
    const detailEl = CAC$('#calendar_header', CAC.getRoot());
    CAC$('#calendar_header .calendar_head', CAC.getRoot()).css('display', 'block');
    detailEl.css('display', 'block');

    // <h1 class="title">2024-04-16</h1>
    detailEl.find('.calendar_head').find('.title').html(currentDate);
    const detailViewEl = detailEl.find('.detail_view');

    if (!event.is_promotion) {
      CAC_VIEW.renderThirdPartyCalGroups(
        detailViewEl,
        event?.calendar_group_id || '',
        event._id || '',
        event.title,
        event.start_datetime || '',
        event.end_datetime || '',
        '',
        event.is_day || 'F',
      );
    } else {
      detailViewEl.find('.calendar_groups').html('');
    }

    const detailTitle = detailViewEl.find('.title').find('h1');
    const detailDate = detailViewEl.find('.cont').find('.date');
    const detailDesc = detailViewEl.find('.cont').find('.description');
    const detailUrl = detailViewEl.find('.cont').find('.url');
    const detailBoard = detailViewEl.find('.cont').find('.board');
    const detailImage = detailViewEl.find('.cont').find('.image');
    const detailCategories = detailViewEl.find('.cont').find('.categories');

    // reset
    detailTitle.html('');
    detailDate.html('');
    detailDesc.html('');
    detailUrl.html('');
    detailBoard.html('');
    detailImage.html('');
    detailCategories.html('');

    detailTitle.text(event.title);
    if (event.is_day === 'T') {
      const showDateTimeText = !event.end_datetime
        ? moment(event.start_datetime).format('YYYY-MM-DD')
        : `${moment(event.start_datetime).format('YYYY-MM-DD')} ~ ${moment(event.end_datetime).format('YYYY-MM-DD')}`;
      detailDate.html(showDateTimeText);
    } else {
      detailDate.html(
        `${moment(event.start_datetime).format('YYYY-MM-DD HH:mm')} ~ ${moment(event.end_datetime).format('YYYY-MM-DD HH:mm')}`,
      );
    }

    // 연관상품
    let imageHtml = '';
    if ('link_products' in event && event.link_products.length > 0) {
      for (const item of event.link_products) {
        const productHTML = await this.renderProductDetailView(item);
        if (productHTML) {
          imageHtml += productHTML;
        }
      }
    }

    if (!imageHtml) {
      detailImage.css('display', 'none');
    } else {
      detailImage.html(`<ul>${imageHtml}</ul>`);
      detailImage.css('display', 'block');
    }

    const eventCategories = event?.link_categories;
    if (eventCategories && eventCategories.length > 0) {
      const categoriesHTML = await this.generateCategoriesHTML(eventCategories, (html) => `<ul>${html}</ul>`);
      if (!!categoriesHTML) {
        detailCategories.html(categoriesHTML);
        detailCategories.css('display', 'block');
      } else {
        detailCategories.css('display', 'none');
      }
    }

    if (!!event?.external_link_url) {
      const newUrl =
        event?.external_link_url.includes('http://') || event?.external_link_url.includes('https://')
          ? encodeURI(event?.external_link_url ?? '')
          : 'http://' + encodeURIComponent(event?.external_link_url ?? '');

      const urlHTML = `<a href="${newUrl}" target="_blank">${event.external_link_url}</a>`;
      detailUrl.css('display', 'block');
      detailUrl.html(urlHTML);
    } else {
      detailUrl.css('display', 'none');
    }

    if (typeof event?.link_board_article === 'object' && Object.keys(event?.link_board_article).length > 0) {
      let urlHTML = `<a href="${CAC_VIEW.getBoardLink(
        event?.link_board_article?.board_name,
        event?.link_board_article?.board_no,
        event?.link_board_article?.article_no,
      )}" target="_blank">${event?.link_board_article?.title}</a>`;
      detailBoard.css('display', 'block');
      detailBoard.html(urlHTML);
    } else {
      detailBoard.css('display', 'none');
    }

    if (!!event?.description) {
      detailDesc.html(event?.description);
      detailDesc.css('display', 'block');
    } else {
      detailDesc.css('display', 'none');
    }

    CAC$('body').css('overflow', '');
  },

  /**
   * 상세정보 팝업 닫기
   */
  backToCalendar: function () {
    CAC_VIEW.removeDimed();

    CAC$('.calendar_view', CAC.getRoot()).css('display', 'block');
    if (CAC_UTIL.isMobile()) {
      if (CAC$('#calSearchMobile', CAC.getRoot()).css('display') === 'block') {
        CAC$('.calendar_head', CAC.getRoot()).css('display', 'block');
        CAC_VIEW.renderSearchCalendar();
      } else {
        CAC$('.calendar_head', CAC.getRoot()).css('display', 'none');
        CAC_VIEW.renderCalendarMobile();
      }
    }
    CAC$('#calendar_header', CAC.getRoot()).css('display', 'none');
  },

  /**
   * 모바일 검색 뷰 설정
   * @param isSearchView
   */
  setSearchView: function (isSearchView = true) {
    if (CAC_UTIL.isMobile()) {
      const shadowRoot = CAC.getRoot();

      // 검색했을시
      if (isSearchView) {
        CAC$('#calendar_wrap #mobile_search_calendar_head', shadowRoot).css('display', 'block');
        CAC$('#calSearchMobile', shadowRoot).css('display', 'block');

        //calendar_view add class search
        CAC$('.calendar_view', shadowRoot).addClass('search');

        // calendar_search
        CAC$('.calendar_view .calendar_search', shadowRoot).css('display', 'none');
        CAC$('.calendar_view .calendar_filter', shadowRoot).css('display', 'none');

        this.renderSearchCalendar();

        // 검색시 초기값 설정
        CAC_VIEW.calendar.getEvents().forEach((event) => {
          event.setProp('display', 'none');
        });
      } else {
        //calendar_view remove class search
        CAC$('.calendar_view', shadowRoot).removeClass('search');

        // calendar_search
        CAC$('.calendar_view .calendar_search', shadowRoot).css('display', 'block');
        CAC$('.calendar_view .calendar_filter', shadowRoot).css('display', 'block');

        CAC$('#calendar_wrap #mobile_search_calendar_head', shadowRoot).css('display', 'none');
        CAC$('#calSearchMobile', shadowRoot).css('display', 'none');

        this.renderCalendarMobile();
      }
    }
  },
  /**
   * 모바일 캘린더 검색
   */
  mobileSearchEvent: function () {
    CAC$('#calSearchMobile .inputbox', CAC.getRoot()).on('keyup', function () {
      let searchVal = CAC$(this).val();

      // filter event
      if (searchVal === '') {
        return;
      }

      // search event
      CAC_VIEW.debounceSearch(searchVal);
    });
  },

  closeMobileSearch: async function () {
    // 취소시 이벤트 초기화
    CAC$('#calSearchMobile .inputbox', CAC.getRoot()).val('');
    CAC_VIEW.setSearchView(false);
  },

  // 팝업 공통
  openLayer: function (IdName) {
    CAC_VIEW.removeDimed();
    CAC$('.layer_popup', CAC.getRoot()).css('display', 'none');
    if (CAC$('#calendar_wrap', CAC.getRoot()).hasClass('mobile')) {
      CAC_VIEW.appendDimed();
    }
    CAC$('#' + IdName, CAC.getRoot()).css('display', 'block');
  },
  closeLayer: function (IdName) {
    CAC_VIEW.removeDimed();
    CAC$('#' + IdName, CAC.getRoot()).css('display', 'none');
  },
  appendDimed: function (target) {
    CAC$('#calendar_wrap', CAC.getRoot()).append('<div class="dimed"></div>');
    CAC$('.dimed', CAC.getRoot()).css('display', 'block');
    CAC$('.dimed', CAC.getRoot()).on('click', function () {
      CAC$('.layer_popup', CAC.getRoot()).css('display', 'none');
      CAC_VIEW.removeDimed();
      // dimed 제거 시 body 스크롤 복원
      CAC$('body').css('overflow', '');
    });
  },
  removeDimed: function () {
    CAC$('.dimed', CAC.getRoot()).remove();
    // dimed 제거 시 body 스크롤 복원
    CAC$('body').css('overflow', '');
  },
  handleCheckCalendarGroupDisplay: function () {
    if (CAC_VIEW.calendarGroupList.length === 0) {
      return;
    }
    CAC_VIEW.openLayer('layerCalendarList');
    CAC$('body').css('overflow', 'hidden');
  },

  renderProductDetailView: async function (product) {
    const cafe24Product = await CAC_CAFE24API.getProducts(product.product_no);
    if (!cafe24Product) return;
    //if(product.display === 'F') continue;

    const itemNames = product.items.map((item) => item.item_name).join(', ');
    const itemName = itemNames.length > 0 ? `(${itemNames})` : '';

    const soldOutHtml = cafe24Product?.sold_out === 'T' ? '<span class="soldout">SOLD OUT</span>' : '';
    return `<li class="first">
      <a href="/product/detail.html?product_no=${product.product_no}" title="${cafe24Product?.product_name ?? product.product_name} ${itemName}" target="_blank">
        <img src="${cafe24Product?.image ?? product.image}" alt="${cafe24Product?.product_name ?? product.product_name} ${itemName}">
        ${soldOutHtml}
      </a>
    </li>`;
  },
  generateCategoriesHTML: async function (eventCategories, wrapperFn = null) {
    if (!eventCategories || eventCategories.length === 0) return '';
    const categoriesHTML = await Promise.all(
      eventCategories.map(async (item) => {
        const category = await CAC_CAFE24API.getCategories(item.category_no);
        if (!category) return '';

        const cleanCategoryName = encodeURIComponent(category.category_name);

        return `
      <li class="first">
        <a href="${CAC_VIEW.getShopPath()}/category/${cleanCategoryName}/${category.category_no}/" target="_blank">
          <span class="name">${category.category_name}</span>
        </a>
      </li>
    `;
      }),
    ).then((results) => results.join(''));

    // 기본 래퍼 함수
    const defaultWrapper = (html) => `<div class="categories"><ul>${html}</ul></div>`;

    // wrapperFn이 제공되면 사용하고, 아니면 기본 래퍼 사용
    return categoriesHTML ? (wrapperFn || defaultWrapper)(categoriesHTML) : '';
  },
  getBoardLink: function (board_name, board_no, article_no) {
    return `${CAC_VIEW.getShopPath()}/article/${board_name}/${board_no}/${article_no}/`;
  },

  THIRD_PARTY_CALENDARS: [
    {
      name: 'google',
      title: '구글 캘린더로 일정 가져가기',
      url: 'https://calendar.google.com/calendar/u/0/r/eventedit?details={description}&text={title}&dates={start_datetime}/{end_datetime}',
    },
  ],
  renderThirdPartyCalGroups: function (
    layer,
    calendarGroupId,
    calendarId,
    title,
    start_datetime,
    end_datetime,
    description = '',
    allDay,
  ) {
    const isUseThirdPartyCal = this.checkUseThirdPartyCal();
    if (!isUseThirdPartyCal) {
      return;
    }

    const layerGroups = layer.find('.calendar_groups');
    const style = CAC_UTIL.isMobile() ? 'width: 24px; height: 24px;' : 'width: 30px; height: 30px;';
    layerGroups.empty();
    this.THIRD_PARTY_CALENDARS.forEach((target) => {
      layerGroups.append(`<a href="javascript:void(0)" onclick="CAC_VIEW.handleThirdPartyCalClick('${target.name}', '${calendarGroupId}', '${calendarId}', '${he.escape(he.encode(title))}', '${start_datetime}', '${end_datetime}', '${description}', '${allDay}')">
        <img src="https://m-img.cafe24.com/images/ec/calendar/ico_calendar_${target.name}.png" style="${style}" /></a>`);
    });
  },

  // 고객 캘린더 연동 여부 확인
  checkUseThirdPartyCal: function () {
    if (!!this.group_id) {
      const group = this.calendarGroupList.find((group) => group._id === this.group_id);
      return group && group.single_calendar_use_third_party_cal === 'T';
    } else {
      return this.basic_setting?.use_third_party_cal === 'T';
    }
  },

  handleThirdPartyCalClick: function (
    targetName,
    calendarGroupId,
    calendarId,
    title,
    start_datetime,
    end_datetime,
    description,
    allDay,
  ) {
    const target = this.THIRD_PARTY_CALENDARS.find((target) => target.name === targetName);

    const url = target.url
      .replace('{title}', he.unescape(encodeURIComponent(title)))
      .replace(
        '{start_datetime}',
        start_datetime
          ? allDay === 'F'
            ? encodeURIComponent(moment(start_datetime).format('YYYYMMDDTHHmmssZ'))
            : encodeURIComponent(moment(start_datetime).format('YYYYMMDD'))
          : '',
      )
      .replace(
        '{end_datetime}',
        end_datetime
          ? allDay === 'F'
            ? encodeURIComponent(moment(end_datetime).format('YYYYMMDDTHHmmssZ'))
            : encodeURIComponent(moment(end_datetime).add(1, 'day').format('YYYYMMDD'))
          : '',
      )
      .replace('{description}', '');
    CAC_DATA.updateThirdPartyCalClickCount(calendarGroupId, calendarId, targetName);
    window.open(url, '_blank');
  },
  layerPopupCloseAll: function () {
    CAC_VIEW.closeLayer('layerCalendarEvent');
    CAC$('.calendar_search_layer', CAC.getRoot()).css('display', 'none');
    CAC$('.calendar_filter ', CAC.getRoot()).removeClass('active');
  },
  getShopPath: function () {
    return CAFE24API.SHOP_NO == 1 ? '' : `/shop${CAFE24API.SHOP_NO}`;
  },
  applyEventFilter: function () {
    /**
     * 체크된 그룹에 해당하는 이벤트만 필터링하여 캘린더에 표시
     */

    // 현재 체크된 그룹 ID들을 가져옴
    const checkedGroups = [];
    CAC.getRoot()
      .querySelectorAll('input[name="event_filter"]:checked')
      .forEach(function (checkbox) {
        if (checkbox.getAttribute('data-type') === 'group') {
          checkedGroups.push(checkbox.value);
        }
      });

    // 모든 이벤트 제거
    this.calendar.removeAllEvents();

    // 체크된 그룹에 해당하는 이벤트만 필터링
    const filteredEvents = [...this.eventList, ...this.promotion_data, ...this.season_data].filter((event) =>
      checkedGroups.includes(event.calendar_group_id),
    );

    // 필터링된 이벤트 추가
    this.calendar.addEventSource(filteredEvents);

    // 캘린더 다시 렌더링
    this.calendar.render();
  },
};

CAC = {
  currentElement: null,
  getRoot: function () {
    return this.currentElement.shadowRoot;
  },
};

CAC_UTIL = {
  is_mobile: false,
  isMobile: function () {
    return this.is_mobile;
  },

  loadCSS: async function (url) {
    // https로 시작하는 경우 그대로 사용
    if (!url.startsWith('https://')) {
      // 현재 location.href가 /shop${shop_no}/로 시작하면, 현재 url 변수 앞에 /shop${shop_no}를 붙여준다.
      const path = location.href.replace(location.origin, '');
      if (CAFE24API.SHOP_NO != 1) {
        if (path.startsWith(`/shop${CAFE24API.SHOP_NO}/`)) {
          url = `/shop${CAFE24API.SHOP_NO}${url}`;
        }
      }
    }

    url += (url.includes('?') ? '&t=' : '?t=') + new Date();

    const response = await fetch(url);
    const cssText = await response.text();
    const style = document.createElement('style');
    style.textContent = cssText;
    return style;
  },
  debounce: function (func, wait, immediate = false) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
  isEcEditor: function () {
    return new URLSearchParams(window.location.search).get('PREVIEW_SDE') === '1';
  },
};

CAC_CAFE24API = {
  SDK: null,
  CONFIG: null,

  init: async function () {
    this.CONFIG = await this.getConfiguration();
    CAC_CAFE24API.SDK =
      !CAC_UTIL.isEcEditor() &&
      CAFE24API.init({
        client_id: this.CONFIG?.client_id,
        version: this.CONFIG?.app_version,
      });
  },

  getSiteName: function () {
    return document.head.querySelector('meta[property="og:site_name"]')?.content;
  },

  getSetting: async function () {
    return await new Promise(async (resolve, reject) => {
      await fetch(
        `${CAFE24API.SHOP_NO == 1 ? '' : `/shop${CAFE24API.SHOP_NO}`}/calendar/app/setting.json?t=${new Date().getTime()}`,
      )
        .then((res) => res.json())
        .then(resolve)
        .catch((e) => reject(e));
    });
  },

  getConfiguration: async function () {
    return await new Promise(async (resolve, reject) => {
      await fetch(`/calendar/app/config.json`)
        .then((res) => res.json())
        .then(resolve)
        .catch((e) => reject(e));
    });
  },

  getProducts: async function (productNo) {
    return await new Promise((resolve, reject) => {
      CAC_CAFE24API.SDK.get('/api/v2/products/' + productNo + '?shop_no=' + CAFE24API.SHOP_NO, function (err, res) {
        if (err) {
          resolve(null);
        } else {
          resolve(res?.product);
        }
      });
    });
  },

  getProductsByKeyword: async function (keyword) {
    return await new Promise((resolve, reject) => {
      CAC_CAFE24API.SDK.get(
        '/api/v2/products?product_name=' + keyword + '&shop_no=' + CAFE24API.SHOP_NO,
        function (err, res) {
          if (err) {
            resolve(null);
          } else {
            resolve(res?.products);
          }
        },
      );
    });
  },

  getCategories: async function (categoryNo) {
    return await new Promise((resolve, reject) => {
      CAC_CAFE24API.SDK.get('/api/v2/categories/' + categoryNo + '?shop_no=' + CAFE24API.SHOP_NO, function (err, res) {
        if (err) {
          resolve(null);
        } else {
          resolve(res?.category);
        }
      });
    });
  },

  setEncryptedToken: async function () {
    const { member_id } = await CAPP_ASYNC_METHODS.AppCommon.getEncryptedMemberId(this.CONFIG?.client_id);
    if (!!member_id) {
      const memberTokenRes = await CAC_DATA.getMemberToken(member_id);
      if (memberTokenRes.code === 200) {
        CAC_VIEW.token = memberTokenRes.data?.token;
        CAC_VIEW.member_id = memberTokenRes.data?.member_id;
        CAC_VIEW.group_no = memberTokenRes.data?.group_no;

        CAC_LIST_VIEW.token = memberTokenRes.data?.token;
        CAC_LIST_VIEW.member_id = memberTokenRes.data?.member_id;
        CAC_LIST_VIEW.group_no = memberTokenRes.data?.group_no;
      }
    }
  },
};

CAC_DATA = {
  getDataUrl: function () {
    return CAFE24.FRONT_JS_CONFIG_MANAGE.cdnUrl ?? location.origin;
  },

  // 회원토큰
  getMemberToken: async function (token) {
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
      }),
    }).then((res) => res.json());
  },

  loadConfigData: async function () {
    const data = {
      mall_id: CAFE24API.MALL_ID,
      shop_no: CAFE24API.SHOP_NO,
    };
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => res.data)
      .catch((e) => {
        console.error('loadConfigData ERROR: ' + e);
      });
  },

  loadHolidayData: async function () {
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/openapi/holiday`)
      .then((res) => res.json())
      .catch((e) => console.error('loadHolidayData ERROR'));
  },

  loadSeasonEventData: async function (beginDate, endDate, searchKeyword) {
    const data = {
      begin_date: beginDate,
      end_date: endDate,
      title: searchKeyword,
      mall_id: CAFE24API.MALL_ID,
      shop_no: CAFE24API.SHOP_NO,
    };
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/season-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => res.data)
      .catch((e) => console.error('loadSeasonEventData ERROR'));
  },

  loadMarketPromotionData: async function (beginDate, endDate, searchKeyword = '') {
    const data = {
      begin_date: beginDate,
      end_date: endDate,
      title: searchKeyword,
      mall_id: CAFE24API.MALL_ID,
      shop_no: CAFE24API.SHOP_NO,
    };
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/mp/promotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => res.data)
      .catch((e) => console.error('loadMarketPromotionData ERROR'));
  },

  loadRemoteCalendarData: async function (beginDate, endDate, searchKeyword = '') {
    const data = {
      mall_id: CAFE24API.MALL_ID,
      shop_no: CAFE24API.SHOP_NO,
      standard_start_datetime: beginDate,
      standard_end_datetime: endDate,
      token: CAC_VIEW.token || '',
      calendar_group_id: CAC_VIEW.group_id || '',
      search_keyword: searchKeyword,
    };
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/calendar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => res.data)
      .catch((e) => console.error('loadRemoteCalendarData ERROR'));
  },

  loadRemoteCalendarDataByProductsNo: async function (productNos) {
    const data = {
      products_no: productNos,
      mall_id: CAFE24API.MALL_ID,
      shop_no: CAFE24API.SHOP_NO,
      token: CAC_VIEW.token || '',
      calendar_group_id: CAC_VIEW.group_id || '',
    };
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/calendar/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => res.data)
      .catch((e) => console.error('loadRemoteCalendarDataByProductsNo ERROR'));
  },

  updateThirdPartyCalClickCount: async function (calendarGroupId, calendarId, type) {
    const data = {
      mall_id: CAFE24API.MALL_ID,
      shop_no: CAFE24API.SHOP_NO,
      calendar_group_id: calendarGroupId,
      calendar_id: calendarId,
      type,
    };
    return await fetch(`${CAC_CAFE24API.CONFIG.app_front}/api/open/update-third-party-cal-click-count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((e) => console.error('updateThirdPartyCalClickCount ERROR'));
  },
};

CAC_LIST_VIEW = {
  groupId: null,
  basic_setting: {},
  calendar_group: [],
  currentSetting: {},
  isSingleCalendar: !!this.groupId,
  beginDate: null,
  endDate: null,
  currentViewType: null,
  token: null,
  member_id: null,
  group_no: null,
  viewTypeForClassMap: {
    date_view: {
      cld_list: '',
    },
    img_view: {
      cld_list: 'type_img',
    },
    prd_view: {
      cld_list: 'type_prd',
    },
  },
  setBeginEndDate: function () {
    const now = moment();
    if (this.getStartCalendar() === 'W') {
      this.beginDate = now.startOf('day').format('YYYY-MM-DD 00:00');
      this.endDate = now.startOf('day').add(6, 'days').format('YYYY-MM-DD 23:59');
    } else if (this.getStartCalendar() === 'M') {
      // 월 단위 캘린더
      this.beginDate = now.startOf('month').format('YYYY-MM-DD 00:00');
      this.endDate = now.endOf('month').format('YYYY-MM-DD 23:59');
    }
  },
  DOMContentLoaded: async function (currentViewType) {
    this.currentViewType = currentViewType;
    this.setBeginEndDate();

    await this.render(currentViewType);
  },
  getEventData: async function (beginDate, endDate) {
    const calendar_list = await CAC_DATA.loadRemoteCalendarData(beginDate, endDate);
    const filterCalendarList = this.groupId
      ? calendar_list?.lists
      : calendar_list?.lists.filter((item) => item.display_front !== 'F');

    return filterCalendarList;
  },
  getStartCalendar: function () {
    const isMobile = CAC_UTIL.isMobile();
    return isMobile
      ? this.currentSetting?.single_calendar_front_start_calendar_mobile ||
          this.currentSetting?.front_start_calendar_mobile
      : this.currentSetting?.single_calendar_front_start_calendar || this.currentSetting?.front_start_calendar;
  },
  render: async function (currentViewType, currentDate) {
    const list_wrap = CAC$('.list_wrap', CAC.getRoot());
    const cmt_date = CAC$('.cmt_date', CAC.getRoot());

    const eventData = await this.getEventData(this.beginDate, this.endDate);

    await cmt_date.html(this.generateCmtDateHtml(currentDate));

    html = `<ul class="cld_list ${this.viewTypeForClassMap[currentViewType]?.cld_list}">`;
    switch (currentViewType) {
      case 'date_view':
        html += await this.generateDateViewHtml(eventData);
        break;
      case 'img_view':
        html += await this.generateImgViewHtml(eventData);
        break;
      case 'prd_view':
        html += await this.generatePrdViewHtml(eventData);
        break;
    }
    html += '</ul>';
    list_wrap.html(html);

    const dropBtns = CAC.getRoot().querySelectorAll('.drop_btn');
    const titBtns = CAC.getRoot().querySelectorAll('.tit_btn');
    const container = CAC.getRoot().querySelector('#calendar_wrap');

    dropBtns.forEach((drop) => {
      drop.addEventListener('click', function () {
        const isOn = this.classList.contains('open');

        const contZone = drop.closest('li').querySelector('.content_zone');
        const btnText = drop.querySelector('.ico_drop');
        const btnDropTxt = drop.querySelector('.drop_txt');

        contZone?.classList.toggle('open');
        if (contZone?.innerText.trim() === '') {
          contZone.style.padding = '0';
        }

        this.classList.toggle('open');

        if (container?.classList?.contains('type_m')) {
          if (btnDropTxt) btnDropTxt.textContent = isOn ? '상세내역 보기' : '상세내역 닫기';
        } else {
          if (btnText) btnText.textContent = isOn ? '내용 열기' : '내용 닫기';
        }
      });
    });

    titBtns.forEach((titBtn) => {
      titBtn.addEventListener('click', function () {
        const contZone = titBtn.closest('li').querySelector('.content_zone');
        const btnText = titBtn.closest('li').querySelector('.ico_drop');
        const btnDropTxt = titBtn.closest('li').querySelector('.drop_txt');
        const btnDrop = titBtn.closest('li').querySelector('.drop_btn');
        const isOn = btnDrop.classList.contains('open');

        contZone?.classList.toggle('open');
        btnDrop?.classList.toggle('open');

        if (container.classList.contains('type_m')) {
          btnDropTxt.textContent = isOn ? '상세내역 보기' : '상세내역 닫기';
        } else {
          btnText.textContent = isOn ? '내용 열기' : '내용 닫기';
        }
      });
    });

    if (currentViewType === 'prd_view' && !CAC_UTIL.isMobile()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const swiperContainers = CAC.getRoot().querySelectorAll('.prd_list_wrap.swiper-container');

      swiperContainers.forEach((container) => {
        if (container) {
          new Swiper(container, {
            slidesPerView: 'auto',
            freeMode: true,
            slideToClickedSlide: true,
            scrollbar: {
              draggable: true,
              dragSize: 100,
            },
          });
        }
      });
    }
  },

  generateCmtDateHtml: function (currentDate = null) {
    let html = '';
    const isMobile = CAC_UTIL.isMobile();

    // 파라미터가 없으면 현재 날짜 사용
    this.currentDate = currentDate || this.currentDate || moment();

    const startCalendar = this.getStartCalendar();

    if (startCalendar === 'W') {
      html = `
        <div class="inner_date">
          <div>
            <div style="display:flex;justify-content: space-around;padding: 0 30px;">`;

      // 주의 시작일부터 7일간의 날짜 버튼 생성
      for (let i = 0; i <= 6; i++) {
        const day = moment(this.currentDate).add(i, 'days');
        const isToday = day.isSame(moment(), 'day');
        const dateFormat = isMobile ? 'DD' : 'MM/DD';
        const dateId = `date-${day.format('YYYY-MM-DD')}`;

        html += `
          <div class="date_wrap" style="width:100%;">
            <button type="button" class="btn_date${isToday ? ' on' : ''}">
              <span class="date_txt">${day.format(dateFormat)}</span>
              <span class="day_txt">${isToday ? '오늘' : day.format('ddd')}</span>
            </button>
          </div>`;
      }

      html += `
            </div>
          </div>
          <button type="button" class="btn_cmt btn_prev" onclick="CAC_LIST_VIEW.handleDateNavigation('prev')">
            <span class="ico_comm">이전</span>
          </button>
          <button type="button" class="btn_cmt btn_next" onclick="CAC_LIST_VIEW.handleDateNavigation('next')">
            <span class="ico_comm">다음</span>
          </button>
        </div>`;
    } else {
      // 월 단위로 표시
      html = `
        <div class="inner_month" style="${!isMobile ? 'padding: 28px 0 15px;' : ''}">
          <button type="button" class="btn_cmt btn_prev" onclick="CAC_LIST_VIEW.handleDateNavigation('prev')">
            <span class="ico_comm">이전</span>
          </button>
          <strong class="date_month">${this.currentDate.format('YYYY.MM')}</strong>
          <button type="button" class="btn_cmt btn_next" onclick="CAC_LIST_VIEW.handleDateNavigation('next')">
            <span class="ico_comm">다음</span>
          </button>
        </div>`;
    }
    return html;
  },

  handleDateNavigation: async function (direction) {
    const startCalendar = this.getStartCalendar();

    let newDate;
    if (startCalendar === 'W') {
      // 주 단위 이동
      newDate = moment(this.currentDate)[direction === 'prev' ? 'subtract' : 'add'](7, 'days');
      this.beginDate = moment(newDate).format('YYYY-MM-DD 00:00');
      this.endDate = moment(newDate).add(6, 'days').format('YYYY-MM-DD 23:59');
    } else {
      // 월 단위 이동
      newDate = moment(this.currentDate)[direction === 'prev' ? 'subtract' : 'add'](1, 'month');
      this.beginDate = moment(newDate).startOf('month').format('YYYY-MM-DD 00:00');
      this.endDate = moment(newDate).endOf('month').format('YYYY-MM-DD 23:59');
    }
    // 새로운 날짜 범위로 이벤트 데이터를 가져와서 목록 업데이트
    await CAC_LIST_VIEW.render(CAC_LIST_VIEW.currentViewType, newDate);
  },

  statusBadge: function (startDate, endDate, isDay, isComplete) {
    console.log(isDay);

    const start = isDay ? moment(startDate).startOf('day') : moment(startDate);
    const end = isDay ? moment(endDate).endOf('day') : moment(endDate);
    const now = isDay ? moment().startOf('day') : moment();

    if (isComplete) {
      return '<span class="stt_badge type_prev">일정종료</span>';
    }

    if (start.isSameOrBefore(now) && end.isSameOrAfter(now)) {
      return '<span class="stt_badge type_ing">진행중</span>';
    }

    // 지난 일정
    if (end.isBefore(now)) {
      return '<span class="stt_badge type_prev">지난일정</span>';
    }

    if (start.isAfter(now)) {
      return '<span class="stt_badge">진행예정</span>';
    }
  },
  // 쇼셜 링크 생성
  socialBadge: function (external_link_type) {
    if (external_link_type === 'youtube') {
      return CAC_UTIL.isMobile()
        ? `<span class="ico_comm ico_youtube"></span>`
        : `<span class="ico_comm ico_youtube"></span>유튜브`;
    }
    if (external_link_type === 'instagram') {
      return CAC_UTIL.isMobile()
        ? `<span class="ico_comm ico_instagram"></span>`
        : `<span class="ico_comm ico_instagram"></span>인스타그램`;
    }
    if (external_link_type === 'facebook') {
      return CAC_UTIL.isMobile()
        ? `<span class="ico_comm ico_facebook"></span>`
        : `<span class="ico_comm ico_facebook"></span>페이스북`;
    }
    if (external_link_type === 'naver_shopping_live') {
      return CAC_UTIL.isMobile()
        ? `<span class="ico_comm ico_naver"></span>`
        : `<span class="ico_comm ico_naver"></span>네이버쇼핑라이브`;
    }
    if (external_link_type === 'kakao_shopping_live') {
      return CAC_UTIL.isMobile()
        ? `<span class="ico_comm ico_kakao"></span>`
        : `<span class="ico_comm ico_kakao"></span>카카오쇼핑라이브`;
    }
    if (external_link_type === 'other') {
      return CAC_UTIL.isMobile()
        ? `<span class="ico_comm ico_link"></span>`
        : `<span class="ico_comm ico_link"></span>관련 링크`;
    }

    return '';
  },
  sortEvents: function (eventData) {
    return eventData.sort((a, b) => {
      // 먼저 시작 일자로 비교 (날짜만)
      const aStartDate = moment(a.start_datetime).startOf('day');
      const bStartDate = moment(b.start_datetime).startOf('day');

      const dateDiff = aStartDate.diff(bStartDate);
      if (dateDiff !== 0) return dateDiff;

      // 동일 날짜인 경우 일자만 설정됐는지 시간까지 설정됐는지 확인
      const aIsOnlyDay = a.is_day === 'T';
      const bIsOnlyDay = b.is_day === 'T';

      // 일자만 설정된 이벤트가 먼저 표시
      if (aIsOnlyDay && !bIsOnlyDay) return -1;
      if (!aIsOnlyDay && bIsOnlyDay) return 1;

      // 둘 다 시간 설정된 경우 시간순 정렬
      if (!aIsOnlyDay && !bIsOnlyDay) {
        return moment(a.start_datetime).diff(moment(b.start_datetime));
      }

      // 둘 다 일자만 설정된 경우는 더 이상 정렬하지 않음
      return 0;
    });
  },
  generateDateViewHtml: async function (eventData) {
    const startCalendar = this.getStartCalendar();
    if (!eventData || eventData.length === 0) {
      return `<li class="no_data">선택된 ${startCalendar === 'W' ? '날짜' : '월'}에 해당하는 일정이 없습니다.</li>`;
    }

    let html = '';
    const sortedEvents = this.sortEvents(eventData);

    for (const event of sortedEvents) {
      const startDate = moment(event.start_datetime);
      const endDate = moment(event.end_datetime);
      const statusBadge = this.statusBadge(startDate, endDate, event.is_day === 'T', event.is_complete === 'T');

      let linksHtml = '';
      if (event.external_link_url) {
        const url =
          event.external_link_url.includes('http://') || event.external_link_url.includes('https://')
            ? encodeURI(event.external_link_url)
            : 'http://' + encodeURIComponent(event.external_link_url);

        const socialBadge = this.socialBadge(event.external_link_type);
        linksHtml += `<a href="${url}" class="list_link" target="_blank">${socialBadge}</a>`;
      }

      if (event.link_board_article && Object.keys(event.link_board_article).length > 0) {
        const boardLink = CAC_VIEW.getBoardLink(
          event.link_board_article.board_name,
          event.link_board_article.board_no,
          event.link_board_article.article_no,
        );
        linksHtml += `<a href="${boardLink}" class="list_link" target="_blank"><span class="ico_comm ico_post"></span>${CAC_UTIL.isMobile() ? '' : '게시글'}</a>`;
      }

      const isUseThirdPartyCal = this.checkUseThirdPartyCal();
      if (isUseThirdPartyCal) {
        linksHtml += `<a href="javascript:void(0)" onclick="CAC_LIST_VIEW.handleGoogleCalClick('${this.group_id}', '${event.id}', '${event.title}', '${event.start_datetime}', '${event.end_datetime}', '', '${event.is_day}')" class="list_link" style="width: 40px; height: 40px;border-radius: 50%;overflow: hidden;padding: 0;border: none;"><img src="https://m-img.cafe24.com/images/ec/calendar/ico_calendar_google.png" style="width: 100%" alt="구글 일정 바로가기" class="ico_shop"></a>`;
      }

      let productsHtml = '';
      if (event.link_products && event.link_products.length > 0) {
        productsHtml = '<ul class="prd_list type_col">';
        for (const product of event.link_products) {
          const productData = await CAC_CAFE24API.getProducts(product.product_no);
          if (!productData) continue;

          const productName = productData.product_name || product.product_name;
          const productPrice = productData.price || '';
          const productImage = productData.image || product.image;
          const soldOut = productData.sold_out === 'T' ? '<span class="soldout">SOLD OUT</span>' : '';
          const salePercent =
            productData.retail_price &&
            Number(productData.retail_price) > 0 &&
            Number(productData.retail_price) !== Number(productData.price)
              ? `<span class="num_sale" style="font-size: 16px">${Math.round(((Number(productData.retail_price) - Number(productData.price)) / Number(productData.retail_price)) * 100)}%</span>`
              : '';

          const itemNames = product.items.map((item) => item.item_name).join(', ');
          const itemName = itemNames.length > 0 ? `(${itemNames})` : '';

          productsHtml += `
            <li>
              <a href="/product/detail.html?product_no=${product.product_no}" title="${productData?.product_name ?? product.product_name} ${itemName}" class="prd_link" target="_blank">
                <span class="thumb_wrap">
                  <img src="${productImage}" alt="${productName}" class="thumb_img">
                  ${soldOut}
                </span>
                <div class="info_prd">
                  <strong class="prd_tit">${productName}</strong>
                  <span class="prd_price" style="font-size: 16px">
                    ${salePercent}
                    <em class="emph_num">${Number(productPrice).toLocaleString()}</em>원
                  </span>
                </div>
              </a>
            </li>
          `;
        }
        productsHtml += '</ul>';
      }

      let cateHtml = '';
      if (event.link_categories && event.link_categories.length > 0) {
        const categoriesHTML = await CAC_VIEW.generateCategoriesHTML(
          event.link_categories,
          (html) => `<ul>${html}</ul>`,
        );
        cateHtml = `<div class="cate_wrap">${categoriesHTML}</div>`;
      }

      const collapsePCBtn = CAC_UTIL.isMobile()
        ? ''
        : '<button type="button" class="drop_btn"><span class="ico_comm ico_drop">내용 열기</span></button>';
      const collapseMobileBtn = CAC_UTIL.isMobile()
        ? '<button type="button" class="drop_btn"><span class="drop_txt">상세내역 보기</span><span class="ico_comm ico_drop"></span></button>'
        : '';

      const showDate =
        event.is_day === 'T'
          ? startDate.isSame(endDate, 'day')
            ? startDate.format('MM/DD')
            : `${startDate.format('MM/DD')} ~ ${endDate.format('MM/DD')}`
          : `${startDate.format('MM/DD')} ${startDate.format('A')} ${startDate.format('hh:mm')} ~ ${endDate.format('MM/DD')} ${endDate.format('A')} ${endDate.format('hh:mm')}`;

      const titleZoneStyle = CAC_UTIL.isMobile()
        ? event.description || productsHtml || cateHtml
          ? 'padding-bottom: 0px;'
          : 'padding-bottom: 22px;'
        : '';

      // 모바일과 PC에 따라 다른 title_zone 구조 적용
      let titleZoneHtml = '';
      if (CAC_UTIL.isMobile()) {
        titleZoneHtml = `
          <div class="title_zone" style="${titleZoneStyle}">
            <div class="inner_zone">
              <span class="date_txt"><span class="num_date">${startDate.format('MM/DD')}</span>(${startDate.format('ddd')})</span>
              <div class="inner_wrap">
                ${statusBadge}
                <button type="button" class="tit_btn">
                  <strong class="list_tit">${event.title}</strong>
                  <span class="txt_period">${showDate}</span>
                </button>
              </div>
            </div>
            ${linksHtml ? `<div class="link_wrap" style="display: flex; align-items: center;">${linksHtml}</div>` : ''}
          </div>
        `;
      } else {
        titleZoneHtml = `
          <div class="title_zone">
            <span class="date_txt"><span class="num_date">${startDate.format('MM/DD')}</span>(${startDate.format('ddd')})</span>
            ${statusBadge}
            <button type="button" class="tit_btn">
              <strong class="list_tit" style="line-height: 24px;">${event.title}</strong>
              <span class="txt_period">${showDate}</span>
            </button>
            ${linksHtml ? `<div class="link_wrap" style="display: flex; align-items: center;">${linksHtml}</div>` : ''}
            ${collapsePCBtn}
          </div>
        `;
      }

      html += `
        <li>
          ${titleZoneHtml}
          ${
            event.description || productsHtml || cateHtml
              ? `<div class="content_zone">
            ${event.description ? `<div class="cont_desc fr-view">${event.description}</div>` : ''}
            ${productsHtml}
            ${cateHtml}
          </div>`
              : ''
          }
          ${event.description || productsHtml || cateHtml ? collapseMobileBtn : ''}
        </li>
      `;
    }

    return html;
  },
  generateImgViewHtml: async function (eventData) {
    const startCalendar = this.getStartCalendar();
    if (!eventData || eventData.length === 0) {
      return `<li class="no_data">선택된 ${startCalendar === 'W' ? '날짜' : '월'}에 해당하는 일정이 없습니다.</li>`;
    }

    let html = '';
    const sortedEvents = this.sortEvents(eventData);

    for (const event of sortedEvents) {
      const startDate = moment(event.start_datetime);
      const endDate = moment(event.end_datetime);
      const statusBadge = this.statusBadge(startDate, endDate, event.is_day === 'T', event.is_complete === 'T');

      let linksHtml = '';
      if (event.external_link_url) {
        const url =
          event.external_link_url.includes('http://') || event.external_link_url.includes('https://')
            ? encodeURI(event.external_link_url)
            : 'http://' + encodeURIComponent(event.external_link_url);
        const socialBadge = this.socialBadge(event.external_link_type);
        linksHtml += `<a href="${url}" class="list_link" target="_blank">${socialBadge}</a>`;
      }

      if (event.link_board_article && Object.keys(event.link_board_article).length > 0) {
        const boardLink = CAC_VIEW.getBoardLink(
          event.link_board_article.board_name,
          event.link_board_article.board_no,
          event.link_board_article.article_no,
        );
        linksHtml += `<a href="${boardLink}" class="list_link" target="_blank"><span class="ico_comm ico_post"></span>${CAC_UTIL.isMobile() ? '' : '게시글'}</a>`;
      }

      const isUseThirdPartyCal = this.checkUseThirdPartyCal();
      if (isUseThirdPartyCal) {
        linksHtml += `<a href="javascript:void(0)" onclick="CAC_LIST_VIEW.handleGoogleCalClick('${this.group_id}', '${event.id}', '${event.title}', '${event.start_datetime}', '${event.end_datetime}', '', '${event.is_day}')" class="list_link" style="width: 40px; height: 40px;border-radius: 50%;overflow: hidden;padding: 0;border: none;"><img src="https://m-img.cafe24.com/images/ec/calendar/ico_calendar_google.png" style="width: 100%" alt="구글 일정 바로가기" class="ico_shop"></a>`;
      }

      let productsHtml = '';
      if (event.link_products && event.link_products.length > 0) {
        productsHtml = `<ul class="prd_list ${CAC_UTIL.isMobile() ? 'type_col' : 'type_col2'}">`;
        for (const product of event.link_products) {
          const productData = await CAC_CAFE24API.getProducts(product.product_no);
          if (!productData) continue;

          const productName = productData.product_name || product.product_name;
          const productPrice = productData.price || '';
          const productImage = productData.image || product.image;
          const soldOut = productData.sold_out === 'T' ? '<span class="soldout">SOLD OUT</span>' : '';
          const salePercent =
            productData.retail_price &&
            Number(productData.retail_price) > 0 &&
            Number(productData.retail_price) !== Number(productData.price)
              ? `<span class="num_sale" style="font-size: 16px">${Math.round(((Number(productData.retail_price) - Number(productData.price)) / Number(productData.retail_price)) * 100)}%</span>`
              : '';

          const itemNames = product.items.map((item) => item.item_name).join(', ');
          const itemName = itemNames.length > 0 ? `(${itemNames})` : '';

          productsHtml += `
            <li>
              <a href="/product/detail.html?product_no=${product.product_no}" title="${productData?.product_name ?? product.product_name} ${itemName}" class="prd_link" target="_blank">
                <span class="thumb_wrap">
                  <img src="${productImage}" alt="${productName}" class="thumb_img">
                  ${soldOut}
                </span>
                <div class="info_prd">
                  <strong class="prd_tit">${productName}</strong>
                  <span class="prd_price" style="font-size: 16px">
                    ${salePercent}
                    <em class="emph_num">${Number(productPrice).toLocaleString()}</em>원
                  </span>
                </div>
              </a>
            </li>
          `;
        }
        productsHtml += '</ul>';
      }

      let cateHtml = '';
      if (event.link_categories && event.link_categories.length > 0) {
        const categoriesHTML = await CAC_VIEW.generateCategoriesHTML(
          event.link_categories,
          (html) => `<ul>${html}</ul>`,
        );
        cateHtml = `<div class="cate_wrap">${categoriesHTML}</div>`;
      }

      const thumbnailImageUrl = event.img_view_thumbnail_image_url || '';
      const thumbnailLink = event.img_view_thumbnail_link || '';
      const url =
        thumbnailLink.includes('http://') || thumbnailLink.includes('https://')
          ? encodeURI(thumbnailLink)
          : 'http://' + encodeURIComponent(thumbnailLink);
      const thumbnailHtml = thumbnailImageUrl
        ? thumbnailLink
          ? `<div class="bnr_wrap"><a href="${url}" target="_blank"><img src="${thumbnailImageUrl}" alt="${event.title}" class="img_bnr"></a></div>`
          : `<div class="bnr_wrap"><img src="${thumbnailImageUrl}" alt="${event.title}" class="img_bnr"></div>`
        : '';

      const showDate =
        event.is_day === 'T'
          ? startDate.isSame(endDate, 'day')
            ? startDate.format('MM/DD') + '(' + startDate.format('ddd') + ')'
            : `${startDate.format('MM/DD')}(${startDate.format('ddd')}) ~ ${endDate.format('MM/DD')}(${endDate.format('ddd')})`
          : `${startDate.format('MM/DD')}(${startDate.format('ddd')})  ${startDate.format('HH:mm')} ~ ${endDate.format('MM/DD')}(${endDate.format('ddd')})  ${endDate.format('HH:mm')}`;

      const collapsePCBtn = CAC_UTIL.isMobile()
        ? ''
        : '<button type="button" class="drop_btn"><span class="ico_comm ico_drop">내용 열기</span></button>';
      const collapseMobileBtn = CAC_UTIL.isMobile()
        ? '<button type="button" class="drop_btn"><span class="drop_txt">상세내역 보기</span><span class="ico_comm ico_drop"></span></button>'
        : '';

      const titleZoneStyle = CAC_UTIL.isMobile()
        ? event.description || productsHtml || cateHtml
          ? 'padding-bottom: 0px;'
          : 'padding-bottom: 15px;'
        : '';
      html += `
        <li>
          ${thumbnailHtml}
          <div class="prd_tit_wrap">
            <div class="title_zone" style="${titleZoneStyle}">
              <div class="title_wrap">
                <button type="button" class="tit_btn">
                  <span class="inner_wrap">
                    ${statusBadge}
                    <span class="txt_period">${showDate}</span>
                  </span>
                  <strong class="list_tit">${event.title}</strong>
                </button>
              </div>
              ${linksHtml ? `<div class="link_wrap" style="display: flex; align-items: center;">${linksHtml}</div>` : ''}
              ${collapsePCBtn}
            </div>
          </div>
          ${
            event.description || productsHtml || cateHtml
              ? `<div class="content_zone">
            ${event.description ? `<div class="cont_desc fr-view">${event.description}</div>` : ''}
            ${productsHtml}
            ${cateHtml}
          </div>`
              : ''
          }
          ${event.description || productsHtml || cateHtml ? collapseMobileBtn : ''}
        </li>
      `;
    }

    return html;
  },
  generatePrdViewHtml: async function (eventData) {
    const isMobile = CAC_UTIL.isMobile();
    const startCalendar = this.getStartCalendar();
    if (!eventData || eventData.length === 0) {
      return `<li class="no_data">선택된 ${startCalendar === 'W' ? '날짜' : '월'}에 해당하는 일정이 없습니다.</li>`;
    }

    let html = '';
    const sortedEvents = this.sortEvents(eventData);

    for (const event of sortedEvents) {
      const startDate = moment(event.start_datetime);
      const endDate = moment(event.end_datetime);
      const statusBadge = this.statusBadge(startDate, endDate, event.is_day === 'T', event.is_complete === 'T');

      let linksHtml = '';
      if (event.external_link_url) {
        const url =
          event.external_link_url.includes('http://') || event.external_link_url.includes('https://')
            ? encodeURI(event.external_link_url)
            : 'http://' + encodeURIComponent(event.external_link_url);
        const socialBadge = this.socialBadge(event.external_link_type);
        linksHtml += `<a href="${url}" class="list_link" target="_blank">${socialBadge}</a>`;
      }

      if (event.link_board_article && Object.keys(event.link_board_article).length > 0) {
        const boardLink = CAC_VIEW.getBoardLink(
          event.link_board_article.board_name,
          event.link_board_article.board_no,
          event.link_board_article.article_no,
        );
        linksHtml += `<a href="${boardLink}" class="list_link" target="_blank"><span class="ico_comm ico_post"></span>${CAC_UTIL.isMobile() ? '' : '게시글'}</a>`;
      }

      const isUseThirdPartyCal = this.checkUseThirdPartyCal();
      if (isUseThirdPartyCal) {
        linksHtml += `<a href="javascript:void(0)" onclick="CAC_LIST_VIEW.handleGoogleCalClick('${this.group_id}', '${event.id}', '${event.title}', '${event.start_datetime}', '${event.end_datetime}', '', '${event.is_day}')" class="list_link" style="width: 40px; height: 40px;border-radius: 50%;overflow: hidden;padding: 0;border: none;"><img src="https://m-img.cafe24.com/images/ec/calendar/ico_calendar_google.png" style="width: 100%" alt="구글 일정 바로가기" class="ico_shop"></a>`;
      }

      let productsHtml = '';
      let productsColHtml = '';
      if (event.link_products && event.link_products.length > 0) {
        productsHtml = `<div class="prd_list_wrap ${!isMobile ? 'swiper-container' : ''}"><ul class="prd_list type_row ${!isMobile ? 'swiper-wrapper' : ''}">`;
        productsColHtml = `<ul class="prd_list type_col">`;
        for (const product of event.link_products) {
          const productData = await CAC_CAFE24API.getProducts(product.product_no);
          if (!productData) continue;

          const productName = productData.product_name || product.product_name;
          const productPrice = productData.price || '';
          const productImage = productData.image || product.image;
          const soldOut = productData.sold_out === 'T' ? '<span class="soldout">SOLD OUT</span>' : '';
          const salePercent =
            productData.retail_price &&
            Number(productData.retail_price) > 0 &&
            Number(productData.retail_price) !== Number(productData.price)
              ? `<span class="num_sale" style="font-size: 16px">${Math.round(((Number(productData.retail_price) - Number(productData.price)) / Number(productData.retail_price)) * 100)}%</span>`
              : '';

          const itemNames = product.items.map((item) => item.item_name).join(', ');
          const itemName = itemNames.length > 0 ? `(${itemNames})` : '';

          productsHtml += `
            <li class="${!isMobile ? 'swiper-slide' : ''}">
              <a href="/product/detail.html?product_no=${product.product_no}" title="${productData?.product_name ?? product.product_name} ${itemName}" class="prd_link" target="_blank">
                <span class="thumb_wrap">
                  <img src="${productImage}" alt="${productName}" class="thumb_img">
                  ${soldOut}
                </span>
                ${
                  !isMobile
                    ? `
                <div class="info_prd">
                  <strong class="prd_tit">${productName}</strong>
                  <span class="prd_price" style="font-size: 16px">
                    ${salePercent}
                    <em class="emph_num">${Number(productPrice).toLocaleString()}</em>원
                  </span>
                </div>
                `
                    : ''
                }
              </a>
            </li>
          `;

          productsColHtml += `
            <li>
              <a href="/product/detail.html?product_no=${product.product_no}" title="${productData?.product_name ?? product.product_name} ${itemName}" class="prd_link" target="_blank">
                <span class="thumb_wrap">
                  <img src="${productImage}" alt="${productName}" class="thumb_img">
                  ${soldOut}
                </span>
                <div class="info_prd">
                  <strong class="prd_tit">${productName}</strong>
                  <span class="prd_price" style="font-size: 16px">
                    ${salePercent}
                    <em class="emph_num">${Number(productPrice).toLocaleString()}</em>원
                  </span>
                </div>
              </a>
            </li>
          `;
        }
        productsHtml += '</ul></div>';
        productsColHtml += '</ul>';
      }

      let cateHtml = '';
      if (event.link_categories && event.link_categories.length > 0) {
        const categoriesHTML = await CAC_VIEW.generateCategoriesHTML(
          event.link_categories,
          (html) => `<ul>${html}</ul>`,
        );
        cateHtml = `<div class="cate_wrap">${categoriesHTML}</div>`;
      }

      const showDate =
        event.is_day === 'T'
          ? startDate.isSame(endDate, 'day')
            ? startDate.format('MM/DD') + '(' + startDate.format('ddd') + ')'
            : `${startDate.format('MM/DD')}(${startDate.format('ddd')}) ~ ${endDate.format('MM/DD')}(${endDate.format('ddd')})`
          : `${startDate.format('MM/DD')}(${startDate.format('ddd')})  ${startDate.format('HH:mm')} ~ ${endDate.format('MM/DD')}(${endDate.format('ddd')})  ${endDate.format('HH:mm')}`;

      const collapsePCBtn = CAC_UTIL.isMobile()
        ? ''
        : '<button type="button" class="drop_btn"><span class="ico_comm ico_drop">내용 열기</span></button>';
      const collapseMobileBtn = CAC_UTIL.isMobile()
        ? '<button type="button" class="drop_btn"><span class="drop_txt">상세내역 보기</span><span class="ico_comm ico_drop"></span></button>'
        : '';
      const titleZoneStyle = isMobile
        ? event.description || productsColHtml || linksHtml || cateHtml
          ? 'padding-bottom: 0px;'
          : 'padding-bottom: 22px;'
        : 'padding-bottom: 0px;';
      html += `
        <li>
          <div class="prd_tit_wrap">
            <div class="title_zone" style="${titleZoneStyle}">
              <div class="title_wrap">
                <button type="button" class="tit_btn">
                  <span class="inner_wrap">
                    ${statusBadge}
                    <span class="txt_period">${showDate}</span>
                  </span>
                  <strong class="list_tit">${event.title}</strong>
                </button>
              </div>
              ${isMobile ? '' : `<div class="link_wrap" style="display: flex; align-items: center;">${linksHtml}</div>`}
              ${collapsePCBtn}
            </div>
            ${productsHtml}
          </div>
          ${
            event.description || productsColHtml || linksHtml || cateHtml
              ? `<div class="content_zone">
            ${event.description ? `<div class="cont_desc fr-view">${event.description}</div>` : ''}
            ${isMobile && linksHtml ? `<div class="link_wrap" style="display: flex; align-items: center;">${linksHtml}</div>` : ''}
            ${isMobile ? productsColHtml : ''}
            ${cateHtml}
          </div>`
              : ''
          }
          ${event.description || productsColHtml || linksHtml || cateHtml ? collapseMobileBtn : ''}
        </li>
      `;
    }

    return html;
  },
  // 접근권한 체크
  checkPermission: function () {
    /**
     * 프론트에서 전체캘린더 노출시 기본설정의 접근권한을 타고,
     * 단독은 그룹의 접근 권한을 타고
     * this.basic_setting.front_use_permission === T:전체|F:회원만
     */
    let isTrue = true;
    if (this.groupId === null) {
      if (this.member_id === CAFE24API.MALL_ID) return isTrue;
      if (this.basic_setting?.front_use_permission === 'T') {
        const Index = this.basic_setting?.front_permission.find((item) => item.group_no === CAC_LIST_VIEW.group_no);

        if (!Index) {
          isTrue = false;
        }
      }
    } else {
      if (this.member_id === CAFE24API.MALL_ID) return isTrue;
      const group = this.calendar_group.find((group) => group._id === this.groupId);
      if (group?.single_calendar_use_front_permission === 'T') {
        const Index = group?.single_calendar_front_permission.find((item) => item.group_no === CAC_LIST_VIEW.group_no);
        if (!Index) {
          isTrue = false;
        }
      }
    }

    return isTrue;
  },
  // 고객 캘린더 연동 여부 확인
  checkUseThirdPartyCal: function () {
    if (!!this.groupId) {
      const group = this.calendar_group.find((group) => group._id === this.groupId);
      return group && group.single_calendar_use_third_party_cal === 'T';
    } else {
      return this.basic_setting?.use_third_party_cal === 'T';
    }
  },
  handleGoogleCalClick: function (
    calendarGroupId,
    calendarId,
    title,
    start_datetime,
    end_datetime,
    description,
    allDay,
  ) {
    const url =
      'https://calendar.google.com/calendar/u/0/r/eventedit?details={description}&text={title}&dates={start_datetime}/{end_datetime}'
        .replace('{title}', he.unescape(encodeURIComponent(title)))
        .replace(
          '{start_datetime}',
          start_datetime
            ? allDay === 'F'
              ? encodeURIComponent(moment(start_datetime).format('YYYYMMDDTHHmmssZ'))
              : encodeURIComponent(moment(start_datetime).format('YYYYMMDD'))
            : '',
        )
        .replace(
          '{end_datetime}',
          end_datetime
            ? allDay === 'F'
              ? encodeURIComponent(moment(end_datetime).format('YYYYMMDDTHHmmssZ'))
              : encodeURIComponent(moment(end_datetime).add(1, 'day').format('YYYYMMDD'))
            : '',
        )
        .replace('{description}', '');
    CAC_DATA.updateThirdPartyCalClickCount(calendarGroupId, calendarId, 'google');
    window.open(url, '_blank');
  },
};
