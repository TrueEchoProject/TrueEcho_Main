package te.trueEcho.domain.setting.dto.mypage;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "마이페이지 응답 DTO")
@Getter
@Builder
public class MyPageResponse {

    @Schema(description = "프로필 URL", example = "http://example.com/profile.jpg", required = true)
    private String profileUrl;

    @Schema(description = "사용자 이름", example = "usernameExample", required = true)
    private String username;

    @Schema(description = "가장 많이 받은 투표 제목", example = "Most Voted Title Example", required = true)
    private String mostVotedTitle;

    @Schema(description = "사용자의 위치", example = "서울광역시 용산구", required = true)
    private String location;
}
