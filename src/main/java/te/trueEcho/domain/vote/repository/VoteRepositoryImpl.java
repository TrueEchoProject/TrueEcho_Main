package te.trueEcho.domain.vote.repository;


import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.User;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.entity.VoteResult;

import java.time.LocalDate;
import java.time.temporal.ChronoField;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Repository
@RequiredArgsConstructor
public class VoteRepositoryImpl implements VoteRepository {

    private final EntityManager em;
   private final static ConcurrentHashMap<LocalDate, Map<Enum<VoteType>, List<Vote>>> todayVoteContent
           = new ConcurrentHashMap<>();

    private static final int sizeOfEachCategory = 10; // 카테고리 별 투표지 수
    private static final int sizeOfCategory = 8; // 카테고리 수


    private void resetVoteContentMap() {
        todayVoteContent.clear();
        todayVoteContent.put(LocalDate.now(), new HashMap<>());
    }

    private void putTodayVoteContentMap(List<Vote> resultByRule, List<Vote> resultByRandom) {
        todayVoteContent.get(LocalDate.now()).put(VoteType.RULE,resultByRule);
        todayVoteContent.get(LocalDate.now()).put(VoteType.RANDOM,resultByRandom);
    }


    private List<Vote> getSelectedVoteTitle(List<Long> selectedId){
        try{
            return  em.createQuery(
                    "SELECT v FROM Vote v WHERE v.id in (:selectedId)",
                    Vote.class).setParameter("selectedId", selectedId).getResultList();
        }catch (Exception e){
            log.warn("this is error {}",e);
            return null;
        }
    }

    @Override
    public List<Vote> getTodayVoteContentsByType(VoteType type, LocalDate key) {
        if (todayVoteContent.containsKey(key)) {
            return todayVoteContent.get(key).get(type);
        }else{
            return null;
        }
   }


    @Override
   public void createSelectedVoteContents() {
       resetVoteContentMap();

       List<Vote> resultByRule = getSelectedVoteTitle(selectVoteIdByRule());
       List<Vote> resultByRandom = getSelectedVoteTitle(selectRandomVoteId());

       putTodayVoteContentMap(resultByRule, resultByRandom);
   }


    @Transactional
   @Override
    public boolean saveVoteResult(VoteResult result){
       if (result.getId() == null) {
           em.persist(result);
           return true;
       } else {
           em.merge(result);
           return false;
       }
   }

   public Vote findVoteById(Long voteId){
        try{
            return em.createQuery("SELECT v FROM Vote v WHERE v.id = :id", Vote.class)
                    .setParameter("id", voteId)
                    .getSingleResult();
        }catch (Exception e){
            log.warn("this is error {}",e);
            return null;
        }
   }

    //룰에 의한 16개
    private List<Long> selectVoteIdByRule() {

        int weeksAsNum = getThisWeekAsNum();
        int firstNum = (weeksAsNum % (sizeOfEachCategory/2)); // (0~4)+1
        int secondNum = firstNum+(sizeOfEachCategory/2);

       List<Long> selectedId =new ArrayList<>();
        for (int i = 1; i <= sizeOfCategory*sizeOfEachCategory; i++) {
            if(i%sizeOfEachCategory == firstNum || i%sizeOfEachCategory==secondNum) {
                selectedId.add((long) i);
            }
        }

        return selectedId;
    }

    private int getThisWeekAsNum(){
        LocalDate now = LocalDate.now();
        return now.get(ChronoField.ALIGNED_WEEK_OF_YEAR);
    }

    
    //랜덤한 16개
    private List<Long> selectRandomVoteId(){

        // 총 16개의 숫자를 랜덤하게 선택
        List<Long> randomId = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < sizeOfCategory; i++) {
            // 각 범위에서 2개씩 랜덤하게 선택
            int start = i * sizeOfEachCategory + 1;
            int end = start + 9;
            for (int j = 0; j < 2; j++) {
                int randomNumber = random.nextInt(end - start + 1) + start;
                randomId.add((long) randomNumber);
            }
        }
        return randomId;
    }

}
