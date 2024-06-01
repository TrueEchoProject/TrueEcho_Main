package te.trueEcho.domain.rank.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "랭킹 유저 응답 DTO")
public class RankUserResponse {

    @Schema(description = "사용자 ID", example = "123456", required = true)
    private final Long id;

    @Schema(description = "닉네임", example = "user123", required = true)
    private final String nickname;

    @Schema(description = "프로필 URL", example = "http://example.com/profile123.jpg")
    private final String profileUrl;

    @Schema(description = "나이", example = "30", required = true)
    private final int age;

    @Schema(description = "성별", example = "male", required = true)
    private final String gender;

    @Schema(description = "투표 수", example = "100", required = true)
    private final int voteCount;
}
