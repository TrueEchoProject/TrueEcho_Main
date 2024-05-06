package te.trueEcho.domain.rank.repository;


import te.trueEcho.domain.rank.dto.RankListResponse;

public interface RankRepository {

     RankListResponse getRanksByWeek();

     void cacheThisWeekRank( RankListResponse voteResultMap);

}
