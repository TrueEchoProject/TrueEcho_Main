package te.trueEcho.domain.setting.dto.pin;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.util.List;


@Getter
@RequiredArgsConstructor
@NoArgsConstructor
@Schema(description = "핀 업데이트 요청 DTO")
public class PinsRequest {

    @Schema(description = "업데이트된 게시물 ID 목록", required = true, example = "[123, 456, 789]")
    private List<Long> updatedPostIdList;
}
