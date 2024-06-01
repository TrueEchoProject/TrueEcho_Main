package te.trueEcho.global.security.jwt.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.user.entity.SuspendedUser;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.SuspendedUserRepository;
import te.trueEcho.domain.user.service.UserService;
import te.trueEcho.domain.user.dto.LoginRequest;
import te.trueEcho.global.response.ResponseForm;
import te.trueEcho.global.security.jwt.dto.TokenDto;
import te.trueEcho.global.security.jwt.service.JwtService;
import te.trueEcho.global.util.AuthUtil;
import te.trueEcho.infra.firebase.service.FCMService;

import static te.trueEcho.global.response.ResponseCode.*;
@Tag(name = "JWT", description = "JWT 토큰 관련 API")
@Slf4j
@RestController
@RequiredArgsConstructor
public class JwtController {
    private final JwtService jwtService;
    private final SuspendedUserRepository suspendedUserRepository;
    private final UserService userService;
    private final FCMService fcmService;
    private final AuthUtil authUtil;

    @Operation(summary = "로그인", description = "회원가입 시 입력했던 사용자 이름과 패스워드를 입력하여 로그인합니다.")
    @Parameters({
            @Parameter(name = "username", description = "사용자 이름", required = true, example = "heejune"),
            @Parameter(name = "password", description = "패스워드", required = true, example = "hqwe~!HH")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "M002 - 로그인에 성공하였습니다."),
            @ApiResponse(responseCode = "400", description = "G003 - 유효하지 않은 입력입니다.\nG004 - 입력 타입이 유효하지 않습니다."),
            @ApiResponse(responseCode = "401", description = "M005 - 계정 정보가 일치하지 않습니다.")
    })

    @PostMapping(value = "/accounts/login")
    public ResponseEntity<ResponseForm> login(@RequestBody LoginRequest loginRequest) {
        log.debug("login : {} {}", loginRequest.getEmail(), loginRequest.getPassword());
        boolean isEmpty = true;

        final TokenDto tokenDto = jwtService.login(loginRequest);

        isEmpty = (tokenDto == null) ||
                tokenDto.getRefreshToken().isBlank() ||
                tokenDto.getAccessToken().isBlank();

        SuspendedUser suspendedUser = suspendedUserRepository.findSuspendedUserByEmail(loginRequest.getEmail());
        if (suspendedUser != null) {
            // If the user is in the SuspendedUser table,    delete the user
            boolean isCanceled = userService.cancelDeleteUser(suspendedUser);
            return isCanceled ?
                    ResponseEntity.ok(ResponseForm.of(CANCEL_DELETE_USER_SUCCESS, tokenDto)) :
                    ResponseEntity.ok(ResponseForm.of(CANCEL_DELETE_USER_FAIL));
        }
        return isEmpty ?
                ResponseEntity.ok(ResponseForm.of(LOGIN_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(LOGIN_FAIL, tokenDto));
    }

    @Operation(summary = "로그아웃", description = "로그아웃을 수행합니다.")
    @Parameter(name = "Authorization", description = "인증 토큰", required = true, example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "LOGOUT_SUCCESS - 로그아웃 성공"),
            @ApiResponse(responseCode = "400", description = "LOGOUT_FAIL - 로그아웃 실패")
    })
    @DeleteMapping("accounts/logout")
    public ResponseEntity<ResponseForm> logout(@RequestHeader("Authorization") String token) {
        try {
            final User user = authUtil.getLoginUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseForm.of(LOGOUT_FAIL, "User is not authenticated"));
            }

            fcmService.removeToken(user);
            boolean isDeleted = jwtService.deleteRefreshToken(token);

            if (!isDeleted) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseForm.of(LOGOUT_FAIL, "Failed to delete refresh token"));
            }

            log.info("token: {} ", token);
            return ResponseEntity.ok(ResponseForm.of(LOGOUT_SUCCESS));

        } catch (Exception e) {
            log.error("Error occurred during logout: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseForm.of(LOGOUT_FAIL, "An error occurred during logout"));
        }
    }
    @Operation(summary = "토큰 갱신", description = "만료된 토큰을 갱신합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "REFRESHMENT_SUCCESS - 토큰 갱신 성공"),
            @ApiResponse(responseCode = "400", description = "REFRESHMENT_FAIL - 토큰 갱신 실패")
    })
    @GetMapping("/refresh")
    public ResponseEntity<ResponseForm> refreshToken() {

        final TokenDto tokenDto = jwtService.createToken();
        boolean isEmpty = true;
        isEmpty= tokenDto.getRefreshToken().isBlank() || tokenDto.getAccessToken().isBlank();

        return isEmpty ?
                ResponseEntity.ok(ResponseForm.of(REFRESHMENT_FAIL)) :
                ResponseEntity.ok(ResponseForm.of(REFRESHMENT_SUCCESS,tokenDto));
    }

}
