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
import te.trueEcho.domain.user.dto.LoginUserDto;
import te.trueEcho.domain.user.dto.SignUpUserDto;
import te.trueEcho.domain.user.dto.EmailUserDto;
import te.trueEcho.domain.user.service.UserAuthService;
import te.trueEcho.global.config.Admin;
import te.trueEcho.global.response.ResponseForm;
import static te.trueEcho.global.response.ResponseCode.*;

@Tag(name = "유저 식별 RESTAPI")
@Slf4j
@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class UserAuthController {

    private final UserAuthService userAuthService;

    @Operation(summary = "계정중복 조회", description = "이메일로 이미 등록된 계정인지를 확인")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = """
                    U011 - 사용가능한 EMAIL 입니다.
                    U012 - 사용불가능한 EMAIL 입니다."""),
            @ApiResponse(responseCode = "400", description = """
                    G003 - 유효하지 않은 입력입니다.
                    G004 - 입력 타입이 유효하지 않습니다.""")
    })
    @Parameters({@Parameter()})
    @Parameter(name = "email", required = true, example = "trueEcho@gmail.com")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,    description = "hihihihi",
            useParameterTypeSchema = true)
    @PostMapping(value = "/duplication")


    public ResponseEntity<ResponseForm> checkAccountDuplication(
            @RequestBody EmailUserDto emailUserDTO) {
        final boolean isDuplicated = userAuthService.isDuplicated(emailUserDTO);
        return isDuplicated ?
                ResponseEntity.ok(ResponseForm.of(NOT_DUPLICATED_FAIL, true)) :
                ResponseEntity.ok(ResponseForm.of(NOT_DUPLICATED_ACCESS, false)) ;
    }

    @Operation(summary = "회원가입", description = "사용자의 정보를 이용하여 회원가입")
    @Parameters({
            @Parameter(name = "email", required = true, example = "trueEcho@gmail.com"),
            @Parameter(name = "email", required = true, example = "trueEcho@gmail.com"),
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,    description = "hihihihi",
            useParameterTypeSchema = true)
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
    public ResponseEntity<ResponseForm> register(@RequestBody SignUpUserDto signUpUserDTO) {
        final boolean isRegistered = userAuthService.registerUser(signUpUserDTO);

        return isRegistered ?
                ResponseEntity.ok(ResponseForm.of(REGISTER_SUCCESS, true)) :
                ResponseEntity.ok(ResponseForm.of(VERIFY_EMAIL_FAIL, false));
    }

    @Operation(summary = "인증메일 전송", description = "회원의 중복을 확인하기 위해 이메일 인증코드 전송")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "M014 - 인증이메일을 전송하였습니다."),
            @ApiResponse(responseCode= "400", description= """
                    G003 - 유효하지 않은 입력입니다.
                    G004 - 입력 타입이 유효하지 않습니다.
                    M002 - 이미 존재하는 사용자 이름입니다.""")
    })

    @Admin
    @PostMapping(value = "/email")
    public ResponseEntity<ResponseForm> sendEmail(
            @RequestBody EmailUserDto emailUserDTO) {

      final boolean sent =  userAuthService.sendEmailCode(emailUserDTO);
        return sent ?
                ResponseEntity.ok(ResponseForm.of(SEND_EMAIL_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(SEND_EMAIL_FAIL));
    }


    @Operation(summary = "로그인", description ="회원의 중복을 확인하기 위해 이메일 인증코드 전송")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "M002 - 로그인에 성공하였습니다."),
            @ApiResponse(responseCode = "400", description = "G003 - 유효하지 않은 입력입니다.\n"
                    + "G004 - 입력 타입이 유효하지 않습니다."),
            @ApiResponse(responseCode = "401", description = "M005 - 계정 정보가 일치하지 않습니다.")
    })
    @PostMapping(value = "/login")
    public ResponseEntity<ResponseForm> login(@RequestBody LoginUserDto loginUserDto) {
        final boolean isLoggedIn =  userAuthService.login(loginUserDto);
        return isLoggedIn ?
                ResponseEntity.ok(ResponseForm.of(LOGIN_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(LOGIN_FAIL));
    }
}
