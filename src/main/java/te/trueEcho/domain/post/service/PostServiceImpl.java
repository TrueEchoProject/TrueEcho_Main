package te.trueEcho.domain.post.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.friend.repository.FriendRepositoryImpl;
import te.trueEcho.domain.post.converter.CommentToDto;
import te.trueEcho.domain.post.converter.DtoToComment;
import te.trueEcho.domain.post.converter.PostToDto;
import te.trueEcho.domain.post.dto.*;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Like;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.entity.PostStatus;
import te.trueEcho.domain.post.repository.PostRepository;
import te.trueEcho.domain.user.entity.SuspendedUser;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.BlockRepository;
import te.trueEcho.domain.user.repository.SuspendedUserRepository;
import te.trueEcho.domain.user.repository.UserRepository;
import te.trueEcho.global.response.ExceptionResponse;
import te.trueEcho.global.response.ResponseInterface;
import te.trueEcho.global.util.AuthUtil;
import te.trueEcho.infra.azure.AzureUploader;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.time.format.DateTimeFormatter;

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
    private final CommentToDto commentToDto;
    private final DtoToComment dtoToComment;
    private final BlockRepository blockRepository;
    private final SuspendedUserRepository suspendedUserRepository;

    private static String getFilterLocation(ReadPostRequest readPostRequest) {
        String filterLocation = "";
        if (readPostRequest.getLocation() != null) filterLocation = readPostRequest.getLocation();
        return filterLocation + "%";
    }

    @Override
    public ResponseInterface getSinglePost(SinglePostRequest singlePostRequest) {
        User requestUser = authUtil.getLoginUser();
        Post targetPost = postRepository.getPostById(singlePostRequest.getPostId());


        if (targetPost == null) {
            log.error("Post not found - postId: {}", singlePostRequest.getPostId());
            return null;
        }

        // 정지된 사용자이면 예외처리
        if(suspendedUserRepository.findSuspendedUserByEmail(targetPost.getUser().getEmail()) != null){
            return ExceptionResponse.builder()
                    .exceptionMessage("정지된 사용자입니다.")
                    .exceptionCode("403")
                    .build();
        }

        // 차단된 게시물이면 예외처리
        if(blockRepository.getBlockList(requestUser).contains(targetPost.getUser())){
            return ExceptionResponse.builder()
                    .exceptionMessage("차단된 사용자입니다.")
                    .exceptionCode("403")
                    .build();
        }

        PostedIn24H postedIn24H = null;
        if(singlePostRequest.isRequireRefresh()){
            postedIn24H = checkIfPostedIn24H(requestUser);
        }

        return singlePostToDtoConverter(postedIn24H, targetPost, requestUser);
    }


    private ReadPostResponse singlePostToDtoConverter(PostedIn24H postedIn24H, Post targetPost, User requestUser) {
        return ReadPostResponse.builder()
                .postedIn24H(postedIn24H)
                .isMine(targetPost.getUser().equals(requestUser))
                .isMyLike(
                        targetPost.getLikes().stream().anyMatch(
                                like -> like.getUser().getId().equals(requestUser.getId())
                        )
                )
                .isFriend(friendRepository.findMyFriendsByUser(requestUser).contains(targetPost.getUser()))
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
                .build();
    }

    private PostedIn24H checkIfPostedIn24H(User requestUser) {
        PostedIn24H postedIn24H;
        Post latestPost = postRepository.getLatestPostByUser(requestUser);
        if (latestPost==null){
            postedIn24H = PostedIn24H.builder()
                    .postedFront(false)
                    .postedBack(false)
                    .postedAt(null)
                    .build();
        }else{
            postedIn24H = PostedIn24H.builder()
                    .postedFront(latestPost.getUrlFront() != null)
                    .postedBack(latestPost.getUrlBack() != null)
                    .postedAt(latestPost.getCreatedAt())
                    .build();
        }
        return postedIn24H;
    }

    @Override
    public PostListResponse getAllPostByType(ReadPostRequest readPostRequest) {
        // 요청자의 위치
        User foundUser = authUtil.getLoginUser();
        log.warn("foundUser: {}", foundUser.getId());
        String yourLocation = foundUser.getLocation();


        // 필터링하는 위치 [ default -> all ]
        String filterLocation = getFilterLocation(readPostRequest);

        PostedIn24H postedIn24H = null;
        // 내 게시물은 오차피 볼 수 있기 때문에 상태 갱신이 불필요.
        if(readPostRequest.isRequireRefresh() && readPostRequest.getType() != FeedType.MINE){
            postedIn24H = checkIfPostedIn24H(foundUser);
        }

        // 게시물 조회
        List<User> filteredUser = new ArrayList<>();
        List<User> friendGroup = new ArrayList<>();
        switch (readPostRequest.getType()) {
            case FRIEND:
                filteredUser = friendRepository.findMyFriendsByUser(foundUser);
                break;
            case PUBLIC:
                friendGroup = friendRepository.findMyFriendsByUser(foundUser); // 친구인지 확인
                filteredUser = userRepository.findUsersByLocation(filterLocation, foundUser);
                break;
            case MINE:
                filteredUser.add(foundUser);
                break;
            default:
                log.error("Invalid feed type: {}", readPostRequest.getType());
        }

        filteredUser = filterUserWithBlockAndSuspended(filteredUser, foundUser);

        List<Post> postList = postRepository.getAllPost(readPostRequest.getPageCount(),
                                                        readPostRequest.getIndex(),
                                                        filteredUser );

        return postToDto.converter(
                                postList, yourLocation,
                                foundUser.getId(),readPostRequest.getType(),
                                friendGroup, postedIn24H);
    }

    List<User> filterUserWithBlockAndSuspended(List<User> users, User user){
        List<User> filteredUsers = new ArrayList<>();

        List<SuspendedUser> allSuspendedUser = suspendedUserRepository.findAll();
        List<User> allBlockedUser =  blockRepository.getBlockList(user);

        users.forEach(u -> {
                    boolean notB = !allBlockedUser.contains(u);
                    boolean notS = !allSuspendedUser.contains(u);
                    if (notB && notS) {
                        filteredUsers.add(u);
                    }
                }
        );

        return filteredUsers;
    }

    @Override
    public CommentListResponse getComment(ReadCommentRequest readCommentRequest) {
        List<Comment> comments = postRepository.readCommentWithUnderComments(
                readCommentRequest.getPostId());

        User user = authUtil.getLoginUser();
        return commentToDto.converter(comments,
                readCommentRequest,
                user.getId());
    }

    @Transactional
    @Override
    public LikeUpdateResponse updateLikes(UpdateLikesRequest updateLikesRequest) {
        log.info("Transaction start: updateLikes");
        final User loginUser = authUtil.getLoginUser();
        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            log.info("Transaction rollback: updateLikes");
            return null;
        }

        final Post targetPost = postRepository.getPostById(updateLikesRequest.getPostId());

        boolean isLiked = updateLikesRequest.isLike();

        if (isLiked) {
            Like newLike = Like.builder()
                    .post(targetPost)
                    .user(loginUser)
                    .build();

            try {
                postRepository.saveLike(newLike);
                log.info("Transaction commit: updateLikes");
                return LikeUpdateResponse.builder().msg("좋아요 추가에 성공했습니다.").build();
            } catch (Exception e) {
                log.error("saveLike error : {}", e.getMessage());
                log.info("Transaction rollback: updateLikes");
                return LikeUpdateResponse.builder().msg("좋아요 추가에 실패했습니다.").build();
            }
        } else {
            Like targetLike = targetPost.getLikes().stream()
                    .filter(like -> like.getUser().getId().equals(loginUser.getId()))
                    .findFirst()
                    .orElse(null);

            if (targetLike == null) {
                log.info("Transaction commit: updateLikes");
                return LikeUpdateResponse.builder().msg("좋아요를 찾을 수 없습니다.").build();
            }

            boolean deleted = false;
            try {
                deleted = postRepository.deleteLike(targetLike, targetPost);
                if (deleted) {
                    log.info("Transaction commit: updateLikes");
                    return LikeUpdateResponse.builder().msg("좋아요 삭제에 성공했습니다.").build();
                }
            } catch (Exception e) {
                log.error("deleteLike failed: {}", e.getMessage());
                log.info("Transaction rollback: updateLikes");
                return LikeUpdateResponse.builder().msg("좋아요 삭제에 실패했습니다.").build();
            }
            return LikeUpdateResponse.builder().msg("좋아요 삭제에 실패했습니다.").build();
        }
    }

    @Override
    public PostStatus getPostStatus(String todayShot) {
        User loginUser = authUtil.getLoginUser();
        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            return null;
        }
        LocalDateTime notiTime = loginUser.getNotiTime();
        if (notiTime == null) {
            return PostStatus.FREETIME;
        }
        LocalDateTime todayShotTime = LocalDateTime.parse(todayShot, DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm"));
        long minutesBetween = ChronoUnit.MINUTES.between(notiTime, todayShotTime);

        if (minutesBetween <= 3) {
            return PostStatus.ONTIME;
        } else if (minutesBetween <= 30) {
            // Check if the user has already posted with ONTIME status today
            LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
            boolean hasPostedOnTimeToday = postRepository.existsByUserAndCreatedAtIsAfterAndStatus(loginUser, startOfDay, PostStatus.ONTIME);
            if (hasPostedOnTimeToday) {
                return PostStatus.FREETIME;
            } else {
                return PostStatus.LATE;
            }
        } else {
            return PostStatus.FREETIME;
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
        } else {
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

        String postFrontUrl = null;
        String postBackUrl = null;

        try {
            if (postFrontFile != null) {
                postFrontUrl = azureUploader.uploadImage(postFrontFile);
            }
            if (postBackFile != null) {
                postBackUrl = azureUploader.uploadImage(postBackFile);
            }
        } catch (Exception e) {
            log.error("File upload failed", e);
            return false;
        }

        Post post = Post.builder()
                .user(loginUser)
                .title(addPostRequest.getTitle())
                .urlFront(postFrontUrl)
                .urlBack(postBackUrl)
                .status(PostStatus.fromValue(addPostRequest.getPostStatus()))
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
