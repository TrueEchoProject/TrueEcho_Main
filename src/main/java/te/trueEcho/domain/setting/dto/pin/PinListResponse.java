package te.trueEcho.domain.setting.dto.pin;


import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@Getter
public class PinListResponse {

    private final int pinsCount;
    private final List<PinResponse> pinList;
}
