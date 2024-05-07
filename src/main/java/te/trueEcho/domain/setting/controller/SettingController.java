package te.trueEcho.domain.setting.controller;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import te.trueEcho.domain.setting.service.SettingService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

@RestController
@RequiredArgsConstructor
@RequestMapping("/setting")
public class SettingController {

    private final SettingService settingService;

    /**
     마이페이지 [GET]
     프로필 url
     이름
     제일 많이 받은 투표 (다 똑같으면 : 최신, 안 받으면 : null)
     개인당 핀 [게시물 3개 or 5개]
     */
    @GetMapping("/myPage")
    public ResponseEntity<ResponseForm> getMyPage() {
          return
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_FAIL));
    }
    /**
     캘린더 [GET]
     이번달 게시물 다 불러오기> -> 게시물
     */
    @GetMapping("/monthlyPosts")
    public ResponseEntity<ResponseForm> getMonthlyPosts() {
        return
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_FAIL));
    }
    /**
     pins [GET]
     Post id로 핸들링
     */
    @RequestMapping("/pins")
    public ResponseEntity<ResponseForm> editPins() {
        return
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_FAIL));
    }
    /**
     개인정보 수정 [GET / PUT]
     프로필 이미지
     닉네임 중복검사
     */
    @RequestMapping("/myInfo")
    public ResponseEntity<ResponseForm> editMyInfo() {
        return
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_FAIL));
    }
    /**
     차단 [GET / PUT]
     차단 읽기
     차단 반영
     */

    @RequestMapping("/block")
    public ResponseEntity<ResponseForm> editBlockedUser() {
        return
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_FAIL));
    }

    /**
     포토타임 [GET / PUT]
     수정 권한 (알림을 못 받았으면, 대기 큐에 넣고, 나중에 알림을 받으면 큐에서 꺼내서 알림 시간대 수정)
     */
    @RequestMapping("/notifyTime")
    public ResponseEntity<ResponseForm> editNotifyTime() {
        return
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_FAIL));
    }



}
