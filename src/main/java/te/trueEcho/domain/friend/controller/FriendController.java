package te.trueEcho.domain.friend.controller;

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

@Slf4j
@Validated
@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/add")
    public ResponseEntity<ResponseForm> addFriend(@RequestParam Long targetUserId) {

        boolean isAdded = friendService.addFriend(targetUserId);
        return isAdded ?
                ResponseEntity.ok(ResponseForm.of(ADD_FRIEND_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ADD_FRIEND_FAIL));

    }

    @GetMapping("/confirmRequest/{type}")
    public ResponseEntity<ResponseForm> confirmRequest(@PathVariable String type) {

        List<ConfirmFriendResponse> confirmFriendResponses = friendService.confirmRequest(type);
        return !confirmFriendResponses.isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(CONFIRM_REQUEST_SUCCESS, confirmFriendResponses)) :
                ResponseEntity.ok(ResponseForm.of(CONFIRM_REQUEST_SUCCESS));

    }


    @PutMapping("/accept")
    public ResponseEntity<ResponseForm> acceptRequest(@RequestParam Long sendUserId) {

        boolean isAccepted = friendService.acceptRequest(sendUserId);

        return isAccepted ?
                ResponseEntity.ok(ResponseForm.of(ACCEPT_FRIEND_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ACCEPT_FRIEND_FAIL));

    }

    @DeleteMapping("/reject")
    public ResponseEntity<ResponseForm> rejectRequest(@RequestParam Long sendUserId) {

        boolean isAccepted = friendService.removeFriend(sendUserId);

        return isAccepted ?
                ResponseEntity.ok(ResponseForm.of(REJECT_FRIEND_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(REJECT_FRIEND_FAIL));

    }

    @DeleteMapping("/delete")
    public ResponseEntity<ResponseForm> delete(@RequestParam Long friendId) {

        boolean isAccepted = friendService.removeFriend(friendId);

        return isAccepted ?
                ResponseEntity.ok(ResponseForm.of(DELETE_FRIEND_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(DELETE_FRIEND_FAIL));

    }

    @GetMapping("/read")
    public ResponseEntity<ResponseForm> getFriendList() {

        List<FriendListResponse> friendListResponses = friendService.getFriendList();
        return !friendListResponses.isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(READ_FRIENDLIST_SUCCESS, friendListResponses)) :
                ResponseEntity.ok(ResponseForm.of(READ_FRIENDLIST_FAIL));
    }

    @GetMapping("/recommend")
    public ResponseEntity<ResponseForm> recommendFriend() {

        List<FriendListResponse> recommendFriendLists = friendService.recommendFriends();
        return !recommendFriendLists.isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(RECOMMEND_FRIEND_SUCCESS, recommendFriendLists)) :
                ResponseEntity.ok(ResponseForm.of(RECOMMEND_FRIEND_FAIL));
    }
}


