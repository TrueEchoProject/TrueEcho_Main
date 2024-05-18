package te.trueEcho.domain.post.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.post.dto.*;
import te.trueEcho.domain.post.service.PostService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

@RestController
@RequiredArgsConstructor
@RequestMapping("/post")
public class PostController {
    private final  PostService  postService;

    @PostMapping("/write")
    public ResponseEntity<ResponseForm> writePost(
            @RequestParam FeedType type,
            @RequestParam MultipartFile postFront,
            @RequestParam MultipartFile postBack,
            @RequestParam String title,
            @RequestParam int postStatus
            ){
        boolean isWritten = postService.writePost(
                AddPostRequest.builder()
                .feedType(type)
                .postFront(postFront)
                .postBack(postBack)
                .title(title)
                .postStatus(postStatus)
                .build());

        return isWritten ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.WRITE_POST_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.WRITE_POST_FAIL));
    }

    @GetMapping("/read/{type}")
    public ResponseEntity<ResponseForm> readPost(
            @PathVariable int type,
            @RequestParam String location,
            @RequestParam int index,
            @RequestParam int pageCount){

        PostListResponse postGetDtoList =  postService.getAllPostByType(
                ReadPostRequest.builder()
                        .index(index)
                        .pageCount(pageCount)
                        .type(FeedType.values()[type])
                        .location(location)
                        .build()
        );

        return !postGetDtoList.getReadPostRespons().isEmpty() ?
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
