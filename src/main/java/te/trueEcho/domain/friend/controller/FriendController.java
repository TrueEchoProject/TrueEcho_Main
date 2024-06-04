package te.trueEcho.domain.friend.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.friend.dto.ConfirmFriendResponse;
import te.trueEcho.domain.friend.dto.FriendListResponse;
import te.trueEcho.domain.friend.service.FriendService;
import te.trueEcho.global.response.ResponseForm;

import java.util.List;

import static te.trueEcho.global.response.ResponseCode.*;

@Tag(name = "Friend API", description = "친구 관리 API")
@Slf4j
@Validated
@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    @Operation(summary = "친구 추가", description = "새로운 친구를 추가합니다.")
    @Parameters({
            @Parameter(name = "targetUserId", description = "추가할 친구의 사용자 ID", required = true, example = "123")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "ADD_FRIEND_SUCCESS - 친구 추가 성공"),
            @ApiResponse(responseCode = "400", description = "ADD_FRIEND_FAIL - 친구 추가 실패")
    })
    @PostMapping("/add")
    public ResponseEntity<ResponseForm> addFriend(@RequestParam Long targetUserId) {

        boolean isAdded = friendService.addFriend(targetUserId);
        return isAdded ?
                ResponseEntity.ok(ResponseForm.of(ADD_FRIEND_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ADD_FRIEND_FAIL));

    }
    @Operation(summary = "친구 요청 확인", description = "친구 요청을 확인합니다.")
    @Parameters({
            @Parameter(name = "type", description = "친구 요청 타입", required = true, example = "send")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "CONFIRM_REQUEST_SUCCESS - 친구 요청 확인 성공")
    })
    @GetMapping("/confirmRequest/{type}")
    public ResponseEntity<ResponseForm> confirmRequest(@PathVariable String type) {

        List<ConfirmFriendResponse> confirmFriendResponses = friendService.confirmRequest(type);
        return !confirmFriendResponses.isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(CONFIRM_REQUEST_SUCCESS, confirmFriendResponses)) :
                ResponseEntity.ok(ResponseForm.of(CONFIRM_REQUEST_SUCCESS));
    }

    @Operation(summary = "친구 요청 수락", description = "친구 요청을 수락합니다.")
    @Parameters({
            @Parameter(name = "sendUserId", description = "요청을 보낸 사용자의 ID", required = true, example = "456")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "ACCEPT_FRIEND_SUCCESS - 친구 요청 수락 성공"),
            @ApiResponse(responseCode = "400", description = "ACCEPT_FRIEND_FAIL - 친구 요청 수락 실패")
    })
    @PutMapping("/accept")
    public ResponseEntity<ResponseForm> acceptRequest(@RequestParam Long sendUserId) {

        boolean isAccepted = friendService.acceptRequest(sendUserId);

        return isAccepted ?
                ResponseEntity.ok(ResponseForm.of(ACCEPT_FRIEND_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ACCEPT_FRIEND_FAIL));

    }
    @Operation(summary = "친구 요청 거절", description = "친구 요청을 거절합니다.")
    @Parameters({
            @Parameter(name = "sendUserId", description = "요청을 보낸 사용자의 ID", required = true, example = "456")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "REJECT_FRIEND_SUCCESS - 친구 요청 거절 성공"),
            @ApiResponse(responseCode = "400", description = "REJECT_FRIEND_FAIL - 친구 요청 거절 실패")
    })
    @DeleteMapping("/reject")
    public ResponseEntity<ResponseForm> rejectRequest(@RequestParam Long sendUserId) {

        boolean isAccepted = friendService.removeFriend(sendUserId);

        return isAccepted ?
                ResponseEntity.ok(ResponseForm.of(REJECT_FRIEND_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(REJECT_FRIEND_FAIL));

    }
    @Operation(summary = "친구 삭제", description = "친구를 삭제합니다.")
    @Parameters({
            @Parameter(name = "friendId", description = "삭제할 친구의 사용자 ID", required = true, example = "789")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "DELETE_FRIEND_SUCCESS - 친구 삭제 성공"),
            @ApiResponse(responseCode = "400", description = "DELETE_FRIEND_FAIL - 친구 삭제 실패")
    })
    @DeleteMapping("/delete")
    public ResponseEntity<ResponseForm> delete(@RequestParam Long friendId) {

        boolean isAccepted = friendService.removeFriend(friendId);

        return isAccepted ?
                ResponseEntity.ok(ResponseForm.of(DELETE_FRIEND_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(DELETE_FRIEND_FAIL));

    }
    @Operation(summary = "친구 목록 조회", description = "친구 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "READ_FRIENDLIST_SUCCESS - 친구 목록 조회 성공"),
            @ApiResponse(responseCode = "400", description = "READ_FRIENDLIST_FAIL - 친구 목록 조회 실패")
    })
    @GetMapping("/read")
    public ResponseEntity<ResponseForm> getFriendList() {

        List<FriendListResponse> friendListResponses = friendService.getFriendList();
        return !friendListResponses.isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(READ_FRIENDLIST_SUCCESS, friendListResponses)) :
                ResponseEntity.ok(ResponseForm.of(READ_FRIENDLIST_FAIL));
    }
    @Operation(summary = "친구 추천", description = "추천 친구 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "RECOMMEND_FRIEND_SUCCESS - 친구 추천 성공"),
            @ApiResponse(responseCode = "400", description = "RECOMMEND_FRIEND_FAIL - 친구 추천 실패")
    })
    @GetMapping("/recommend")
    public ResponseEntity<ResponseForm> recommendFriend() {

        List<FriendListResponse> recommendFriendLists = friendService.recommendFriends();
        return !recommendFriendLists.isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(RECOMMEND_FRIEND_SUCCESS, recommendFriendLists)) :
                ResponseEntity.ok(ResponseForm.of(RECOMMEND_FRIEND_FAIL));
    }
}


