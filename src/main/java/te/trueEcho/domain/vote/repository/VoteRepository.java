package te.trueEcho.domain.vote.repository;

import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.entity.VoteResult;

import java.time.LocalDate;
import java.util.List;

public interface VoteRepository {

     List<Vote> getTodayVoteContentsByType(VoteType type, LocalDate key);

     void createSelectedVoteContents();

     boolean saveVoteResult(VoteResult result);

     Vote findVoteById(Long voteId);

     List<VoteResult> getThisWeekVoteResult();
}
