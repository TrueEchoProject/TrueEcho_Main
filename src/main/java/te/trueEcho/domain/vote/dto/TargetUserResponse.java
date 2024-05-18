package te.trueEcho.domain.vote.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class TargetUserResponse {
    Long id;
    String username;
    String profileUrl;
}
