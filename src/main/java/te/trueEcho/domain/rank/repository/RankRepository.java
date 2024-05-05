package te.trueEcho.domain.rank.repository;


import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.entity.VoteResult;

import java.time.LocalDate;
import java.time.temporal.ChronoField;
import java.util.List;
import java.util.Map;

public interface RankRepository {

     Map<Vote,Map<User, Integer>>  getRanksByWeek();

     void cacheThisWeekRank( Map<Vote,Map<User, Integer>>  voteResultMap);
}
