package te.trueEcho.domain.user.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.friend.dto.FriendListResponse;
import te.trueEcho.domain.user.dto.BlockListResponse;
import te.trueEcho.domain.user.dto.EditUserResponse;
import te.trueEcho.domain.user.service.BlockService;
import te.trueEcho.domain.user.service.UserService;
import te.trueEcho.global.response.ResponseForm;

import java.util.List;

import static te.trueEcho.global.response.ResponseCode.*;
import static te.trueEcho.global.response.ResponseCode.DELETE_FRIEND_FAIL;


@Slf4j
@RestController
@RequestMapping("/blocks")
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;

    @PostMapping("/add")
    public ResponseEntity<ResponseForm> block(@RequestParam Long blockUserId) {

        boolean isBlocked = blockService.addBlock(blockUserId);

        return isBlocked ?
                ResponseEntity.ok(ResponseForm.of(PUT_BLOCK_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(PUT_BLOCK_FAIL, ""));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ResponseForm> delete(@RequestParam(value = "blockUserIds") List<Long> blockUserIds){
        try {
            for (Long blockUserId : blockUserIds) {
                boolean isAccepted = blockService.removeBlock(blockUserId);
                if (!isAccepted) {
                    return ResponseEntity.ok(ResponseForm.of(DELETE_BLCOK_FAIL));
                }
            }
            return ResponseEntity.ok(ResponseForm.of(DELETE_BLCOK_SUCCESS));
        } catch (Exception e) {
            log.error("Error occurred while removing blocks", e);
            return ResponseEntity.ok(ResponseForm.of(DELETE_BLCOK_FAIL));
        }
    }

    @GetMapping("/read")
    public ResponseEntity<ResponseForm> getFriendList(){

        List<BlockListResponse> blockListResponses = blockService.getBlockList();
        return !blockListResponses.isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(READ_FRIENDLIST_SUCCESS, blockListResponses)) :
                ResponseEntity.ok(ResponseForm.of(READ_FRIENDLIST_FAIL));
    }
}