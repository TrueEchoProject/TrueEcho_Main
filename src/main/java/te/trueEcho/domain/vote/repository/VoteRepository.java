package te.trueEcho.domain.vote.repository;

import te.trueEcho.domain.vote.dto.VoteUsersResponse;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.entity.VoteResult;

import java.util.List;

public interface VoteRepository {

     List<Vote> getThisWeekVoteByType(VoteType type, int key);

     void createSelectedVoteContents();

     boolean saveVoteResult(VoteResult result);

     List<Vote> getRandomVoteWithSize(int size);
     void putTargetUsers(VoteUsersResponse voteUsersResponse) ;
     VoteUsersResponse getTargetUsers(boolean flag);

     VoteResult getVoteResultByVoteId_noti(Long voteId, Long targetUserId, Long senderUserId);

     Vote findVoteById(Long voteId);

     List<VoteResult> getThisWeekVoteResult();
}
