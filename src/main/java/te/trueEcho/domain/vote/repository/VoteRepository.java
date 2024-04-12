package te.trueEcho.domain.vote.repository;

import org.apache.catalina.User;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.entity.VoteResult;

import java.time.LocalDate;
import java.util.List;

public interface VoteRepository {

     List<Vote> getTodayVoteContentsByType(VoteType type, LocalDate key);
     void createSelectedVoteContents();

     boolean saveVoteResult(VoteResult result);

     Vote findVoteById(Long voteId);
}
