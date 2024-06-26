package te.trueEcho.domain.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.user.dto.*;
import te.trueEcho.domain.user.service.UserAuthService;
import te.trueEcho.global.response.ResponseForm;

import static te.trueEcho.global.response.ResponseCode.*;

@Tag(name = "계정")
@Slf4j
@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class UserAuthController {

    private final UserAuthService userAuthService;

    @Operation(summary = "계정중복 조회", description = """
            1. 이메일로 이미 등록된 계정인지를 확인.
            2. 이메일이 중복되지 않은 경우 이메일 주소로 인증코드 전송.
            3. 이메일이 중복된 경우 이메일 중복을 클라이언트에 알림.
            """)
    @Parameters({@Parameter(name = "email", required = true, example = "trueEcho@gmail.com"),
            @Parameter(name = "username", required = true, example = "heejoon")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = """
                    U011 - 사용가능한 EMAIL 입니다.
                    U012 - 사용불가능한 EMAIL 입니다."""),
            @ApiResponse(responseCode = "400", description = """
                    G003 - 유효하지 않은 입력입니다.
                    G004 - 입력 타입이 유효하지 않습니다.""")
    })

    @GetMapping(value = "/{type}/duplication")
    public ResponseEntity<ResponseForm> checkEmailDuplication(
            @PathVariable String type,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String email) {

        UserCheckRequest emailRequestDto =  UserCheckRequest.builder()
                .email(email)
                .nickname(nickname)
                .build();

        final boolean isDuplicated = userAuthService.isTypeDuplicated(
                UserCheckRequest.builder()
                .email(email)
                .nickname(nickname)
                .build(), ValidationType.valueOf(type.toUpperCase()));

        if (isDuplicated)
            return ResponseEntity.ok(ResponseForm.of(NOT_DUPLICATED_FAIL, type)); // 중복

      if(type.equals("email")) return sendEmail(nickname,email);

      return ResponseEntity.ok(ResponseForm.of(NOT_DUPLICATED_SUCCESS, type));
    }

    @Operation(summary = "코드 확인", description = "이메일 인증 코드를 확인합니다.")
    @Parameters({
            @Parameter(name = "email", required = true, example = "trueEcho@gmail.com"),
            @Parameter(name = "checkCode", required = true, example = "123456")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "VERIFY_EMAIL_SUCCESS - 이메일 인증 성공"),
            @ApiResponse(responseCode = "400", description = "VERIFY_EMAIL_FAIL - 이메일 인증 실패")
    })
    @GetMapping(value = "/checkcode")
    public ResponseEntity<ResponseForm> checkCode(
            @RequestParam String email,
            @RequestParam String checkCode) {

      boolean isVerified =   userAuthService.checkEmailCode(
              CheckCodeRequest.builder()
              .email(email)
              .checkCode(checkCode)
              .build()
      );

      return isVerified ?
             ResponseEntity.ok(ResponseForm.of(VERIFY_EMAIL_SUCCESS, "")) :
             ResponseEntity.ok(ResponseForm.of(VERIFY_EMAIL_FAIL, ""));
    }

    @Operation(summary = "회원가입", description = "사용자의 정보를 이용하여 회원가입")
    @Parameters({@Parameter(name = "email", required = true, example = "trueEcho@gmail.com"),
            @Parameter(name = "username", required = true, example = "heejune")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = """
                    U001 - 회원가입에 성공하였습니다.
                    U013 - 이메일 인증을 완료할 수 없습니다."""),
            @ApiResponse(responseCode = "400", description = """
                    G003 - 유효하지 않은 입력입니다.
                    G004 - 입력 타입이 유효하지 않습니다.
                    U002 - 이미 존재하는 사용자 이름입니다.
                    U007 - 인증 이메일 전송을 먼저 해야합니다.""")
    })
    @PostMapping(value = "/register")
    public ResponseEntity<ResponseForm> register(@RequestBody RegisterRequest registerRequest) {
        final boolean isRegistered = userAuthService.registerUser(registerRequest);

        return isRegistered ?
                ResponseEntity.ok(ResponseForm.of(REGISTER_SUCCESS, true)) :
                ResponseEntity.ok(ResponseForm.of(VERIFY_EMAIL_FAIL, false));
    }

    @Operation(summary = "인증메일 전송", description = "회원의 중복을 확인하기 위해 이메일 인증코드 전송")
    @Parameters({@Parameter(name = "email", required = true, example = "trueEcho@gmail.com"),
            @Parameter(name = "nickname", required = true, example = "heejune")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "M014 - 인증이메일을 전송하였습니다."),
            @ApiResponse(responseCode = "400", description = """
                    G003 - 유효하지 않은 입력입니다.
                    G004 - 입력 타입이 유효하지 않습니다.
                    M002 - 이미 존재하는 사용자 이름입니다.""")
    })

    @GetMapping(value = "/email")
    public ResponseEntity<ResponseForm> sendEmail(
            @RequestParam(required = false) String nickname,
            @RequestParam String email) {

        UserCheckRequest emailRequestDto =  UserCheckRequest.builder()
                .email(email)
                .nickname(nickname)
                .build();

        final boolean sent = userAuthService.sendEmailCode(emailRequestDto);
        return sent ?
                ResponseEntity.ok(ResponseForm.of(SEND_EMAIL_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(SEND_EMAIL_FAIL));
    }

    @Operation(summary = "비밀번호 수정", description = "사용자의 비밀번호를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "UPDATE_PASSWORD_SUCCESS - 비밀번호 수정 성공"),
            @ApiResponse(responseCode = "400", description = "UPDATE_PASSWORD_FAIL - 비밀번호 수정 실패")
    })
    @PatchMapping("/password")
    public ResponseEntity<ResponseForm> updatePassword(
            @RequestBody UpdatePasswordRequest registerRequest) {

        boolean isVerified = userAuthService.checkEmailCode(
                CheckCodeRequest.builder()
                        .email(registerRequest.getEmail())
                        .checkCode(registerRequest.getVerificationCode())
                        .build()
        );

        if (!isVerified) {
            return ResponseEntity.ok(ResponseForm.of(VERIFY_EMAIL_FAIL));
        }

        final boolean isUpdated = userAuthService.updatePassword(registerRequest);

        return isUpdated ?
                ResponseEntity.ok(ResponseForm.of(UPDATE_PASSWORD_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(UPDATE_PASSWORD_FAIL));
    }
}
    




