package te.trueEcho.domain.setting.dto;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;


@Getter
@RequiredArgsConstructor
public class PinsRequest {
    List<Long> updatedPostIdList;
}
