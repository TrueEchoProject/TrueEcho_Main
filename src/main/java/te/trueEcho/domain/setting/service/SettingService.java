package te.trueEcho.domain.setting.service;
import te.trueEcho.domain.setting.dto.calendar.MonthlyPostListResponse;
import te.trueEcho.domain.setting.dto.mypage.EditMyInfoRequest;
import te.trueEcho.domain.setting.dto.mypage.MyInfoResponse;
import te.trueEcho.domain.setting.dto.mypage.MyPageResponse;
import te.trueEcho.domain.setting.dto.mypage.OtherPageResponse;
import te.trueEcho.domain.setting.dto.notiset.NotificationSettingDto;
import te.trueEcho.domain.setting.dto.pin.PinListResponse;
import te.trueEcho.domain.setting.dto.pin.PinsRequest;
import te.trueEcho.domain.setting.dto.random.RandomNotifyTResponse;

public interface SettingService {

    /**
     마이페이지 [GET]
     프로필 url
     이름
     위치정보
     제일 많이 받은 투표 (다 똑같으면 : 최신, 안 받으면 : null)
     개인당 핀 [게시물 3개 or 5개]
     */
    MyPageResponse getMyPage() ;

    OtherPageResponse getOtherPage(Long userId);
    /**
     캘린더 [GET]
     이번달 게시물 다 불러오기> -> 게시물
     */

    MonthlyPostListResponse getMonthlyPosts(Integer month);

    /**
     pins [GET]
     Post id로 핸들링
     */

    PinListResponse getPins();

    boolean editPins(PinsRequest editPinsRequest);



    /**
     개인정보 수정 [GET / PUT]
     프로필 이미지
     닉네임 중복검사
     */
    boolean editMyInfo(EditMyInfoRequest editMyInfoRequest) ;


    MyInfoResponse getMyInfo();



    /**
     포토타임 [GET / PUT]
     수정 권한 (알림을 못 받았으면, 대기 큐에 넣고, 나중에 알림을 받으면 큐에서 꺼내서 알림 시간대 수정)
     */

    RandomNotifyTResponse getRandomNotifyTime();
    RandomNotifyTResponse editRandomNotifyTime(int notifyTime);


    NotificationSettingDto getNotificationSetting();
    NotificationSettingDto editNotificationSetting(NotificationSettingDto notificationSettingDto);
}
