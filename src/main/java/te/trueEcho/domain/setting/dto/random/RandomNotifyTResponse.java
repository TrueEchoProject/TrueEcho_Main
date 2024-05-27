package te.trueEcho.domain.setting.dto.random;


import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;
import te.trueEcho.global.response.ResponseCode;

@Builder
@Getter
public class RandomNotifyTResponse {
    private final NotiTimeStatus randomNotifyTime;
    private final String msg;
}
