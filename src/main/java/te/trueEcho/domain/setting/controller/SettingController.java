package te.trueEcho.domain.setting.controller;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.setting.dto.calendar.MonthlyPostListResponse;
import te.trueEcho.domain.setting.dto.mypage.EditMyInfoRequest;
import te.trueEcho.domain.setting.dto.mypage.MyInfoResponse;
import te.trueEcho.domain.setting.dto.mypage.MyPageResponse;
import te.trueEcho.domain.setting.dto.mypage.OtherPageResponse;
import te.trueEcho.domain.setting.dto.notiset.NotificationSettingDto;
import te.trueEcho.domain.setting.dto.pin.PinListResponse;
import te.trueEcho.domain.setting.dto.pin.PinsRequest;
import te.trueEcho.domain.setting.dto.random.RandomNotifyTResponse;
import te.trueEcho.domain.setting.service.SettingService;
import te.trueEcho.domain.user.dto.UserCheckRequest;
import te.trueEcho.domain.user.dto.ValidationType;
import te.trueEcho.domain.user.service.UserAuthService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

import javax.annotation.Nullable;

@RestController
@RequiredArgsConstructor
@RequestMapping("/setting")
public class SettingController {

    private final SettingService settingService;
    private final UserAuthService userAuthService;
    /**
     마이페이지 [GET]
     프로필 url
     이름
     제일 많이 받은 투표 (다 똑같으면 : 최신, 안 받으면 : null)
     개인당 핀 [게시물 3개 or 5개]
     */

    @GetMapping("/myPage")
    public ResponseEntity<ResponseForm> getMyPage(@RequestParam @Nullable Long userId) {
        if(userId==null){
            MyPageResponse myPageResponse = settingService.getMyPage();
            return myPageResponse != null ?
                    ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_MY_PAGE_SUCCESS, myPageResponse)) :
                    ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_MY_PAGE_FAIL));
        }else{
            OtherPageResponse otherPageResponse = settingService.getOtherPage(userId);
            return otherPageResponse != null ?
                    ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_OTHER_PAGE_SUCCESS, otherPageResponse)) :
                    ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_OTHER_PAGE_FAIL));
        }
    }
    /**
     캘린더 [GET]
     이번달 게시물 다 불러오기> -> 게시물
     */
    @GetMapping("/monthlyPosts")
    public ResponseEntity<ResponseForm> getMonthlyPosts() {

        MonthlyPostListResponse monthlyPostListResponse = settingService.getMonthlyPosts(null);

        return monthlyPostListResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_MONTHLY_POST_SUCCESS, monthlyPostListResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_MONTHLY_POST_FAIL));
    }
    /**
     pins [GET]
     Post id로 핸들링

     핀에 대한 요청 3가지
     1. 이전에 정해진 핀이 아무것도 없을 때 오는 요청 (post)
     2. 이전에 정해진 핀이 있을 때 수정된 핀이 오는 요청
     3. 이전에 정해진 핀이 있을 때 삭제된 핀이 오는 요청 ->
     */

    @GetMapping("/pins")
    public ResponseEntity<ResponseForm> getPins() {
        PinListResponse pinListResponse = settingService.getPins();
        return pinListResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_PINS_SUCCESS, pinListResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_PINS_FAIL));
    }

    @PutMapping("/pins")
    public ResponseEntity<ResponseForm> editPins(@RequestBody PinsRequest PinsRequest) {

        PinListResponse pinListResponse   = settingService.editPins(PinsRequest);

        return pinListResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.PUT_PINS_SUCCESS, pinListResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.PUT_PINS_FAIL));
    }

    /**
     개인정보 수정 [GET / PUT]
     프로필 이미지
     닉네임 중복검사
     */

    @GetMapping("/myInfo")
    public ResponseEntity<ResponseForm> getMyInfo() {
        MyInfoResponse myInfoResponse =  settingService.getMyInfo();
        return myInfoResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_MY_INFO_SUCCESS, myInfoResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_MY_INFO_FAIL));
    }

    @PatchMapping("/myInfo")
    public ResponseEntity<ResponseForm> editMyInfo(    @RequestParam(required = false) MultipartFile profileImage,
                                                       @RequestParam(required = false) String nickname,
                                                       @RequestParam(required = false) String username,
                                                       @RequestParam(required = false) Double x,
                                                       @RequestParam(required = false) Double y) {

        boolean isDuplicated =  userAuthService.isTypeDuplicated(
                UserCheckRequest.builder()
                        .nickname(nickname)
                        .build(), ValidationType.NICKNAME);

        if (isDuplicated){
            return ResponseEntity.ok(ResponseForm.of(ResponseCode.NOT_DUPLICATED_FAIL));
        }

        boolean isEdited =  settingService.editMyInfo(EditMyInfoRequest.builder()
                .profileImage(profileImage)
                .nickname(nickname)
                .username(username)
                .x(x)
                .y(y)
                .build());

        if (isEdited) {
            MyInfoResponse myInfoResponse =  settingService.getMyInfo();
            return myInfoResponse != null ?
                    ResponseEntity.ok(ResponseForm.of(ResponseCode.PUT_MY_INFO_SUCCESS, myInfoResponse)) :
                    ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_MY_INFO_FAIL));
        } else {
            return ResponseEntity.ok(ResponseForm.of(ResponseCode.PUT_MY_INFO_FAIL));

        }
    }



    /**
     포토타임 [GET / PUT]
     수정 권한 (알림을 못 받았으면, 대기 큐에 넣고, 나중에 알림을 받으면 큐에서 꺼내서 알림 시간대 수정)
    TODO: 이거 자료구조 만들어야 됨.
     */

    @PatchMapping("/notifyTime")
    public ResponseEntity<ResponseForm> editNotifyTime(@RequestParam int editTime) {
        RandomNotifyTResponse randomNotifyTResponse = settingService.editRandomNotifyTime(editTime);

        return randomNotifyTResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.PUT_NOTIFY_TIME_SUCCESS, randomNotifyTResponse.getMsg())) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.PUT_NOTIFY_TIME_FAIL));
    }

    @GetMapping("/notifyTime")
    public ResponseEntity<ResponseForm> getNotifyTime() {
        RandomNotifyTResponse randomNotifyTResponse = settingService.getRandomNotifyTime();
        return randomNotifyTResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_NOTIFY_TIME_SUCCESS, randomNotifyTResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_NOTIFY_TIME_FAIL));
    }


    /*
    알림창 [GET / PUT]
    댓글 답글 알림
    친구 요청
    게시물 좋아요
    투표 마감 알림
    랭킹 결과 -> 내 등수.
    개인적으로 투표 받았을 때
     */

    @GetMapping("/notificationSetting")
    public ResponseEntity<ResponseForm> getNotificationSetting() {
        NotificationSettingDto notificationSettingDto = settingService.getNotificationSetting();

        if (notificationSettingDto != null) {
            return ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_NOTIFICATION_OPTION_SUCCESS, notificationSettingDto));
        } else {
            return ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_NOTIFICATION_OPTION_FAIL));
        }
    }

    @PatchMapping("/notificationSetting")
    public ResponseEntity<ResponseForm> editNotificationSetting(
            @RequestBody NotificationSettingDto notificationSettingDto) {

        NotificationSettingDto newDto = settingService.editNotificationSetting(notificationSettingDto);

        if (notificationSettingDto != null) {
            return ResponseEntity.ok(ResponseForm.of(ResponseCode.PUT_NOTIFICATION_OPTION_SUCCESS, newDto));
        } else {
            return ResponseEntity.ok(ResponseForm.of(ResponseCode.PUT_NOTIFICATION_OPTION_FAIL));
        }
    }
}
