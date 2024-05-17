package te.trueEcho.domain.setting.dto;


import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.user.entity.NotiTimeStatus;

@Builder
@Getter
public class RandomNotifyTResponse {
    private final NotiTimeStatus randomNotifyTime;
}
