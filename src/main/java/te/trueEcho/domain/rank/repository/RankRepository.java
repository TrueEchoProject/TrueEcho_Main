package te.trueEcho.domain.rank.repository;


import te.trueEcho.domain.rank.dto.RankListResponse;
import te.trueEcho.domain.rank.entity.Rank;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.vote.entity.Vote;

import java.util.Map;

public interface RankRepository {

     RankListResponse getRanksByWeek();

     Map<Vote, Map<User, Integer>> cacheThisWeekRank(RankListResponse voteResultMap);

     Rank getRankById(Long rankoId);

}
