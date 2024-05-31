package te.trueEcho.domain.vote.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class TargetUserResponse {
    private Long id;
    private Long postId;
    private String username;
    private String profileUrl;
    private String photoFrontUrl;
    private String photoBackUrl;
}
