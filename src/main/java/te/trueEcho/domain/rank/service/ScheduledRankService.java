package te.trueEcho.domain.rank.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.notification.dto.NotiType;
import te.trueEcho.domain.notification.dto.NotificationDto;
import te.trueEcho.domain.notification.service.NotificationServiceImpl;
import te.trueEcho.domain.rank.converter.RankToDto;
import te.trueEcho.domain.rank.repository.RankRepository;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepositoryImpl;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.entity.VoteResult;
import te.trueEcho.domain.vote.repository.VoteRepository;
import te.trueEcho.infra.firebase.service.FCMService;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ScheduledRankService {

    private final VoteRepository voteRepository;
    private final RankRepository rankRepository;
    private final UserAuthRepositoryImpl userAuthRepository;
    private final RankToDto rankToDto;

    private final FCMService fcmService;
    private final NotificationServiceImpl notificationService;

    @Scheduled(cron = "0 0 20 ? * 0", zone = "Asia/Seoul") //매주 일요일 20시에 랭킹을 만들어주는 서비스
    @Transactional
    public void makeRank() {
        try {
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

            rankRepository.cacheThisWeekRank(rankToDto.converter(sortedResults)); // 이번주 랭킹을 캐싱

            // 랭킹을 계산하고 저장
            Map<Vote, Map<User, Integer>> rankResults = rankRepository.cacheThisWeekRank(rankToDto.converter(sortedResults));

            // rankResults가 null인지 확인
            if (rankResults != null) {
                // 랭킹에 있는 각 사용자에게 알림을 보냄
                for (Map.Entry<Vote, Map<User, Integer>> voteEntry : rankResults.entrySet()) {
                    Vote vote = voteEntry.getKey();
                    for (Map.Entry<User, Integer> userEntry : voteEntry.getValue().entrySet()) {
                        User receiver = userEntry.getKey();
                        Integer rank = userEntry.getValue();

                        if (Boolean.TRUE.equals(receiver.getNotificationSetting().getInRankNotification())) {
                            // 알림을 보내는 코드
                            String title = "랭킹 달성";
                            String body = "이번 주 " + vote.getTitle() + " 투표에서 " + rank + "등을 달성하셨어요!";
                            String token = String.valueOf(fcmService.getToken(receiver)); // 사용자의 FCM 토큰을 가져옴

                            if (token != null) {
                                NotificationDto dto = NotificationDto.builder()
                                        .data(NotificationDto.Data.builder()
                                                .userId(receiver.getId())
                                                .contentId(vote.getId())
                                                .notiType(NotiType.IN_RANK.getCode())
                                                .build())
                                        .build();

                                NotificationDto fcmData = notificationService.getNotificationDto(title, body, dto);

                                // fcm 전송
                                fcmService.sendNotification(token, fcmData);

                                // db에 알림 저장
                                notificationService.saveNotiInDB(title, body, dto, receiver, null);
                            }
                        }
                    }
                }
            } else {
                log.error("rankResults is null");
            }
            log.info("Ranking is updated");
        } catch (Exception e) {
            log.error("Error occurred while making rank", e);
        }
    }

    @Scheduled(cron = "0 0 20 ? * 0", zone = "Asia/Seoul") //매주 일요일 20시에 랭킹이 만들어진 후 알림을 보내는 서비스
    @Transactional
    public void sendVoteCompletionNotification() {
        try {
            String title = "투표 완료";
            String body = "이번 주 투표가 마감되었어요. 확인해볼까요?";
            List<User> allUsers = userAuthRepository.findAll();
            for (User receiver : allUsers) {

                if (Boolean.TRUE.equals(receiver.getNotificationSetting().getNewRankNotification())) {

                    String token = String.valueOf(fcmService.getToken(receiver));

                    NotificationDto dto = NotificationDto.builder()
                            .data(NotificationDto.Data.builder()
                                    .userId(receiver.getId())
                                    .notiType(NotiType.NEW_RANK.getCode())
                                    .build())
                            .build();

                    NotificationDto fcmData = notificationService.getNotificationDto(title, body, dto);

                    // fcm 전송
                    fcmService.sendNotification(token, fcmData);

                    // db에 알림 저장
                    notificationService.saveNotiInDB(title, body, dto, receiver, null);
                }
            }
        } catch (Exception e) {
            log.error("Error occurred while sending vote completion notification", e);
        }
    }
}

