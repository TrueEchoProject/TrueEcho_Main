package te.trueEcho.domain.post.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.friend.repository.FriendRepositoryImpl;
import te.trueEcho.domain.post.converter.PostToDtoConverter;
import te.trueEcho.domain.post.dto.FeedType;
import te.trueEcho.domain.post.dto.PostDto;
import te.trueEcho.domain.post.dto.PostGetDto;
import te.trueEcho.domain.post.dto.PostListDto;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.repository.PostRepository;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.domain.user.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
/**
 ---> type : 친구 | 익명
 0. 위치값에 대한 필터링.
 ---> 위치값에 따른 필터링, NULL일때는 DEFAULT 글로벌 -> 모든 위치의 피드

 1. [1 : 친구만] | [3: 랜덤만] | [2: 친구+랜덤]

 2. 친구 피드페이지 ->
 -> 1, 3 : scope를 가진 record들 중 작성자가 내 친구인 게시물만.

 3. 랜덤 페이지
 -> 2, 3 : scope를 가진 record 중 작성자 내 친구가 아닌 사람들만.

 ====> 결론적으로 도출해야 되는 것은 작성자.

 4. 페이징은 제일 마지막 결과물을 가지고 해야됨.

 5. 모든 필터링을 마지고 나온 작성자를 기준으로 페이징을 해야 됨.

 6. 현재의 요청자의 위치값은 항상 보내줘야 됨.
 */


/** <로직의 흐름>
 1. 요청자 식별 (요청한 사람을 객체로 생성) -> 내 위치 파악도 가능.
 2. 요청자의 친구/랜덤 조회               -> List<User> myFriends
 3. 위치로 필터링된 사용자                -> filterUserByLocation -> List<User> userFilterByLoc
 4. 피드타입에 따른 쿼리 날리기            -> scope이고, 나와의 관계. -> 결과 값 페이징
 */
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserAuthRepository userAuthRepository;
    private final FriendRepositoryImpl friendRepository;
    private final UserRepository userRepository;


    @Override
    public PostListDto getPost(PostGetDto postGetDto) {
        // 요청자의 위치
        User foundUser =  findUser();
        String yourLocation = foundUser.getLocation();
        
        // 내 친구들 목록 조회
        List<User> myFriendsByUser = friendRepository.findMyFriendsByUser(foundUser);

        // 필터링하는 위치 [ default -> all ]
        String filterLocation = getFilterLocation(postGetDto);

        // 게시물 조회
        List<Post> postList = getPostList(postGetDto, myFriendsByUser, filterLocation);
        if (postList == null) return null;

        // post -> Dto 컨버터
        return PostToDtoConverter.converter(postList, yourLocation);
    }

    private List<Post> getPostList(PostGetDto postGetDto, List<User> myFriendsByUser, String filterLocation) {
        switch(postGetDto.getType()){
            case FRIEND -> {
                return  postRepository.readPost(postGetDto.getPageCount(),
                        postGetDto.getIndex(), myFriendsByUser,2, 1);
            }
            case RANDOM -> {
                List<User> filteredUser = userRepository.filterNotSelectedUserByLocation(filterLocation, myFriendsByUser);
                return postRepository.readPost(postGetDto.getPageCount(),
                        postGetDto.getIndex(), filteredUser, 3, 2);
            }
            default -> {
                return null;
            }
        }
    }

    private static String getFilterLocation(PostGetDto postGetDto) {
        String filterLocation = "";
        if(postGetDto.getLocation()!=null) filterLocation = postGetDto.getLocation();
        return filterLocation+"%";
    }

    private User findUser() {
        Authentication authentication =  SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return userAuthRepository.findUserByEmail(email);
    }
}
