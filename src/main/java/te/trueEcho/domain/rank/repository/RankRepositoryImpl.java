package te.trueEcho.domain.rank.repository;


import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.rank.dto.RankListResponse;

import java.time.LocalDate;
import java.time.temporal.ChronoField;
import java.util.concurrent.ConcurrentHashMap;

import static te.trueEcho.global.util.WeekUtil.getThisWeekAsNum;


@Slf4j
@Repository
@RequiredArgsConstructor

/**

 SELECT rn, VOTE_COUNT, user_id_target, created_at, vote_title, vote_category
 FROM (
 SELECT COUNT(VR.user_id_target) AS VOTE_COUNT, VR.user_id_target, MIN(VR.created_at) AS created_at,
 V.vote_title, V.vote_category,
 ROW_NUMBER() OVER(PARTITION BY V.vote_title ORDER BY COUNT(VR.user_id_target) DESC, MIN(VR.created_at)) AS rn
 FROM vote_results VR JOIN votes V
 ON V.`vote id` = VR.vote_id
 WHERE WEEK(VR.created_at) = WEEK(NOW())
 GROUP BY V.vote_title, VR.user_id_target
 ) subquery
 WHERE rn <= 3
 ORDER BY vote_title, VOTE_COUNT DESC, created_at, rn;
 */

public class RankRepositoryImpl implements RankRepository{
    private final EntityManager em;
    private final static ConcurrentHashMap<Integer, RankListResponse> ranksByWeek
            = new ConcurrentHashMap<>();

    public RankListResponse getRanksByWeek() {

        try {
            return ranksByWeek.getOrDefault(getThisWeekAsNum(), null);

        }catch (Exception e){
            log.error("Error occurred while getting rank", e);
            return null;
        }
    }

    public void cacheThisWeekRank( RankListResponse voteResultMap){
        try {
            resetRank();
            ranksByWeek.put(getThisWeekAsNum(), voteResultMap);
        } catch (Exception e) {
            log.error("Error occurred while caching this week's rank", e);
        }
    }


    private void resetRankByWeek(int week){
        ranksByWeek.remove(week);
    }

    private void resetRank(){
        ranksByWeek.clear();
    }




}
