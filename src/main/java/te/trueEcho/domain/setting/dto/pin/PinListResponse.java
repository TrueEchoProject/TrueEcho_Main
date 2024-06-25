package te.trueEcho.domain.setting.dto.pin;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@Getter
@Schema(description = "핀 목록 응답 DTO")
public class PinListResponse {

    @Schema(description = "핀 개수", example = "5", required = true)
    private final int pinsCount;

    @Schema(description = "핀 목록", required = true)
    private final List<PinResponse> pinList;
}
