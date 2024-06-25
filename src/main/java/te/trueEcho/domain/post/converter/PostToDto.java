package te.trueEcho.domain.post.converter;

import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.post.dto.FeedType;
import te.trueEcho.domain.post.dto.ReadPostResponse;
import te.trueEcho.domain.post.dto.PostListResponse;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.entity.User;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@NoArgsConstructor
public class PostToDto {
    public  PostListResponse converter(List<Post> postList,
                                       String yourLocation,
                                       Long userId,
                                       FeedType feedType,
                                       List<User> friendGroup) {
        List<ReadPostResponse> readPostResponseList = postList.stream()
                .map(post -> ReadPostResponse.builder()
                        .postId(post.getId())
                        .userId(post.getUser().getId())
                        .profileUrl(post.getUser().getProfileURL())
                        .username(post.getUser().getName())
                        .isMine(Objects.equals(post.getUser().getId(), userId))
                        .isFriend(
                               switch(feedType) {
                                    case FRIEND -> true;
                                    case PUBLIC -> friendGroup.stream().anyMatch(
                                             friend -> Optional.ofNullable(friend)
                                                     .map(user -> user.equals(post.getUser()))
                                                     .orElse(false)
                                     ) || friendGroup.stream().anyMatch(
                                             friend -> Optional.ofNullable(friend)
                                                     .map(user -> user.equals(post.getUser()))
                                                     .orElse(false)
                                     );
                                    case MINE -> true;
                                }
                        )
                        .isMyLike(
                                post.getLikes().stream().anyMatch(
                                        like -> like.getUser().getId().equals(userId)
                                )
                        )
                        .title(post.getTitle())
                        .postFrontUrl(post.getUrlFront())
                        .postBackUrl(post.getUrlBack())
                        .commentCount(post.getComments().size())
                        .likesCount(post.getLikes().size())
                        .status(post.getStatus())
                        .createdAt(post.getCreatedAt())
                        .build()
                )
                .collect(Collectors.toList());


        return  PostListResponse.builder()
                .yourLocation(yourLocation)
                .readPostResponse(readPostResponseList)
                .postCount(readPostResponseList.size()).build();
    }
}
