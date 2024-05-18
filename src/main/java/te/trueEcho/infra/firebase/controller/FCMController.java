package te.trueEcho.infra.firebase.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.global.response.ResponseForm;
import te.trueEcho.infra.firebase.dto.FCMTokenResponse;
import te.trueEcho.infra.firebase.service.FCMService;
import static te.trueEcho.global.response.ResponseCode.*;


@Tag(name = "USER API")
@Slf4j
@Validated
@RestController
@RequestMapping("/fcm")
@RequiredArgsConstructor
public class FCMController {

    private final FCMService fcmService;

    @PostMapping(value = "/save") // 토큰 저장
    public ResponseEntity<ResponseForm> saveToken(@RequestParam String token) {

        boolean isSaved = fcmService.saveToken(token);
        return isSaved ?
                ResponseEntity.ok(ResponseForm.of(FCM_TOKEN_SAVED_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(FCM_TOKEN_SAVED_FAIL));
    }


//    @GetMapping(value = "/read") // 기존의 토큰 정보 조회, 디버깅이나 특수한 검증 작업에만 사용
//    public ResponseEntity<ResponseForm> readToken() {
//
//        FCMTokenResponse fcmTokenResponse = fcmService.getToken();
//        return fcmTokenResponse != null ?
//                ResponseEntity.ok(ResponseForm.of(FCM_TOKEN_GET_SUCCESS, fcmTokenResponse)) :
//                ResponseEntity.ok(ResponseForm.of(FCM_TOKEN_GET_FAIL));
//    }
}
