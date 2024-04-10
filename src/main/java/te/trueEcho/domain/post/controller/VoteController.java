package te.trueEcho.domain.post.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.post.dto.CommentListResponse;
import te.trueEcho.domain.post.service.VoteService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

@RestController
@RequiredArgsConstructor
@RequestMapping("/vote")
public class VoteController {

    private final VoteService voteService;

    @GetMapping("/read/content")
    public ResponseEntity<ResponseForm> readContent(@RequestParam Long postId) {


        return ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMENT_SUCCESS));
    }

    @GetMapping("/read/users")
    public ResponseEntity<ResponseForm> readUsers(@RequestParam Long postId) {

        return ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMENT_SUCCESS));
    }
}
