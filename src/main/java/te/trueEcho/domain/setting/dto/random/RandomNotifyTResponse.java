package te.trueEcho.domain.setting.dto.random;


import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;

@Builder
@Getter
public class RandomNotifyTResponse {
    private final NotiTimeStatus randomNotifyTime;
}
