package te.trueEcho.domain.setting.dto;


import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class MyInfoResponse {
    private final String nickname;
    private final String username;
    private final String profileUrl;
    private final String yourLocation;
}
