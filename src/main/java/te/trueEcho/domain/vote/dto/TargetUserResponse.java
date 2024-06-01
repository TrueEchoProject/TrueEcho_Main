package te.trueEcho.domain.vote.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "타겟 사용자 응답 DTO")
@Builder
@Getter
public class TargetUserResponse {

    @Schema(description = "사용자 ID", example = "1")
    private Long id;

    @Schema(description = "게시물 ID", example = "101")
    private Long postId;

    @Schema(description = "사용자 이름", example = "user1")
    private String username;

    @Schema(description = "프로필 이미지 URL", example = "http://example.com/profile.jpg")
    private String profileUrl;

    @Schema(description = "사진 앞면 URL", example = "http://example.com/photoFront.jpg")
    private String photoFrontUrl;

    @Schema(description = "사진 뒷면 URL", example = "http://example.com/photoBack.jpg")
    private String photoBackUrl;
}
