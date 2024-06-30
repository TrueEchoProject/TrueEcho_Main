package te.trueEcho.domain.vote.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "사진 응답 DTO")
@Builder
@Getter
public class PhotoResponse {

    @Schema(description = "사진 앞면 URL", example = "http://example.com/photoFront.jpg")
    private String photoFrontUrl;

    @Schema(description = "사진 뒷면 URL", example = "http://example.com/photoBack.jpg")
    private String photoBackUrl;
}
