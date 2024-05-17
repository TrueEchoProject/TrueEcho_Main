package te.trueEcho.domain.setting.controller;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.setting.dto.*;
import te.trueEcho.domain.setting.service.SettingService;
import te.trueEcho.domain.user.dto.UserCheckRequest;
import te.trueEcho.domain.user.dto.ValidationType;
import te.trueEcho.domain.user.service.UserAuthService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

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
    public ResponseEntity<ResponseForm> getMyPage() {

        MyPageResponse myPageResponse = settingService.getMyPage();
        return myPageResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_MY_PAGE_SUCCESS, myPageResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_MY_PAGE_FAIL));
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
     */

    @GetMapping("/pins")
    public ResponseEntity<ResponseForm> getPins() {
        PinListResponse pinListResponse = settingService.getPins();
        return pinListResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_PINS_SUCCESS, pinListResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_PINS_FAIL));
    }

    @PatchMapping("/pins")
    public ResponseEntity<ResponseForm> editPins() {
        return
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_FAIL));
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
    public ResponseEntity<ResponseForm> editMyInfo(@RequestParam MultipartFile profileImage,
                                                   @RequestParam String nickname,
                                                   @RequestParam String username,
                                                   @RequestParam String location) {


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
                .location(location)
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
    public ResponseEntity<ResponseForm> editNotifyTime(@RequestBody int notifyTime) {

        RandomNotifyTResponse randomNotifyTResponse = settingService.getRandomNotifyTime();
        return randomNotifyTResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_NOTIFY_TIME_SUCCESS, randomNotifyTResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_NOTIFY_TIME_FAIL));
    }

    @GetMapping("/notifyTime")
    public ResponseEntity<ResponseForm> getNotifyTime() {
        RandomNotifyTResponse randomNotifyTResponse = settingService.getRandomNotifyTime();
        return randomNotifyTResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_NOTIFY_TIME_SUCCESS, randomNotifyTResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_NOTIFY_TIME_FAIL));
    }

}
