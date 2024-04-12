package te.trueEcho.domain.vote.dto;


import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class VoteResultRequest {
    Long userId;
    Long voteId;
}
