package te.trueEcho.domain.setting.dto;


import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.post.entity.Pin;

import java.util.List;

@Getter
@Builder
public class MyPageResponse {
    private String profileUrl;
    private String username;
    private String mostVotedTitle;
    private String location;
}
