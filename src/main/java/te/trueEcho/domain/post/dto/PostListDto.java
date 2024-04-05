package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Getter
@Builder
public class PostListDto {
    String yourLocation;
    List<PostDto> postDtos;
}
