package te.trueEcho.domain.vote.controller;


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

@RestController
@RequiredArgsConstructor
@RequestMapping("/vote")
public class VoteController {

    private final VoteService voteService;

    @GetMapping("/read/content")
    public ResponseEntity<ResponseForm> readContent() {

        final VoteContentsResponse contentsResponse = voteService.getVoteContents();

        return contentsResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_VOTE_CONTENT_SUCCESS,contentsResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_VOTE_CONTENT_FAIL));
    }

    @GetMapping("/read/users")
    public ResponseEntity<ResponseForm> readUsers(@RequestParam int userCount) {

        final VoteUsersResponse voteUsersResponse = voteService.getRandomUsersWithPostForVote(userCount);

        return voteUsersResponse !=null?
             ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_VOTE_TARGET_SUCCESS, voteUsersResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_VOTE_TARGET_FAIL));
    }


    @PostMapping("/result")
    public ResponseEntity<ResponseForm> voteResult(@RequestBody VoteResultRequest voteResultRequest){

        final boolean isResultSaved = voteService.saveVoteResult(voteResultRequest);

        return isResultSaved ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.SAVE_VOTE_RESULT_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.SAVE_VOTE_RESULT_FAIL));
    }

    @GetMapping("/read/photo")
    public ResponseEntity<ResponseForm> readPhoto(@RequestParam Long userId){

        final PhotoResponse photoResponse = voteService.getVotePhoto(userId);

        return photoResponse !=null?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_SUCCESS,photoResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_FAIL));
    }
}
