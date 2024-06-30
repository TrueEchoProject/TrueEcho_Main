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
import te.trueEcho.domain.friend.dto.FriendListResponse;
import te.trueEcho.domain.user.dto.BlockListResponse;
import te.trueEcho.domain.user.dto.EditUserResponse;
import te.trueEcho.domain.user.service.BlockService;
import te.trueEcho.domain.user.service.UserService;
import te.trueEcho.global.response.ResponseForm;

import java.util.List;

import static te.trueEcho.global.response.ResponseCode.*;
import static te.trueEcho.global.response.ResponseCode.DELETE_FRIEND_FAIL;

@Tag(name = "Block", description = "사용자 차단 관리 API")
@Slf4j
@RestController
@RequestMapping("/blocks")
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;

    @Operation(summary = "사용자 차단", description = "사용자를 차단합니다.")
    @Parameters({
            @Parameter(name = "blockUserId", required = true, description = "차단할 사용자의 ID", example = "123")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PUT_BLOCK_SUCCESS - 사용자 차단 성공"),
            @ApiResponse(responseCode = "400", description = "PUT_BLOCK_FAIL - 사용자 차단 실패")
    })
    @PostMapping("/add")
    public ResponseEntity<ResponseForm> block(@RequestParam Long blockUserId) {

        boolean isBlocked = blockService.addBlock(blockUserId);

        return isBlocked ?
                ResponseEntity.ok(ResponseForm.of(PUT_BLOCK_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(PUT_BLOCK_FAIL, ""));
    }

    @Operation(summary = "차단 해제", description = "차단된 사용자를 해제합니다.")
    @Parameters({
            @Parameter(name = "blockUserIds", required = true, description = "차단 해제할 사용자들의 ID 리스트", example = "[123, 456]")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "DELETE_BLOCK_SUCCESS - 차단 해제 성공"),
            @ApiResponse(responseCode = "400", description = "DELETE_BLOCK_FAIL - 차단 해제 실패")
    })
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
    @Operation(summary = "차단 목록 조회", description = "차단된 사용자 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "READ_BLOCKLIST_SUCCESS - 차단 목록 조회 성공"),
            @ApiResponse(responseCode = "400", description = "READ_BLOCKLIST_FAIL - 차단 목록 조회 실패")
    })
    @GetMapping("/read")
    public ResponseEntity<ResponseForm> getFriendList(){

        List<BlockListResponse> blockListResponses = blockService.getBlockList();
        return !blockListResponses.isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(READ_FRIENDLIST_SUCCESS, blockListResponses)) :
                ResponseEntity.ok(ResponseForm.of(READ_FRIENDLIST_FAIL));
    }
}