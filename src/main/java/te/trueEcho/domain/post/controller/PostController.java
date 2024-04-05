package te.trueEcho.domain.post.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.post.dto.PostGetDto;
import te.trueEcho.domain.post.dto.PostListDto;
import te.trueEcho.domain.post.service.PostService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

@RestController
@RequiredArgsConstructor
@RequestMapping("/post")
public class PostController {
//    private final   PostService  postService;

    @GetMapping("/read")
    public ResponseEntity<ResponseForm> readPost( @RequestBody PostGetDto postsGetDto){



        return ResponseEntity.ok(ResponseForm.of(ResponseCode.SEND_EMAIL_SUCCESS, ""));

    }

}
