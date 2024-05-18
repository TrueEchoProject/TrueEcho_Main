package te.trueEcho.domain.setting.dto.notiset;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder

public class CommunityNotiSet {
    private final boolean rankResult;
    private final boolean voteResult;
}
