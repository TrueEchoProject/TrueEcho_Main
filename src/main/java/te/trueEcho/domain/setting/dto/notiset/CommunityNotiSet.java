package te.trueEcho.domain.setting.dto.notiset;


import jakarta.persistence.Column;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder

public class CommunityNotiSet {
    private final boolean inRank;
    private final boolean newRank;
    private final boolean voteResult;
}
