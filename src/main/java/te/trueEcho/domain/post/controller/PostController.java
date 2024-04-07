package te.trueEcho.domain.post.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.post.dto.FeedType;
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

    @GetMapping("/read/{type}")
    public ResponseEntity<ResponseForm> readPost(
            @PathVariable FeedType type,
            @RequestParam String location,
            @RequestParam int index,
            @RequestParam int pageCount){

        PostListDto  postGetDtoList =  postService.getPost(
                PostGetDto.builder()
                        .index(index)
                        .pageCount(pageCount)
                        .type(type)
                        .location(location)
                        .build()
        );

        return !postGetDtoList.getPostDtos().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_SUCCESS, postGetDtoList)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_FAIL));
    }

}
