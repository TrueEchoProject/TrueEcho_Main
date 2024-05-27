package te.trueEcho.domain.post.controller;

import com.azure.core.annotation.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.notification.controller.NotificationController;
import te.trueEcho.domain.notification.dto.NotiType;
import te.trueEcho.domain.notification.dto.NotificationDto;
import te.trueEcho.domain.post.dto.*;
import te.trueEcho.domain.post.service.PostService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

@RestController
@RequiredArgsConstructor
@RequestMapping("/post")
public class PostController {
    private final  PostService  postService;
    private final NotificationController notificationController;

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

    @GetMapping("/read")
    public ResponseEntity<ResponseForm> readSinglePost(@RequestParam Long postId){

        ReadPostResponse postGetDtoList =  postService.getSinglePost(postId);

        return  postGetDtoList != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_SUCCESS, postGetDtoList)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_FAIL));
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

        return !postGetDtoList.getReadPostResponse().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_SUCCESS, postGetDtoList)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_FAIL));
    }

    @DeleteMapping("/delete/{postId}")
    public ResponseEntity<ResponseForm> deletePost(
            @PathVariable Long postId){

        boolean isDeleted =  postService.deletePost(postId);

        return isDeleted ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.DELETE_POST_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.DELETE_POST_FAIL));
    }


    @GetMapping("/read/comment/{postId}")
    public ResponseEntity<ResponseForm> readComment(
            @PathVariable Long postId){

        CommentListResponse commentListResponse = postService.getComment(postId);

        return !commentListResponse.getComments().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMENT_SUCCESS, commentListResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMENT_FAIL));
    }

    @PostMapping("/write/comment")
    public ResponseEntity<ResponseForm> writeComment(
            @RequestBody WriteCommentRequest writeCommentRequest){

        boolean isWritten = postService.writeComment(writeCommentRequest);
//
//        if(isWritten){
//            notificationController.sendNotification(
//                    NotificationDto.builder().data(
//                            NotificationDto.Data.builder()
//                                                .postId(writeCommentRequest.getPostId()) // contentid임.
//                                                .userId(writeCommentRequest.getReceiverId())
//                                                .notiType(NotiType.COMMENT.ordinal())
//                                                .build())
//                            .build()
//            );
//        }

        return isWritten ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.POST_COMMENT_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.POST_COMMENT_FAIL));
    }

    @DeleteMapping("/delete/comment/{commentId}")
    public ResponseEntity<ResponseForm> deleteComment(
            @PathVariable Long commentId){

        boolean isDeleted = postService.deleteComment(commentId);

        return isDeleted ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.DELETE_COMMENT_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.DELETE_COMMENT_FAIL));
    }
}
