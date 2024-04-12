package te.trueEcho.domain.vote.dto;



import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@Getter
public class VoteContentsResponse {
    int contentsSize;
    List<VoteResponse> contentList;
}
