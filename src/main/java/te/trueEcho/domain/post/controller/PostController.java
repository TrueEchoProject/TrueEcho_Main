package te.trueEcho.domain.post.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.notification.controller.NotificationController;
import te.trueEcho.domain.post.dto.*;
import te.trueEcho.domain.post.service.PostService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;



@Tag(name = "Post API", description = "게시물 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/post")
public class PostController {
    private final  PostService  postService;
    private final NotificationController notificationController;

    @Operation(summary = "게시물 작성", description = "새로운 게시물을 작성합니다.")
    @Parameters({
            @Parameter(name = "type", description = "피드 타입", required = true, example = "PUBLIC"),
            @Parameter(name = "postFront", description = "게시물 앞면 이미지 파일", required = true, example = "front.jpg"),
            @Parameter(name = "postBack", description = "게시물 뒷면 이미지 파일", required = true, example = "back.jpg"),
            @Parameter(name = "title", description = "게시물 제목", required = true, example = "My New Post"),
            @Parameter(name = "postStatus", description = "게시물 상태", required = true, example = "1")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "WRITE_POST_SUCCESS - 게시물 작성 성공"),
            @ApiResponse(responseCode = "400", description = "WRITE_POST_FAIL - 게시물 작성 실패")
    })
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

    @Operation(summary = "단일 게시물 조회", description = "단일 게시물을 조회합니다.")
    @Parameter(name = "postId", description = "게시물 ID", required = true, example = "1")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GET_POST_SUCCESS - 게시물 조회 성공"),
            @ApiResponse(responseCode = "400", description = "GET_POST_FAIL - 게시물 조회 실패")
    })
    @GetMapping("/read")
    public ResponseEntity<ResponseForm> readSinglePost(@RequestParam Long postId){

        ReadPostResponse postGetDtoList =  postService.getSinglePost(postId);

        return  postGetDtoList != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_SUCCESS, postGetDtoList)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_POST_FAIL));
    }


    @Operation(summary = "게시물 목록 조회", description = "타입별로 게시물 목록을 조회합니다.")
    @Parameters({
            @Parameter(name = "type", description = "피드 타입", required = true, example = "0"),
            @Parameter(name = "location", description = "위치", required = false, example = "인천광역시 부평구 부평동"),
            @Parameter(name = "index", description = "페이지 인덱스", required = true, example = "1"),
            @Parameter(name = "pageCount", description = "페이지당 게시물 수", required = true, example = "10")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GET_POST_SUCCESS - 게시물 목록 조회 성공"),
            @ApiResponse(responseCode = "400", description = "GET_POST_FAIL - 게시물 목록 조회 실패")
    })
    @GetMapping("/read/{type}")
    public ResponseEntity<ResponseForm> readPost(
            @PathVariable int type,
            @RequestParam(required = false) String location,
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

    @Operation(summary = "게시물 삭제", description = "게시물을 삭제합니다.")
    @Parameter(name = "postId", description = "게시물 ID", required = true, example = "1")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "DELETE_POST_SUCCESS - 게시물 삭제 성공"),
            @ApiResponse(responseCode = "400", description = "DELETE_POST_FAIL - 게시물 삭제 실패")
    })
    @DeleteMapping("/delete/{postId}")
    public ResponseEntity<ResponseForm> deletePost(
            @PathVariable Long postId){

        boolean isDeleted =  postService.deletePost(postId);

        return isDeleted ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.DELETE_POST_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.DELETE_POST_FAIL));
    }

    @Operation(summary = "게시물 좋아요 업데이트", description = "게시물 좋아요 수를 업데이트합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "UPDATE_LIKES_SUCCESS - 좋아요 업데이트 성공"),
            @ApiResponse(responseCode = "400", description = "UPDATE_LIKES_FAIL - 좋아요 업데이트 실패")
    })
    @PatchMapping("/update/likes")
    public ResponseEntity<ResponseForm> updateLikes(
            @RequestBody UpdateLikesRequest updateLikesRequest){

        LikeUpdateResponse likeUpdateResponse = postService.updateLikes(updateLikesRequest);

        return likeUpdateResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.UPDATE_LIKES_SUCCESS, likeUpdateResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.UPDATE_LIKES_FAIL));
    }

    @Operation(summary = "댓글 목록 조회", description = "특정 게시물의 댓글 목록을 조회합니다.")
    @Parameters({
            @Parameter(name = "postId", description = "게시물 ID", required = true, example = "1"),
            @Parameter(name = "index", description = "페이지 인덱스", required = true, example = "1"),
            @Parameter(name = "pageCount", description = "페이지당 댓글 수", required = true, example = "10")
    })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GET_COMMENT_SUCCESS - 댓글 조회 성공"),
            @ApiResponse(responseCode = "400", description = "GET_COMMENT_FAIL - 댓글 조회 실패")
    })
    @GetMapping("/read/comment/{postId}")
    public ResponseEntity<ResponseForm> readComment(
            @PathVariable Long postId,
            @RequestParam int index,
            @RequestParam int pageCount
            ){



        CommentListResponse commentListResponse = postService.getComment(
                ReadCommentRequest.builder()
                        .postId(postId)
                        .index(index)
                        .pageCount(pageCount)
                        .build()
        );

        return !commentListResponse.getComments().isEmpty() ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMENT_SUCCESS, commentListResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_COMMENT_FAIL));
    }
    @Operation(summary = "댓글 작성", description = "댓글을 작성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "POST_COMMENT_SUCCESS - 댓글 작성 성공"),
            @ApiResponse(responseCode = "400", description = "POST_COMMENT_FAIL - 댓글 작성 실패")
    })
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
    @Operation(summary = "댓글 삭제", description = "댓글을 삭제합니다.")
    @Parameter(name = "commentId", description = "댓글 ID", required = true, example = "1")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "DELETE_COMMENT_SUCCESS - 댓글 삭제 성공"),
            @ApiResponse(responseCode = "400", description = "DELETE_COMMENT_FAIL - 댓글 삭제 실패")
    })
    @DeleteMapping("/delete/comment/{commentId}")
    public ResponseEntity<ResponseForm> deleteComment(
            @PathVariable Long commentId){

        boolean isDeleted = postService.deleteComment(commentId);

        return isDeleted ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.DELETE_COMMENT_SUCCESS)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.DELETE_COMMENT_FAIL));
    }
}
