package te.trueEcho.domain.setting.dto.notiset;


import lombok.Builder;
import lombok.Getter;

@Builder
@Getter

public class NotificationSettingDto {

    private CommunityNotiSet communityNotiSet;

    private PostNotiSet postNotiSet;

    private boolean friendRequest;

    private boolean PhotoTime;
}
