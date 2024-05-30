package te.trueEcho.domain.post.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.friend.repository.FriendRepositoryImpl;
import te.trueEcho.domain.post.converter.CommentToDto;
import te.trueEcho.domain.post.converter.DtoToComment;
import te.trueEcho.domain.post.converter.PostToDto;
import te.trueEcho.domain.post.dto.*;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Like;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.repository.PostRepository;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserRepository;
import te.trueEcho.global.util.AuthUtil;
import te.trueEcho.infra.azure.AzureUploader;

import java.util.ArrayList;
import java.util.List;

import static te.trueEcho.domain.post.entity.PostStatus.fromValue;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final FriendRepositoryImpl friendRepository;
    private final UserRepository userRepository;
    private final AuthUtil authUtil;
    private final AzureUploader azureUploader;
    private final PostToDto postToDto;
    private  final CommentToDto commentToDto;
    private final DtoToComment dtoToComment;

    @Override
    public ReadPostResponse getSinglePost(Long postId) {
        User requestUser = authUtil.getLoginUser();
        Post targetPost = postRepository.getPostById(postId);

        if (targetPost== null) {
            log.error("Post not found - postId: {}", postId);
            return null;
        }

        return ReadPostResponse.builder()
                   .isMine(targetPost.getUser()!=requestUser)
                   .postFrontUrl(targetPost.getUrlFront())
                   .postBackUrl(targetPost.getUrlBack())
                   .createdAt(targetPost.getCreatedAt())
                   .commentCount(targetPost.getComments().size())
                   .likesCount(targetPost.getLikes().size())
                   .title(targetPost.getTitle())
                   .postId(targetPost.getId())
                   .status(targetPost.getStatus())
                   .userId(targetPost.getUser().getId())
                   .username(targetPost.getUser().getName())
                   .profileUrl(targetPost.getUser().getProfileURL())
                   .isMyLike(
                           targetPost.getLikes().stream().anyMatch(
                                   like -> like.getUser().getId().equals(requestUser.getId())
                           )
                   )
                   .build();
    }

    @Override
    public PostListResponse getAllPostByType(ReadPostRequest readPostRequest) {
        // 요청자의 위치
        User foundUser = authUtil.getLoginUser();
        log.warn("foundUser: {}", foundUser.getId());
        String yourLocation = foundUser.getLocation();

        // 필터링하는 위치 [ default -> all ]
        String filterLocation = getFilterLocation(readPostRequest);

        // 게시물 조회
        List<User> filteredUser = new ArrayList<>();
        boolean isFriend = true;
        switch (readPostRequest.getType()){
            case FRIEND:
                filteredUser =  friendRepository.findMyFriendsByUser(foundUser);
                break;
            case PUBLIC:
                isFriend = friendRepository.findMyFriendsByUser(foundUser).contains(foundUser); // 친구인지 확인
                filteredUser =  userRepository.findUsersByLocation(filterLocation, foundUser);
                break;
            case MINE:
                filteredUser.add(foundUser);
                break;
            default:
                log.error("Invalid feed type: {}", readPostRequest.getType());
        }

        List<Post> postList = postRepository.getAllPost(readPostRequest.getPageCount(), readPostRequest.getIndex(), filteredUser);
        // post -> Dto 컨버터

        return postToDto.converter(postList, yourLocation,foundUser.getId(), isFriend);
    }


    private static String getFilterLocation(ReadPostRequest readPostRequest) {
        String filterLocation = "";
        if (readPostRequest.getLocation() != null) filterLocation = readPostRequest.getLocation();
        return filterLocation + "%";
    }

    @Override
    public CommentListResponse getComment(Long postId) {
        List<Comment> comments = postRepository.readCommentWithUnderComments(postId);
        User user = authUtil.getLoginUser();
        return commentToDto.converter(comments, postId, user.getId());
    }
    @Transactional
    @Override
    public LikeUpdateResponse updateLikes(UpdateLikesRequest updateLikesRequest) {
        final User loginUser = authUtil.getLoginUser();
        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            return null;
        }

        final Post targetPost = postRepository.getPostById(updateLikesRequest.getPostId());

        boolean isLiked = updateLikesRequest.isLike();

        if (isLiked) {
            Like newLike = Like.builder()
                    .post(targetPost)
                    .user(loginUser)
                    .build();
            postRepository.saveLike(newLike);
            return LikeUpdateResponse.builder().msg("좋아요 추가에 성공했습니다.").build();
        } else {
            Like targetLike = postRepository.findLikeByUserAndPost(loginUser, targetPost);
            boolean deleted = postRepository.deleteLike(targetLike);
            if (deleted) {
                return LikeUpdateResponse.builder().msg("좋아요 삭제에 성공했습니다.").build();
            }
            return null;
        }
    }

    @Override
    @Transactional
    public boolean writeComment(WriteCommentRequest writeCommentRequest) {
        User loginUser = authUtil.getLoginUser();
        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            return false;
        }

        Comment mainComment = null;
        Post commentedPost = null;

        if (writeCommentRequest.getParentCommentId() != null) {
            mainComment = postRepository.getParentComment(writeCommentRequest.getParentCommentId());
            commentedPost = mainComment.getPost();
        }else{
            commentedPost = postRepository.getPostById(writeCommentRequest.getPostId());
        }

        Comment newComment = dtoToComment.converter(writeCommentRequest, loginUser, commentedPost, mainComment);
        return postRepository.writeComment(newComment);
    }

    @Transactional
    @Override
    public boolean deleteComment(Long commentId) {
        return postRepository.deleteComment(commentId);
    }

    @Transactional
    @Override
    public boolean deletePost(Long postId) {
        return postRepository.deletePost(postId);

    }

    public Comment comment;

    public Comment getCommentById(Long commentId) {
        return postRepository.findCommentById(commentId);
    }

    @Override
    @Transactional
    public boolean writePost(AddPostRequest addPostRequest) {
        User loginUser = authUtil.getLoginUser();

        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            return false;
        }

        MultipartFile postFrontFile = addPostRequest.getPostFront();
        MultipartFile postBackFile = addPostRequest.getPostBack();

        if (postFrontFile == null || postBackFile == null) {
            log.error("Invalid file upload attempt - One or both files are null");
            return false;
        }

        String postFrontUrl = null;
        String postBackUrl = null;

        try {
            postFrontUrl = azureUploader.uploadImage(postFrontFile);
            postBackUrl = azureUploader.uploadImage(postBackFile);
        } catch (Exception e) {
            log.error("File upload failed", e);
            return false;
        }

        if (postFrontUrl == null || postBackUrl == null) {
            log.error("Failed to upload one or both images to Azure Storage");
            return false;
        }

        Post post = Post.builder()
                .user(loginUser)
                .title(addPostRequest.getTitle())
                .urlFront(postFrontUrl)
                .urlBack(postBackUrl)
                .status(fromValue(addPostRequest.getPostStatus()))
                .build();

        try {
            postRepository.save(post);
            return true;
        } catch (DataAccessException e) {
            log.error("Failed to save the post to the database", e);
            return false;
        }
    }


}
