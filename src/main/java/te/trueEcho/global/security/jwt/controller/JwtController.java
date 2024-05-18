package te.trueEcho.global.security.jwt.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.user.entity.SuspendedUser;
import te.trueEcho.domain.user.repository.SuspendedUserRepository;
import te.trueEcho.domain.user.service.UserService;
import te.trueEcho.domain.user.dto.LoginRequest;
import te.trueEcho.global.response.ResponseForm;
import te.trueEcho.global.security.jwt.dto.TokenDto;
import te.trueEcho.global.security.jwt.service.JwtService;

import static te.trueEcho.global.response.ResponseCode.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class JwtController {
    private final JwtService jwtService;
    private final SuspendedUserRepository suspendedUserRepository;
    private final UserService userService;

    @Operation(summary = "로그인", description ="회원가입시 입력했던 유저이름과 패스워드 입력")
    @Parameters({@Parameter(name = "username", required = true, example = "heejune"),
            @Parameter(name = "password", required = true, example = "hqwe~!HH")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true, description = "hihihihi", useParameterTypeSchema = true)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "M002 - 로그인에 성공하였습니다."),
            @ApiResponse(responseCode = "400", description = "G003 - 유효하지 않은 입력입니다.\n"
                    + "G004 - 입력 타입이 유효하지 않습니다."),
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


    @DeleteMapping("accounts/logout")
    public ResponseEntity<ResponseForm> logout(@RequestHeader("Authorization") String token) {
        boolean isDeleted = jwtService.deleteRefreshToken();

        log.info("token: {} ", token);

        return isDeleted ?
                ResponseEntity.ok(ResponseForm.of(LOGOUT_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(LOGOUT_FAIL));
    }

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
