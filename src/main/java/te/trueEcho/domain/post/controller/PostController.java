package te.trueEcho.domain.post.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.post.dto.CommentListResponse;
import te.trueEcho.domain.post.dto.FeedType;
import te.trueEcho.domain.post.dto.PostRequest;
import te.trueEcho.domain.post.dto.PostListResponse;
import te.trueEcho.domain.post.service.PostService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

@RestController
@RequiredArgsConstructor
@RequestMapping("/post")
public class PostController {
    private final   PostService  postService;

    @GetMapping("/read/{type}")
    public ResponseEntity<ResponseForm> readPost(
            @PathVariable int type,
            @RequestParam String location,
            @RequestParam int index,
            @RequestParam int pageCount){

        PostListResponse postGetDtoList =  postService.getPost(
                PostRequest.builder()
                        .index(index)
                        .pageCount(pageCount)
                        .type(FeedType.values()[type])
                        .location(location)
                        .build()
        );

        return !postGetDtoList.getPostResponses().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_SUCCESS, postGetDtoList)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_FAIL));
    }


    @GetMapping("/read/comment/{postId}")
    public ResponseEntity<ResponseForm> readComment(
            @PathVariable Long postId){

        CommentListResponse commentListResponse = postService.getComment(postId);

        return !commentListResponse.getComments().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMENT_SUCCESS, commentListResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMENT_FAIL));
    }



}
