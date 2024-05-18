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
}
