package te.trueEcho.domain.post.dto;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WriterDto {
    String nickname;
    String profileURL;
}
