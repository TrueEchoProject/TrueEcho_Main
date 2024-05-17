package te.trueEcho.domain.rank.service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.rank.converter.RankToDto;
import te.trueEcho.domain.rank.repository.RankRepository;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.entity.VoteResult;
import te.trueEcho.domain.vote.repository.VoteRepository;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


// 1. 먼저 투표지별로 그룹핑 -> 투표지별 투표를 받은 유저가 그룹핑됨.
// 2. 1번에서 그룹핑된 결과를 유저별로 그룹핑해야 함. -> 유저별로 투표를 받은 횟수를 카운트할 수 있음
// 3. 2번에서 그룹핑된 결과를 정렬하여 상위 3명을 선정해야 함.

// 투표지별 그룹핑 -> 투표지별 투표를 받은 유저로 한번 더 그룹핑
        /* ex)
        vote1 : { id: 1 , title: "세상에서 가장 멋진 사람", category: "인물" }
        vote2 : { id: 2 , title: "세상에서 키큰 사람", category: "인물" }
        user1 : { id: 1, name: "홍길동", nickname: "hong"...}
        user2 : { id: 2, name: "김철수", nickname: "kim"...}
        voteResult1 : { id: 1, vote: vote1, userTarget: user1, createdAt: 2021-04-01 }
        voteResult2 : { id: 2, vote: vote1, userTarget: user1, createdAt: 2021-04-02 }
        voteResult3 : { id: 3, vote: vote1, userTarget: user2, createdAt: 2021-04-03 }
        voteResult4 : { id: 4, vote: vote1, userTarget: user2, createdAt: 2021-04-04 }

        {
            vote1: {
                user1: [voteResult1, voteResult2,voteResult12,voteResult11]
                user2: [voteResult3, voteResult4],
                ...
            },
            vote2: {
                user1: [voteResult5, voteResult6, voteResult9,voteResult10
                user2: [voteResult7, voteResult8],
                ...
            },

        위의 예시를 보면, vote1에 대한 결과를 보면 user1이 4번, user2가 2번 투표를 받았다.
        그럼 vote1에 대한 랭킹을 부여할 때 user1이 1등, user2가 2등이 되어야 한다.
        결국 vote로 그룹핑을 하고, 그 vote를 받은 user로 한번 더 그룹핑을 해야 한다.
        그리고 user별로 투표를 받은 횟수를 카운트해야 한다.
         */
@Service
@Slf4j
@RequiredArgsConstructor
public class ScheduledRankService {

    private final VoteRepository voteRepository;
    private final RankRepository rankRepository;

  @Scheduled(cron = "0 0 20 ? * 0", zone = "Asia/Seoul") //매주 일요일 20시에 랭킹을 만들어주는 서비스
    @Transactional
    public void makeRank() {

        List<VoteResult> voteResults = voteRepository.getThisWeekVoteResult();

        Map<Vote, Map<User, List<VoteResult>>> groupedResults = voteResults.stream()
                .collect(Collectors.groupingBy(VoteResult::getVote,
                        Collectors.groupingBy(VoteResult::getUserTarget)));


        Map<Vote, Map<User, Integer>> sortedResults = new HashMap<>(); // 투표지별로 탑 3명을 선정한 결과를 저장할 맵

        // 각 투표지별 가장 투표를 많이 받은 유저 상위 3명을 선정
        for (Map.Entry<Vote, Map<User, List<VoteResult>>> entry : groupedResults.entrySet()) { // 투표지 단위 연산
            Vote vote = entry.getKey();
            Map<User, List<VoteResult>> userVoteResults = entry.getValue(); // 그 투표지를 받은 유저들의 집합

            List<Map.Entry<User, List<VoteResult>>> sortedUserVoteResults = userVoteResults.entrySet()
                    .stream()
                    .sorted(
                            Comparator.comparing((Map.Entry<User, List<VoteResult>> userVoteResult) ->
                                            userVoteResult.getValue().size()).reversed() // 투표를 많이 받은 순서
                                    .thenComparing(userVoteResult ->
                                            userVoteResult.getValue().get(0).getCreatedAt())) // 더 먼저 투표를 받은 순서로 정렬
                    .limit(3) // 상위 3명만 선정
                    .toList();

            sortedUserVoteResults.forEach(userVoteResult -> {
                User user = userVoteResult.getKey(); // 투표를 받은 유저
                Integer voteCount = userVoteResult.getValue().size(); // 투표를 받은 횟수
                sortedResults.putIfAbsent(vote, new HashMap<>());
                sortedResults.get(vote).put(user, voteCount);
            });
        }

        rankRepository.cacheThisWeekRank(RankToDto.converter(sortedResults)); // 이번주 랭킹을 캐싱

        log.info("Ranking is updated");
    }
}


