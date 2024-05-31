package te.trueEcho.domain.setting.dto.mypage;

import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.setting.dto.pin.PinListResponse;

@Getter
@Builder
public class OtherPageResponse {
    private final Long userId;
    private final MyPageResponse pageInfo;
    private final boolean isFriend;
    private final PinListResponse pinList;
}
