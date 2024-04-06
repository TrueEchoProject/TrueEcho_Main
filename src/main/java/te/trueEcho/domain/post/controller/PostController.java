package te.trueEcho.domain.post.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.post.dto.PostGetDto;
import te.trueEcho.domain.post.dto.PostListDto;
import te.trueEcho.domain.post.service.PostService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/post")
public class PostController {
    private final   PostService  postService;

    @GetMapping("/read")
    public ResponseEntity<ResponseForm> readPost( @RequestBody PostGetDto postsGetDto){

        PostListDto  postGetDtoList =  postService.getPost(postsGetDto);

        return !postGetDtoList.getPostDtos().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_SUCCESS, postGetDtoList)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_FAIL));
    }

}
