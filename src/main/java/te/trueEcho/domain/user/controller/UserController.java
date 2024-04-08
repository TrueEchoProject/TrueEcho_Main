package te.trueEcho.domain.user.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.user.dto.EditUserRequest;
import te.trueEcho.domain.user.dto.EditUserResponse;
import te.trueEcho.domain.user.dto.EmailCheckCodeDto;
import te.trueEcho.domain.user.service.UserService;
import te.trueEcho.global.response.ResponseForm;

import static te.trueEcho.global.response.ResponseCode.*;
import static te.trueEcho.global.response.ResponseCode.VERIFY_EMAIL_FAIL;

@Tag(name = "USER API")
@Slf4j
@Validated
@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping(value = "/edit") // 회원 정보 수정
    public ResponseEntity<ResponseForm> editUser(@RequestBody @Valid EditUserRequest editUserRequest) {

        boolean isVerified = userService.editUser(editUserRequest);
        return isVerified ?
                ResponseEntity.ok(ResponseForm.of(EDIT_PROFILE_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(EDIT_PROFILE_FAIL));
    }

    @GetMapping(value = "/edit") // 수정 정보를 조회
    public ResponseEntity<ResponseForm> getMemberEdit() {

        boolean isVerified = userService.getBoolEditUser();
        EditUserResponse editUserResponse = userService.getEditUser();

        return isVerified ?
                ResponseEntity.ok(ResponseForm.of(GET_EDIT_PROFILE_SUCCESS, editUserResponse)) :
                ResponseEntity.ok(ResponseForm.of(GET_EDIT_PROFILE_FAIL, ""));
    }
}
    




