package te.trueEcho.domain.post.converter;

import lombok.NoArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.post.dto.PostDto;
import te.trueEcho.domain.post.dto.PostListDto;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.dto.SignUpUserDto;
import te.trueEcho.domain.user.entity.Role;
import te.trueEcho.domain.user.entity.User;

import java.util.List;
import java.util.stream.Collectors;

@Component
@NoArgsConstructor
public class PostToDtoConverter {

    public static PostListDto converter(List<Post> postList, String yourLocation) {

        List<PostDto> postDtoList = postList.stream()
                .map(post -> {
                    return PostDto.builder()
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


        return  PostListDto.builder().yourLocation(yourLocation).postDtos(postDtoList).build();
    }
}
