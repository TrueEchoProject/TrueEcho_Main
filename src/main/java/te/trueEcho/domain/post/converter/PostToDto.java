package te.trueEcho.domain.post.converter;

import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.post.dto.ReadPostResponse;
import te.trueEcho.domain.post.dto.PostListResponse;
import te.trueEcho.domain.post.entity.Post;

import java.util.List;
import java.util.stream.Collectors;

@NoArgsConstructor
public class PostToDto {
    public  PostListResponse converter(List<Post> postList, String yourLocation, long userId) {
        List<ReadPostResponse> readPostResponseList = postList.stream()
                .map(post -> {
                    return ReadPostResponse.builder()
                            .postId(post.getId())
                            .userId(post.getUser().getId())
                            .isMine(post.getUser().getId()==userId)
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
                .readPostResponse(readPostResponseList)
                .postCount(readPostResponseList.size()).build();
    }
}
