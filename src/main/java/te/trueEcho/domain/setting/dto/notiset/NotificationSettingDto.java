package te.trueEcho.domain.setting.dto.notiset;


import jakarta.persistence.Column;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter

public class NotificationSettingDto {

    private CommunityNotiSet communityNotiSet;

    private PostNotiSet postNotiSet;

    private boolean friendRequest;

    private boolean photoTime;

    private boolean service;
}
