package te.trueEcho.domain.post.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.friend.repository.FriendRepositoryImpl;
import te.trueEcho.domain.post.converter.CommentToDtoConverter;
import te.trueEcho.domain.post.converter.PostToDtoConverter;
import te.trueEcho.domain.post.dto.CommentListResponse;
import te.trueEcho.domain.post.dto.FeedType;
import te.trueEcho.domain.post.dto.PostRequest;
import te.trueEcho.domain.post.dto.PostListResponse;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.repository.PostRepository;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserRepository;
import te.trueEcho.global.util.AuthUtil;

import java.util.List;




@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final FriendRepositoryImpl friendRepository;
    private final UserRepository userRepository;
    private final AuthUtil authUtil;


    /**
     *
     *
     *  우리는 피드페이지가 2개가 있어
     *  친구 / 모두(퍼블릭)
     *  스코프는  0[친구만] | 스코프 1[모두]

     1. 나랑 친구인데, 스코프 0[친구만] : 두페이지로 모두 가져오기
     2. 나랑 친구인데, 스코프 1[모두] : 두 페이지로 모두 가져오기

     3. 나랑 친구아닌데, 스코프 0[친구만] : 랜덤인 페이지로만 가져오기
     4. 나랑 친구아닌데, 스코프 1[[모두] : 랜덤인 페이지로만 가져오기
     */


    @Override
    public PostListResponse getPost(PostRequest postRequest) {
        // 요청자의 위치
        User foundUser = authUtil.getLoginUser();
        String yourLocation = foundUser.getLocation();

        // 필터링하는 위치 [ default -> all ]
        String filterLocation = getFilterLocation(postRequest);

        // 게시물 조회
        List<User> filteredUser =
                        postRequest.getType() == FeedType.FRIEND ?
                        friendRepository.findMyFriendsByUser(foundUser):
                        userRepository.findUsersByLocation(filterLocation, foundUser) ;

        List<Post> postList =  postRepository.readPost(postRequest.getPageCount(),postRequest.getIndex(), filteredUser);

        // post -> Dto 컨버터
        return PostToDtoConverter.converter(postList, yourLocation);
    }



    private static String getFilterLocation(PostRequest postRequest) {
        String filterLocation = "";
        if (postRequest.getLocation() != null) filterLocation = postRequest.getLocation();
        return filterLocation + "%";
    }

    @Override
    public CommentListResponse getComment(Long postId) {
        List<Comment> comments =  postRepository.readCommentWithUnderComments(postId);

      return CommentToDtoConverter.converter(comments,postId);
    }



}
