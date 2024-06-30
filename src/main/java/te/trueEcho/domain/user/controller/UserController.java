package te.trueEcho.domain.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.user.dto.EditUserRequest;
import te.trueEcho.domain.user.dto.EditUserResponse;
import te.trueEcho.domain.user.service.UserService;
import te.trueEcho.global.response.ResponseForm;
import te.trueEcho.global.security.jwt.service.JwtService;

import static te.trueEcho.global.response.ResponseCode.*;

@Tag(name = "USER API", description = "사용자 계정 관리 API")
@Slf4j
@Validated
@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    @Operation(summary = "회원 정보 수정", description = "회원 정보를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "EDIT_PROFILE_SUCCESS - 프로필 수정 성공"),
            @ApiResponse(responseCode = "400", description = "EDIT_PROFILE_FAIL - 프로필 수정 실패")
    })
    @PutMapping(value = "/edit") // 회원 정보 수정
    public ResponseEntity<ResponseForm> editUser(@RequestBody @Valid EditUserRequest editUserRequest) {

        boolean isEdited = userService.editUser(editUserRequest);
        return isEdited ?
                ResponseEntity.ok(ResponseForm.of(EDIT_PROFILE_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(EDIT_PROFILE_FAIL));
    }

    @Operation(summary = "수정 정보 조회", description = "수정된 회원 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GET_EDIT_PROFILE_SUCCESS - 수정 정보 조회 성공"),
            @ApiResponse(responseCode = "400", description = "GET_EDIT_PROFILE_FAIL - 수정 정보 조회 실패")
    })
    @GetMapping(value = "/edit") // 수정 정보를 조회
    public ResponseEntity<ResponseForm> getMemberEdit() {

        boolean isEdited = userService.getBoolEditUser();
        EditUserResponse editUserResponse = userService.getEditUser();

        return isEdited ?
                ResponseEntity.ok(ResponseForm.of(GET_EDIT_PROFILE_SUCCESS, editUserResponse)) :
                ResponseEntity.ok(ResponseForm.of(GET_EDIT_PROFILE_FAIL, ""));
    }

    @Operation(summary = "회원 탈퇴", description = "회원 탈퇴 및 관련 토큰 삭제")
    @Parameters({
            @Parameter(name = "Authorization", required = true, description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "DELETE_USER_SUCCESS - 회원 탈퇴 성공"),
            @ApiResponse(responseCode = "400", description = "DELETE_USER_FAIL - 회원 탈퇴 실패")
    })
    @DeleteMapping("/deleteUser")
    public ResponseEntity<ResponseForm> deleteUser(@RequestHeader("Authorization") String token) {


        boolean isDeleted = jwtService.deleteRefreshToken(token);
        boolean isDeletedUser = userService.deleteUser();

        log.info("token: {} ", token);

        return isDeleted && isDeletedUser?
                ResponseEntity.ok(ResponseForm.of(DELETE_USER_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(DELETE_USER_FAIL));
    }
}
    




