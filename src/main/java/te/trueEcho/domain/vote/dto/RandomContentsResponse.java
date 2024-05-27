package te.trueEcho.domain.vote.dto;


import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.vote.repository.VoteRepository;

@Getter
@Builder
public class RandomContentsResponse {
    String thisWeekCategory;
    VoteContentsResponse voteContentsResponse;
}
