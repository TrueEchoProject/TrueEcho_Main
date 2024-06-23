package te.trueEcho.domain.post.converter;

import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.post.dto.ReadPostResponse;
import te.trueEcho.domain.post.dto.PostListResponse;
import te.trueEcho.domain.post.entity.Post;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@NoArgsConstructor
public class PostToDto {
    public  PostListResponse converter(List<Post> postList,
                                       String yourLocation,
                                       Long userId,
                                       boolean isFriend) {
        List<ReadPostResponse> readPostResponseList = postList.stream()
                .map(post -> {
                    return ReadPostResponse.builder()
                            .postId(post.getId())
                            .userId(post.getUser().getId())
                            .isMine(Objects.equals(post.getUser().getId(), userId))
                            .isFriend(isFriend)
                            .likesCount(post.getLikes().size())
                            .title(post.getTitle())
                            .postFrontUrl(post.getUrlFront())
                            .postBackUrl(post.getUrlBack())
                            .commentCount(post.getLikes().size())
                            .status(post.getStatus())
                            .username(post.getUser().getName())
                            .profileUrl(post.getUser().getProfileURL())
                            .createdAt(post.getCreatedAt())
                            .isMyLike(
                                    post.getLikes().stream().anyMatch(
                                            like -> like.getUser().getId().equals(userId)
                                    )
                            )
                            .build();
                })
                .collect(Collectors.toList());


        return  PostListResponse.builder()
                .yourLocation(yourLocation)
                .readPostResponse(readPostResponseList)
                .postCount(readPostResponseList.size()).build();
    }
}
