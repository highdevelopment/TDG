
//alert('main_d.js');

$(document).ready(function() {

	// mainVisualSlide 슬라이드 //
	var mainVisualSlide = $('.mainVisualSlide').bxSlider({
		mode: 'vertical'	// 가로 방향 수평 슬라이드
		, auto: false        // 자동 실행 여부
		, speed: 800        // 이동 속도를 설정 1000 -> 1초
		, pause: 6000	// 각각의 페이지 로딩 속도 1000 -> 1초
		, autoDelay: 6000		// 페이지 로딩 후 자동스타트 딜레이 초
		, moveSlides: 1     // 슬라이드 이동시 개수
		, slideWidth: 1200   // 슬라이드 너비
		, adaptiveHeight: true	//이미지자동높이조절
		, minSlides: 1      // 최소 노출 개수
		, maxSlides: 1      // 최대 노출 개수
	    , moveSlides: 1		// 한번이동갯수
		, slideMargin: 0    // 슬라이드간의 간격
		, autoHover: true   // 마우스 호버시 정지 여부
		, controls: true    // 이전 다음 버튼 노출 여부
		, autoControls: false // 플레이이스톱버튼 노출여부
		, pager: true      // 현재 위치 페이징 표시 여부 설정
		, responsive : true //슬라이더의 자동크기조정
		//, ticker: true	// 계속 흐르기
		//, speed: 6000	// 계속 흐르기 속도
	});
	// mainVisualSlide 슬라이드 //

	// shopSlide 슬라이드 //
	var shopSlide = $('.shopSlide').bxSlider({
		mode: 'horizontal'	// 가로 방향 수평 슬라이드
		, auto: false        // 자동 실행 여부
		, speed: 800        // 이동 속도를 설정 1000 -> 1초
		, pause: 6000	// 각각의 페이지 로딩 속도 1000 -> 1초
		, autoDelay: 6000		// 페이지 로딩 후 자동스타트 딜레이 초
		, moveSlides: 1     // 슬라이드 이동시 개수
		, slideWidth: 520   // 슬라이드 너비
		, adaptiveHeight: true	//이미지자동높이조절
		, minSlides: 1      // 최소 노출 개수
		, maxSlides: 1      // 최대 노출 개수
	    , moveSlides: 1		// 한번이동갯수
		, slideMargin: 0    // 슬라이드간의 간격
		, autoHover: true   // 마우스 호버시 정지 여부
		, controls: false    // 이전 다음 버튼 노출 여부
		, autoControls: false // 플레이이스톱버튼 노출여부
		, pager: true      // 현재 위치 페이징 표시 여부 설정
		, responsive : true //슬라이더의 자동크기조정
		//, ticker: true	// 계속 흐르기
		//, speed: 6000	// 계속 흐르기 속도
	});
	// shopSlide 슬라이드 //

	// newCourseList 슬라이드 //
	var newCourseList = $('.newCourseList').bxSlider({
		mode: 'horizontal'	// 가로 방향 수평 슬라이드
		, auto: false        // 자동 실행 여부
		, speed: 800        // 이동 속도를 설정 1000 -> 1초
		, pause: 6000	// 각각의 페이지 로딩 속도 1000 -> 1초
		, autoDelay: 6000		// 페이지 로딩 후 자동스타트 딜레이 초
		, moveSlides: 1     // 슬라이드 이동시 개수
		, slideWidth: 300   // 슬라이드 너비
		, adaptiveHeight: true	//이미지자동높이조절
		, minSlides: 3      // 최소 노출 개수
		, maxSlides: 3      // 최대 노출 개수
	    , moveSlides: 1		// 한번이동갯수
		, slideMargin: 50    // 슬라이드간의 간격
		, autoHover: true   // 마우스 호버시 정지 여부
		, controls: false    // 이전 다음 버튼 노출 여부
		, autoControls: false // 플레이이스톱버튼 노출여부
		, pager: true      // 현재 위치 페이징 표시 여부 설정
		, responsive : true //슬라이더의 자동크기조정
		//, ticker: true	// 계속 흐르기
		//, speed: 6000	// 계속 흐르기 속도
	});
	// newCourseList 슬라이드 //

	// recommendCourseList 슬라이드 //
	var recommendCourseList = $('.recommendCourseList').bxSlider({
		mode: 'horizontal'	// 가로 방향 수평 슬라이드
		, auto: false        // 자동 실행 여부
		, speed: 800        // 이동 속도를 설정 1000 -> 1초
		, pause: 6000	// 각각의 페이지 로딩 속도 1000 -> 1초
		, autoDelay: 6000		// 페이지 로딩 후 자동스타트 딜레이 초
		, moveSlides: 1     // 슬라이드 이동시 개수
		, slideWidth: 1200   // 슬라이드 너비
		, adaptiveHeight: true	//이미지자동높이조절
		, minSlides: 1      // 최소 노출 개수
		, maxSlides: 1      // 최대 노출 개수
	    , moveSlides: 1		// 한번이동갯수
		, slideMargin: 0    // 슬라이드간의 간격
		, autoHover: true   // 마우스 호버시 정지 여부
		, controls: true    // 이전 다음 버튼 노출 여부
		, autoControls: false // 플레이이스톱버튼 노출여부
		, pager: false      // 현재 위치 페이징 표시 여부 설정
		, responsive : true //슬라이더의 자동크기조정
		//, ticker: true	// 계속 흐르기
		//, speed: 6000	// 계속 흐르기 속도
	});
	// recommendCourseList 슬라이드 //

	// // gameRecordPopSlide 슬라이드 //
	// var gameRecordPopSlide = $('.gameRecordPopSlide').bxSlider({
	// 	mode: 'horizontal'	// 가로 방향 수평 슬라이드
	// 	, auto: false        // 자동 실행 여부
	// 	, speed: 800        // 이동 속도를 설정 1000 -> 1초
	// 	, pause: 6000	// 각각의 페이지 로딩 속도 1000 -> 1초
	// 	, autoDelay: 6000		// 페이지 로딩 후 자동스타트 딜레이 초
	// 	, moveSlides: 1     // 슬라이드 이동시 개수
	// 	, slideWidth: 510   // 슬라이드 너비
	// 	, adaptiveHeight: true	//이미지자동높이조절
	// 	, minSlides: 1      // 최소 노출 개수
	// 	, maxSlides: 2      // 최대 노출 개수
	//     , moveSlides: 1		// 한번이동갯수
	// 	, slideMargin: 20    // 슬라이드간의 간격
	// 	, autoHover: false   // 마우스 호버시 정지 여부
	// 	, controls: true    // 이전 다음 버튼 노출 여부
	// 	, autoControls: false // 플레이이스톱버튼 노출여부
	// 	, pager: false      // 현재 위치 페이징 표시 여부 설정
	// 	, responsive : true //슬라이더의 자동크기조정
	// 	//, ticker: true	// 계속 흐르기
	// 	//, speed: 6000	// 계속 흐르기 속도
	// });
	// // gameRecordPopSlide 슬라이드 //

	// 홀인원기록 탭메뉴 //
	$('.allRecordH3, .myRecordH3').on('click', function(e) {
		e.preventDefault();

		if($(this).attr('class') == "allRecordH3") {
			$('.allRecord').show();
			$('.myRecord').hide();
			$('.allRecordH3').addClass('active');
			$('.myRecordH3').removeClass('active');

		} else if($(this).attr('class') == "myRecordH3") {
			$('.allRecord').hide();
			$('.myRecord').show();
			$('.allRecordH3').removeClass('active');
			$('.myRecordH3').addClass('active');
		}
	});

	// 매장찾기 탭메뉴 //
	$('.searchStoreH3, .frequenterStoreH3').on('click', function(e) {
		e.preventDefault();

		if($(this).attr('class') == "searchStoreH3") {
			$('.searchStore').show();
			$('.frequenterStore').hide();
			$('.searchStoreH3').addClass('active');
			$('.frequenterStoreH3').removeClass('active');

		} else if($(this).attr('class') == "frequenterStoreH3") {
			$('.searchStore').hide();
			$('.frequenterStore').show();
			$('.searchStoreH3').removeClass('active');
			$('.frequenterStoreH3').addClass('active');
		}
	});

	// 이벤트 탭메뉴 //
	$('.mainEvent > h3 > a').on('click', function(e) {
		e.preventDefault();
		var idx = $('.mainEvent > h3 > a').index($(this));
		
		$('.mainEvent > h3').removeClass('on');
		$('.mainEvent > h3:eq(' + idx + ')').addClass('on');
		$('.mE').hide();
		$('.mE:eq(' + idx + ')').show();
	});

	// 스윙영상 //
	$('.todayBestH3, .weekBestH3').on('click', function(e) {
		e.preventDefault();

		if($(this).attr('class') == "todayBestH3") {
			$('.todayBest').show();
			$('.weekBest').hide();
			$('.todayBestH3').addClass('active');
			$('.weekBestH3').removeClass('active');

		} else if($(this).attr('class') == "weekBestH3") {
			$('.todayBest').hide();
			$('.weekBest').show();
			$('.todayBestH3').removeClass('active');
			$('.weekBestH3').addClass('active');
		}
	});

	
	$('#btnLogOut').click(function() {
		$('#form_logout')[0].submit();
	})
});

  
  