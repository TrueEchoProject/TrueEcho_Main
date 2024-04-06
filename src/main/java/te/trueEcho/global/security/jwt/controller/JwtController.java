package te.trueEcho.global.security.jwt.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.user.dto.LoginUserDto;
import te.trueEcho.global.response.ResponseForm;
import te.trueEcho.global.security.jwt.dto.TokenDto;
import te.trueEcho.global.security.jwt.service.JwtService;

import static te.trueEcho.global.response.ResponseCode.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class JwtController {
    private final JwtService jwtService;

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
    public ResponseEntity<ResponseForm> login(@RequestBody LoginUserDto loginUserDto) {
        log.info("login : {} {}", loginUserDto.getEmail(), loginUserDto.getPassword());
        boolean isEmpty = true;

        final TokenDto tokenDto = jwtService.login(loginUserDto);
        isEmpty= tokenDto.getRefreshToken().isBlank() || tokenDto.getAccessToken().isBlank();

        return isEmpty ?
                ResponseEntity.ok(ResponseForm.of(LOGIN_SUCCESS)):
                ResponseEntity.ok(ResponseForm.of(LOGIN_FAIL,tokenDto));

    }


    @GetMapping("accounts/logout")
    public ResponseEntity<ResponseForm> logout(@RequestHeader("Authorization") String token) {
        boolean isDeleted = jwtService.deleteRefreshToken();

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
