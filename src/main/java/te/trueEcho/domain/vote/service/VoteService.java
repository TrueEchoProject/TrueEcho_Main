package te.trueEcho.domain.vote.service;

import te.trueEcho.domain.vote.dto.PhotoResponse;
import te.trueEcho.domain.vote.dto.VoteContentsResponse;
import te.trueEcho.domain.vote.dto.VoteResultRequest;
import te.trueEcho.domain.vote.dto.VoteUsersResponse;

public interface VoteService {


    VoteContentsResponse getVoteContents();

    VoteUsersResponse getVoteRandomUsers(int voteUserCount);

    boolean saveVoteResult(VoteResultRequest voteResultRequest);

    PhotoResponse getVotePhoto(Long userId);
}
