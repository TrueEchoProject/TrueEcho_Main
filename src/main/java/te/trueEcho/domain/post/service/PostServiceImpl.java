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
    public PostListResponse getAllPostByType(ReadPostRequest readPostRequest) {
        // 요청자의 위치
        User foundUser = authUtil.getLoginUser();
        log.warn("foundUser: {}", foundUser.getId());
        String yourLocation = foundUser.getLocation();

        // 필터링하는 위치 [ default -> all ]
        String filterLocation = getFilterLocation(readPostRequest);

        // 게시물 조회
        List<User> filteredUser = new ArrayList<>();

        switch (readPostRequest.getType()){
            case FRIEND:
                filteredUser =  friendRepository.findMyFriendsByUser(foundUser);
                break;
            case PUBLIC:
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
        return postToDto.converter(postList, yourLocation,foundUser.getId());
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

    @Override
    public boolean deleteComment(Long commentId) {
        return postRepository.deleteComment(commentId);
    }

    @Override
    public boolean deletePost(Long postId) {
        return postRepository.deletePost(postId);

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
