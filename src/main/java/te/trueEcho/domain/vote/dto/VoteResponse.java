package te.trueEcho.domain.vote.dto;


import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class VoteResponse {
    Long id;
    String title;
}
