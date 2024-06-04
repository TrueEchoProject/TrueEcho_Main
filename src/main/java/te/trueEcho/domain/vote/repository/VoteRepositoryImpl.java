package te.trueEcho.domain.vote.repository;


import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.vote.dto.VoteUsersResponse;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.entity.VoteCategory;
import te.trueEcho.domain.vote.entity.VoteResult;

import java.time.LocalDate;
import java.time.temporal.ChronoField;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

import static te.trueEcho.global.util.WeekUtil.getThisWeekAsNum;
@Slf4j
@Repository
@RequiredArgsConstructor
public class VoteRepositoryImpl implements VoteRepository {

    private final EntityManager em;
    private final static ConcurrentHashMap<Integer, Map<Enum<VoteType>, List<Vote>>> todayVoteContent
            = new ConcurrentHashMap<>();
    private final static ConcurrentLinkedQueue<VoteUsersResponse> voteTargetUsers =
            new ConcurrentLinkedQueue<>();

    private static final int voteSize = 10; // 투표지 수

    private void resetVoteContentMap() {
        todayVoteContent.clear();
        todayVoteContent.put(getThisWeekAsNum(), new HashMap<>());
    }

    private void putThisWeekVoteContentMap(List<Vote> resultByRule, List<Vote> resultByRandom) {
        todayVoteContent.get(getThisWeekAsNum()).put(VoteType.RULE, resultByRule);
        todayVoteContent.get(getThisWeekAsNum()).put(VoteType.RANDOM, resultByRandom);
    }

    @Transactional
    public void putTargetUsers(VoteUsersResponse voteUsersResponse) {
        voteTargetUsers.add(voteUsersResponse);
    }

    @Transactional
    public VoteUsersResponse getTargetUsers(boolean flag) {
        VoteUsersResponse voteUsersResponse =  voteTargetUsers.poll();

        if (flag){
            return voteUsersResponse;
        }

        if(voteUsersResponse == null) {
            return null;
        }else if (voteUsersResponse.getUserNum() == -1){ //사이클 1번째
            putTargetUsers(VoteUsersResponse.builder().userNum(-2).build());
            return getTargetUsers(false); // 재귀
        }else if (voteUsersResponse.getUserNum() == -2){ //사이클 2번째 끝
            return voteUsersResponse;
        }
        else{
            putTargetUsers(voteUsersResponse);
            return voteUsersResponse;
        }

    }

    @Scheduled(cron = "0 0 0 * * ?")
    protected void clearTargetUsers(){
        voteTargetUsers.clear();
    }


    private List<Vote> getSelectedVoteTitle(List<Long> selectedId) {
        try {
            return em.createQuery(
                    "SELECT v FROM Vote v WHERE v.id in (:selectedId)",
                    Vote.class).setParameter("selectedId", selectedId).getResultList();
        } catch (Exception e) {
            log.warn("this is error {}", e);
            return null;
        }
    }

    @Override
    public List<Vote> getThisWeekVoteByType(VoteType type, int key) {
        if (todayVoteContent.containsKey(key)) {
            return todayVoteContent.get(key).get(type);
        } else {
            return null;
        }
    }

    public List<Vote> getRandomVoteWithSize(int size) {
        try {
            return em.createQuery("select v from Vote v " +
                            "order by rand()", Vote.class)
                    .setMaxResults(size)
                    .getResultList();
        } catch (Exception e) {
            log.warn("");
            return null;
        }
    }


    @Override
    public void createSelectedVoteContents() {
        resetVoteContentMap();

        List<Vote> resultByRule = getCategorizedVoteWithSize(voteSize);
        List<Vote> resultByRandom = getRandomVoteWithSize(voteSize);

        putThisWeekVoteContentMap(resultByRule, resultByRandom);
    }


    @Transactional
    @Override
    public boolean saveVoteResult(VoteResult result) {
        if (result.getId() == null) {
            em.persist(result);
            return true;
        } else {
            em.merge(result);
            return false;
        }
    }

    public Vote findVoteById(Long voteId) {
        try {
            return em.createQuery("SELECT v FROM Vote v WHERE v.id = :id", Vote.class)
                    .setParameter("id", voteId)
                    .getSingleResult();
        } catch (Exception e) {
            log.warn("this is error {}", e);
            return null;
        }
    }

    public VoteResult findVoteResultById(Long voteId) {
        try {
            return em.createQuery("SELECT vr FROM VoteResult vr " +
                            "WHERE vr.vote.id = :voteId", VoteResult.class)
                    .setParameter("voteId", voteId)
                    .getSingleResult();
        } catch (Exception e) {
            log.warn("this is error {}", e);
            return null;
        }
    }

    // userId를 통해서 찾은 userTarget이  마지막에 받은 vote의 title을 찾는 로직
    public String findLastVoteTitleByUserId(Long userId) {
        try {
            return em.createQuery("SELECT v.title FROM Vote v " +
                            "JOIN VoteResult vr ON v.id = vr.vote.id " +
                            "WHERE vr.userTarget.id = :userId " +
                            "ORDER BY vr.createdAt DESC", String.class)
                    .setParameter("userId", userId)
                    .setMaxResults(1)
                    .getSingleResult();
        } catch (Exception e) {
            log.warn("this is error {}", e);
            return null;
        }
    }

    //룰에 의한 16개
    private List<Vote> getCategorizedVoteWithSize(int size) {
        try {
            VoteCategory voteCategory =
                    VoteCategory.values()[
                            getThisWeekAsNum()%VoteCategory.values().length
                            ];
            return em.createQuery("SELECT v FROM Vote v " +
                            "WHERE v.category = :type " +
                            "ORDER BY rand()", Vote.class)
                    .setParameter("type", voteCategory)
                    .setMaxResults(size)
                    .getResultList();
        } catch (Exception e) {
            log.warn("this is error {}", e);
            return null;
        }
    }

    

    public List<VoteResult> getThisWeekVoteResult() {
        try {
            return em.createQuery("SELECT VR FROM VoteResult VR " +
                            "JOIN FETCH VR.userTarget " +
                            "JOIN FETCH VR.vote " +
                            "WHERE FUNCTION('WEEK', VR.createdAt) = :currentWeek", VoteResult.class)
                    .setParameter("currentWeek", getThisWeekAsNum()-1)
                    .getResultList();
        } catch (Exception e) {
            log.error("Error occurred while fetching this week's results", e);
            return Collections.emptyList();
        }
    }

}
