package te.trueEcho.domain.user.controller;


import io.swagger.annotations.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.user.dto.LoginUserDto;
import te.trueEcho.domain.user.dto.SignUpUserDto;
import te.trueEcho.domain.user.dto.EmailUserDto;
import te.trueEcho.domain.user.service.UserAuthService;
import te.trueEcho.domain.user.service.UserAuthServiceImpl;
import te.trueEcho.global.response.ResponseForm;

import static te.trueEcho.global.response.ResponseCode.*;

@Slf4j
@Api(tags = "유저 식별 RESTAPI")
@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class UserAuthController {
    private final UserAuthService userAuthService;

    @ApiOperation(value = "계정중복 조회")
    @ApiResponses({
            @ApiResponse(code = 200, message = """
                    U011 - 사용가능한 EMAIL 입니다.
                    U012 - 사용불가능한 EMAIL 입니다."""),
            @ApiResponse(code = 400, message = """
                    G003 - 유효하지 않은 입력입니다.
                    G004 - 입력 타입이 유효하지 않습니다.""")
    })
    @ApiImplicitParam(name = "email", value = "이메일", required = true, example = "trueEcho@gmail.com")


    @PostMapping(value = "/duplication")
    public ResponseEntity<ResponseForm> checkAccountDuplication(
            @RequestBody EmailUserDto emailUserDTO) {
        final boolean isDuplicated = userAuthService.isDuplicated(emailUserDTO);
        return isDuplicated ?
                ResponseEntity.ok(ResponseForm.of(NOT_DUPLICATED_FAIL, true)) :
                ResponseEntity.ok(ResponseForm.of(NOT_DUPLICATED_ACCESS, false)) ;
    }

    @ApiOperation(value = "회원가입")
    @ApiResponses({
            @ApiResponse(code = 200, message = """
                    U001 - 회원가입에 성공하였습니다.
                    U013 - 이메일 인증을 완료할 수 없습니다."""),
            @ApiResponse(code = 400, message = """
                    G003 - 유효하지 않은 입력입니다.
                    G004 - 입력 타입이 유효하지 않습니다.
                    U002 - 이미 존재하는 사용자 이름입니다.
                    U007 - 인증 이메일 전송을 먼저 해야합니다.""")
    })
    @PostMapping(value = "/register")
    public ResponseEntity<ResponseForm> register(@RequestBody SignUpUserDto signUpUserDTO) {
        final boolean isRegistered = userAuthService.registerUser(signUpUserDTO);

        return isRegistered ?
                ResponseEntity.ok(ResponseForm.of(REGISTER_SUCCESS, true)) :
                ResponseEntity.ok(ResponseForm.of(VERIFY_EMAIL_FAIL, false));
    }

    @ApiOperation(value = "인증메일 전송")
    @ApiResponses({
            @ApiResponse(code = 200, message = "M014 - 인증이메일을 전송하였습니다."),
            @ApiResponse(code = 400, message = """
                    G003 - 유효하지 않은 입력입니다.
                    G004 - 입력 타입이 유효하지 않습니다.
                    M002 - 이미 존재하는 사용자 이름입니다.""")
    })


    @PostMapping(value = "/email")
    public ResponseEntity<ResponseForm> sendEmail(
            @RequestBody EmailUserDto emailUserDTO) {

      final boolean sent =  userAuthService.sendEmailCode(emailUserDTO);
        return sent ?
                ResponseEntity.ok(ResponseForm.of(SEND_EMAIL_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(SEND_EMAIL_FAIL));
    }


    @ApiOperation(value = "로그인")
    @ApiResponses({
            @ApiResponse(code = 200, message = "M002 - 로그인에 성공하였습니다."),
            @ApiResponse(code = 400, message = "G003 - 유효하지 않은 입력입니다.\n"
                    + "G004 - 입력 타입이 유효하지 않습니다."),
            @ApiResponse(code = 401, message = "M005 - 계정 정보가 일치하지 않습니다.")
    })
    @PostMapping(value = "/login")
    public ResponseEntity<ResponseForm> login(@RequestBody LoginUserDto loginUserDto) {
        final boolean isLoggedIn =  userAuthService.login(loginUserDto);
        return isLoggedIn ?
                ResponseEntity.ok(ResponseForm.of(LOGIN_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(LOGIN_FAIL));
    }
}
