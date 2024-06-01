package te.trueEcho.domain.vote.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.vote.dto.PhotoResponse;
import te.trueEcho.domain.vote.dto.VoteContentsResponse;
import te.trueEcho.domain.vote.dto.VoteResultRequest;
import te.trueEcho.domain.vote.dto.VoteUsersResponse;
import te.trueEcho.domain.vote.service.VoteService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;


@Tag(name = "Vote", description = "투표 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/vote")
public class VoteController {

    private final VoteService voteService;
    @Operation(summary = "투표 콘텐츠 조회", description = "투표 콘텐츠를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GET_VOTE_CONTENT_SUCCESS - 투표 콘텐츠 조회 성공"),
            @ApiResponse(responseCode = "400", description = "GET_VOTE_CONTENT_FAIL - 투표 콘텐츠 조회 실패")
    })
    @GetMapping("/read/content")
    public ResponseEntity<ResponseForm> readContent() {

        final VoteContentsResponse contentsResponse = voteService.getVoteContents();

        return contentsResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_VOTE_CONTENT_SUCCESS,contentsResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_VOTE_CONTENT_FAIL));
    }
    @Operation(summary = "투표 대상 사용자 조회", description = "투표 대상 사용자를 조회합니다.")
    @Parameters({
            @Parameter(name = "userCount", description = "투표 대상 사용자 수", example = "10", required = true)
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GET_VOTE_TARGET_SUCCESS - 투표 대상 사용자 조회 성공"),
            @ApiResponse(responseCode = "400", description = "GET_VOTE_TARGET_FAIL - 투표 대상 사용자 조회 실패")
    })
    @GetMapping("/read/users")
    public ResponseEntity<ResponseForm> readUsers(@RequestParam int userCount) {

        final VoteUsersResponse voteUsersResponse = voteService.getRandomUsersWithPostForVote(userCount);

        return voteUsersResponse !=null?
             ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_VOTE_TARGET_SUCCESS, voteUsersResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_VOTE_TARGET_FAIL));
    }

    @Operation(summary = "투표 결과 저장", description = "투표 결과를 저장합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "SAVE_VOTE_RESULT_SUCCESS - 투표 결과 저장 성공"),
            @ApiResponse(responseCode = "400", description = "SAVE_VOTE_RESULT_FAIL - 투표 결과 저장 실패")
    })
    @PostMapping("/result")
    public ResponseEntity<ResponseForm> voteResult(@RequestBody VoteResultRequest voteResultRequest){

        final boolean isResultSaved = voteService.saveVoteResult(voteResultRequest);

        return isResultSaved ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.SAVE_VOTE_RESULT_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.SAVE_VOTE_RESULT_FAIL));
    }
    @Operation(summary = "투표 사진 조회", description = "사용자의 투표 사진을 조회합니다.")
    @Parameters({
            @Parameter(name = "userId", description = "사용자 ID", example = "1", required = true)
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GET_POST_SUCCESS - 투표 사진 조회 성공"),
            @ApiResponse(responseCode = "400", description = "GET_POST_FAIL - 투표 사진 조회 실패")
    })
    @GetMapping("/read/photo")
    public ResponseEntity<ResponseForm> readPhoto(@RequestParam Long userId){

        final PhotoResponse photoResponse = voteService.getVotePhoto(userId);

        return photoResponse !=null?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_SUCCESS,photoResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_FAIL));
    }
}
