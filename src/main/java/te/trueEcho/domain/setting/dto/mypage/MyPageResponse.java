package te.trueEcho.domain.setting.dto.mypage;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MyPageResponse {
    private String profileUrl;
    private String username;
    private String mostVotedTitle;
    private String location;
}
