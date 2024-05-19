package te.trueEcho.domain.post.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.friend.repository.FriendRepositoryImpl;
import te.trueEcho.domain.post.converter.CommentToDto;
import te.trueEcho.domain.post.converter.PostToDto;
import te.trueEcho.domain.post.dto.*;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.repository.PostRepository;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserRepository;
import te.trueEcho.global.util.AuthUtil;
import te.trueEcho.infra.azure.AzureUploader;

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

    @Override
    public PostListResponse getAllPostByType(ReadPostRequest readPostRequest) {
        // 요청자의 위치
        User foundUser = authUtil.getLoginUser();
        String yourLocation = foundUser.getLocation();

        // 필터링하는 위치 [ default -> all ]
        String filterLocation = getFilterLocation(readPostRequest);

        // 게시물 조회
        List<User> filteredUser =
                readPostRequest.getType() == FeedType.FRIEND ?
                        friendRepository.findMyFriendsByUser(foundUser) :
                        userRepository.findUsersByLocation(filterLocation, foundUser);

        List<Post> postList = postRepository.getAllPost(readPostRequest.getPageCount(), readPostRequest.getIndex(), filteredUser);

        // post -> Dto 컨버터
        return postToDto.converter(postList, yourLocation);
    }


    private static String getFilterLocation(ReadPostRequest readPostRequest) {
        String filterLocation = "";
        if (readPostRequest.getLocation() != null) filterLocation = readPostRequest.getLocation();
        return filterLocation + "%";
    }

    @Override
    public CommentListResponse getComment(Long postId) {
        List<Comment> comments = postRepository.readCommentWithUnderComments(postId);

        return commentToDto.converter(comments, postId);
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
