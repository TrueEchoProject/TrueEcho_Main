package te.trueEcho.domain.rank.dto;


import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class RankUserResponse {
    private final Long id;
    private final String nickname;
    private final String profileUrl;
    private final int age;
    private final String gender;
    private final int voteCount;
}
