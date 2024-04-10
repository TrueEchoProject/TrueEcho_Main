package te.trueEcho.domain.post.converter;

import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.post.dto.PostResponse;
import te.trueEcho.domain.post.dto.PostListResponse;
import te.trueEcho.domain.post.entity.Post;

import java.util.List;
import java.util.stream.Collectors;

@Component
@NoArgsConstructor
public class PostToDtoConverter {

    public static PostListResponse converter(List<Post> postList, String yourLocation) {

        List<PostResponse> postResponseList = postList.stream()
                .map(post -> {
                    return PostResponse.builder()
                            .postId(post.getId())
                            .userId(post.getUser().getId())
                            .title(post.getTitle())
                            .postFrontUrl(post.getUrlFront())
                            .postBackUrl(post.getUrlBack())
                            .commentCount(post.getLikes().size())
                            .status(post.getStatus())
                            .username(post.getUser().getName())
                            .profileUrl(post.getUser().getProfileURL())
                            .createdAt(post.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());


        return  PostListResponse.builder()
                .yourLocation(yourLocation)
                .postResponses(postResponseList)
                .postCount(postResponseList.size()).build();
    }
}
