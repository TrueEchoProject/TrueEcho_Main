package te.trueEcho.domain.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.notification.dto.PostFeedNotiResponse;
import te.trueEcho.domain.notification.dto.*;
import te.trueEcho.domain.notification.entity.NotificationEntity;
import te.trueEcho.domain.notification.repository.NotificationRepository;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.rank.entity.Rank;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.domain.vote.entity.VoteResult;
import te.trueEcho.domain.vote.repository.VoteRepositoryImpl;
import te.trueEcho.global.util.AuthUtil;
import te.trueEcho.infra.firebase.service.FCMService;

import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Date;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final AuthUtil authUtil;

    private final FCMService fcmService;
//    private final NotificationEditServiceImplV1 notificationEditService;

    private final NotificationRepository notificationRepository;
    private final UserAuthRepository userAuthRepository;
    private final VoteRepositoryImpl voteRepository;


    @Override
    public boolean sendNotificationCtoStoC(NotificationDto request) {

        final User sender = authUtil.getLoginUser();
        final User receiver = userAuthRepository.findUserById(request.getData().getUserId());
        String token = String.valueOf(fcmService.getToken(receiver));  // 토큰 가져오기

        // FCM을 통해 알림 전송
        if (token != null) {

            // notiType에 따라 알림을 분기
            switch (NotiType.values()[request.getData().getNotiType()]) {

                // 서버에서 클라이언트로 알림을 보내는 경우
                case PHOTO_TIME:

                    // 서비스 fcm 전송
                    fcmService.sendNotification(token, request);

                    // 알림을 받은 유저를 대기 큐에 넣음
//                    notificationEditService.checkIfUserIsWaiting(receiver);

                    // db에 알림 저장
                    saveNotiInDB(request.getTitle(), request.getBody(), request, receiver, null);
                    return true;

                case SERVICE:

                    // 서비스 fcm 전송
                    fcmService.sendNotification(token, request);

                    // db에 알림 저장
                    saveNotiInDB(request.getTitle(), request.getBody(), request, receiver, null);
                    return true;

                // 클라이언트에서 서버로 이벤트 감지해서 데이터 전송하고 클라이언트로 알림을 보내는 경우
                case VOTE_RESULT:
                    // 유저의 알림 설정을 확인
                    // 알림 설정이 true인 경우에만 알림을 보냄
                    if (Boolean.TRUE.equals(receiver.getNotificationSetting().getVoteResultNotification())) {

                        //fcmData 재료
                        String voteTitle = voteRepository.findLastVoteTitleByUserId(request.getData().getUserId());
                        String title = "투표받음";
                        String body = voteTitle + "질문에" + sender.getAge() + " " + sender.getGender() + " " + sender.getNickname() + "님이 투표하셨어요. 확인해볼까요?";

                        //fcmData 생성
                        NotificationDto fcmData = getNotificationDto(title, body, request);

                        // fcm 전송
                        fcmService.sendNotification(token, fcmData);

                        // db에 알림 저장
                        saveNotiInDB(title, body, request, receiver, sender);
                        return true;
                    }
                    break;

                case COMMENT:
                    if (Boolean.TRUE.equals(receiver.getNotificationSetting().getCommentNotification())) {

                        //fcmData 재료
                        String title = "댓글 추가";
                        String body = "새로 작성된 댓글이 있어요";

                        //fcmData 생성
                        NotificationDto fcmData = getNotificationDto(title, body, request);

                        // fcm 전송
                        fcmService.sendNotification(token, fcmData);

                        // db에 알림 저장
                        saveNotiInDB(title, body, request, receiver, sender);
                        return true;
                    }
                    break;

                case SUB_COMMENT:
                    if (Boolean.TRUE.equals(receiver.getNotificationSetting().getSubCommentNotification())) {

                        //fcmData 재료
                        String title = "답글 추가";
                        String body = "당신의 덧글에 답글이 달렸어요";

                        //fcmData 생성
                        NotificationDto fcmData = getNotificationDto(title, body, request);

                        // fcm 전송
                        fcmService.sendNotification(token, fcmData);

                        // db에 알림 저장
                        saveNotiInDB(title, body, request, receiver, sender);
                        return true;
                    }
                    break;

                case POST_LIKE:
                    if (Boolean.TRUE.equals(receiver.getNotificationSetting().getLikeNotification())) {

                        //fcmData 재료
                        String title = "좋아요";
                        String body = sender.getName() + "님이 좋아요를 눌렀어요!";

                        //fcmData 생성
                        NotificationDto fcmData = getNotificationDto(title, body, request);

                        // fcm 전송
                        fcmService.sendNotification(token, fcmData);

                        // db에 알림 저장
                        saveNotiInDB(title, body, request, receiver, sender);
                        return true;
                    }
                    break;

                case FRIEND_REQUEST:
                    if (Boolean.TRUE.equals(receiver.getNotificationSetting().getFriendRequestNotification())) {

                        //fcmData 재료
                        String title = "친구 요청";
                        String body = "새로운 친구 요청이 있어요!";

                        //fcmData 생성
                        NotificationDto fcmData = getNotificationDto(title, body, request);

                        // fcm 전송
                        fcmService.sendNotification(token, fcmData);

                        // db에 알림 저장
                        saveNotiInDB(title, body, request, receiver, sender);
                        return true;
                    }
                    break;

                default:
                    // notiType이 예상 범위 밖인 경우 로그를 남김
                    log.warn("Unexpected notiType: {}", request.getData().getNotiType());
                    return false;
            }
        } else {
            log.warn("User token not found for notiType: {}", request.getData().getNotiType());
        }
        return false;
    }

    @Override
    public CommunityFeedNotiResponse getCommunityNotification(int page, int size) {
        User receiver = authUtil.getLoginUser();

        // receiver가 받은 알람중 NotiType이 IN_RANK, NEW_RANK, VOTE_RESULT인 것들만 모두 가져옴
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<NotificationEntity> notifications = notificationRepository.findByReceiverAndNotiTypeIn(receiver, Arrays.asList(NotiType.IN_RANK.getCode(), NotiType.NEW_RANK.getCode(), NotiType.VOTE_RESULT.getCode()), pageable);

        // 이후 가져온 알람들을 각각의 DTO로 변환
        List<Object> allNotis = notifications.stream().map(notification -> {
            switch (NotiType.values()[notification.getData().getNotiType()]) {
                case IN_RANK:
                    Rank rank = notification.getRank();
                    String voteTitle = rank.getVote().getTitle();
                    return ReadCommunityFeedInRankNoti.builder()
                            .id(notification.getId())
                            .type(notification.getData().getNotiType())
                            .rank(rank.getRankLevel())
                            .rank_vote(voteTitle)
                            .created_at(notification.getCreatedAt())
                            .build();
                case NEW_RANK:
                    return ReadCommunityFeedNewRankNoti.builder()
                            .id(notification.getId())
                            .type(notification.getData().getNotiType())
                            .created_at(String.valueOf(notification.getCreatedAt()))
                            .build();
                case VOTE_RESULT:
                    VoteResult voteResult = notification.getVoteResult();
                    User sender = userAuthRepository.findUserById(notification.getData().getSenderId());
                    return ReadCommunityFeedVoteResultNoti.builder()
                            .id(notification.getId())
                            .type(notification.getData().getNotiType())
                            .profile_url(sender.getProfileURL())
                            .username(sender.getName())
                            .vote(voteResult.getVote().getTitle())
                            .gender(sender.getGender())
                            .age(sender.getAge())
                            .sender_id(sender.getId())
                            .created_at(String.valueOf(notification.getCreatedAt()))
                            .build();
                default:
                    throw new IllegalStateException("Unexpected value: " + NotiType.values()[notification.getData().getNotiType()]);
            }
        }).collect(Collectors.toList());

        return CommunityFeedNotiResponse.builder()
                .allNotis(allNotis)
                .build();
    }

    @Override
    public PostFeedNotiResponse getPostNotification(int page, int size) {
        User receiver = authUtil.getLoginUser();

        // receiver가 받은 알람중 NotiType이 COMMENT, SUB_COMMENT, POST_LIKE, FRIEND_REQUEST인 것들만 모두 가져옴
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<NotificationEntity> notifications = notificationRepository.findByReceiverAndNotiTypeIn(receiver, Arrays.asList(NotiType.COMMENT.getCode(), NotiType.SUB_COMMENT.getCode(), NotiType.POST_LIKE.getCode(), NotiType.FRIEND_REQUEST.getCode()), pageable);

        // 이후 가져온 알람들을 각각의 DTO로 변환
        List<Object> allNotis = notifications.stream().map(notification -> {
            switch (NotiType.values()[notification.getData().getNotiType()]) {
                case COMMENT:
                    User commentSender = userAuthRepository.findUserById(notification.getData().getSenderId());
                    return ReadPostFeedCommentNoti.builder()
                            .id(notification.getId())
                            .type(notification.getData().getNotiType())
                            .profile_url(commentSender.getProfileURL())
                            .username(commentSender.getName())
                            .comment(notification.getComment().getContent())
                            .post_id(notification.getComment().getPost().getId())
                            .created_at(String.valueOf(notification.getCreatedAt()))
                            .build();
                case SUB_COMMENT:
                    User subCommentSender = userAuthRepository.findUserById(notification.getData().getSenderId());
                    return ReadPostFeedSubCommentNoti.builder()
                            .id(notification.getId())
                            .type(notification.getData().getNotiType())
                            .profile_url(subCommentSender.getProfileURL())
                            .username(subCommentSender.getName())
                            .comment(notification.getComment().getContent())
                            .post_id(notification.getComment().getPost().getId())
                            .created_at(String.valueOf(notification.getCreatedAt()))
                            .build();
                case POST_LIKE:
                    User likeSender = userAuthRepository.findUserById(notification.getData().getSenderId());
                    Post post = notification.getLike().getPost();
                    return ReadPostFeedPostLikeNoti.builder()
                            .id(notification.getId())
                            .type(notification.getData().getNotiType())
                            .profile_url(likeSender.getProfileURL())
                            .post_back_url(post.getUrlBack())
                            .like_username(likeSender.getName())
                            .post_id(post.getId())
                            .created_at(String.valueOf(notification.getCreatedAt()))
                            .build();
                case FRIEND_REQUEST:
                    User friendRequestSender = userAuthRepository.findUserById(notification.getData().getSenderId());
                    return ReadPostFeedFriendRequestNoti.builder()
                            .id(notification.getId())
                            .type(notification.getData().getNotiType())
                            .profile_url(friendRequestSender.getProfileURL())
                            .friend_username(friendRequestSender.getName())
                            .created_at(String.valueOf(notification.getCreatedAt()))
                            .build();
                default:
                    throw new IllegalStateException("Unexpected value: " + NotiType.values()[notification.getData().getNotiType()]);
            }
        }).collect(Collectors.toList());

        return PostFeedNotiResponse.builder()
                .allNotis(allNotis)
                .build();
    }


    public void sendServiceNoti(String title, String body) {
        List<User> users = userAuthRepository.findAll();
        for (User receiver : users) {
            if (Boolean.TRUE.equals(receiver.getNotificationSetting().getServiceNotification())) {
                String token = String.valueOf(fcmService.getToken(receiver));

                if (token != null) {
                    NotificationDto request = NotificationDto.builder().title(title).body(body).data(NotificationDto.Data.builder().userId(receiver.getId()).notiType(NotiType.SERVICE.getCode()).build()).build();

                    this.sendNotificationCtoStoC(request);
                }
            }
        }
    }

    // NotiTimeStatus에 따라서 알람을 보낼 유저를 선별하여 알람을 보내는 메소드
    public void sendNotiByNotiTimeStatus(NotiTimeStatus notiTimeStatus) {
        // 무작위 시간을 생성
        Random random = new Random();
        int randomHour = random.nextInt(notiTimeStatus.getEndHours() - notiTimeStatus.getStartHours()) + notiTimeStatus.getStartHours(); // 해당 시간대에 무작위 시간을 생성
        int randomMinute = random.nextInt(60); // 무작위 분을 생성

        // 해당 시간대에 알림을 받기로 설정한 모든 사용자를 찾음
        List<User> users = userAuthRepository.findAllByNotiTimeStatus(notiTimeStatus);

        for (User receiver : users) {
            if (Boolean.TRUE.equals(receiver.getNotificationSetting().getPhotoTimeNotification())) {
                String token = String.valueOf(fcmService.getToken(receiver));

                if (token != null) {
                    // 알림을 보낼 시간을 설정
                    LocalDateTime notiTime = LocalDateTime.now()
                            .withHour(randomHour)
                            .withMinute(randomMinute)
                            .withSecond(0);

                    // 알림을 보낼 시간을 setting_noti_time에 저장
                    receiver.getNotificationSetting().setNotificationTime(notiTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm")));

                    // 알림을 보낼 시간이 되면 알림을 보냄
                    scheduleNotification(receiver, notiTime);
                }
            }
        }
    }
    // 알림을 보낼 시간이 되면 알림을 보내는 메소드
    public void scheduleNotification(User receiver, LocalDateTime notiTime) {
        Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                NotificationDto request = NotificationDto.builder()
                        .title("사진 찍을 시간")
                        .body("사진을 찍어요!")
                        .data(NotificationDto.Data.builder()
                                .userId(receiver.getId())
                                .notiType(NotiType.PHOTO_TIME.getCode())
                                .build())
                        .build();

                sendNotificationCtoStoC(request);
            }
        }, Date.from(notiTime.atZone(ZoneId.systemDefault()).toInstant()));
    }

    // 00시에 실행
    @Scheduled(cron = "0 0 0 * * ?", zone = "Asia/Seoul")
    public void sendDawnNoti() {
        sendNotiByNotiTimeStatus(NotiTimeStatus.DAWN);
    }

    // 07시에 실행
    @Scheduled(cron = "0 0 7 * * ?", zone = "Asia/Seoul")
    public void sendMorningNoti() {
        sendNotiByNotiTimeStatus(NotiTimeStatus.MORNING);
    }

    // 12시에 실행
    @Scheduled(cron = "0 0 12 * * ?", zone = "Asia/Seoul")
    public void sendEarlyAfternoonNoti() {
        sendNotiByNotiTimeStatus(NotiTimeStatus.EARLY_AFTERNOON);
    }

    // 15시에 실행
    @Scheduled(cron = "0 0 15 * * ?", zone = "Asia/Seoul")
    public void sendLateAfternoonNoti() {
        sendNotiByNotiTimeStatus(NotiTimeStatus.LATE_AFTERNOON);
    }

    // 18시에 실행
    @Scheduled(cron = "0 0 18 * * ?", zone = "Asia/Seoul")
    public void sendEarlyNightNoti() {
        sendNotiByNotiTimeStatus(NotiTimeStatus.EARLY_NIGHT);
    }

    // 21시에 실행
    @Scheduled(cron = "0 0 21 * * ?", zone = "Asia/Seoul")
    public void sendLateNightNoti() {
        sendNotiByNotiTimeStatus(NotiTimeStatus.LATE_NIGHT);
    }


    public void saveNotiInDB(String title, String body, NotificationDto request, User receiver, User sender) {
        NotificationEntity notification = NotificationEntity
                .builder()
                .title(title)
                .body(body)
                .receiver(receiver)
                .data(NotificationEntity.Data
                        .builder()
                        .senderId(sender.getId())
                        .contentId(request.getData().getContentId())
                        .notiType(request.getData().getNotiType())
                        .build())
                .build();
        notificationRepository.save(notification);
    }

    public NotificationDto getNotificationDto(String title, String body, NotificationDto request) {
        return NotificationDto.builder()
                .title(title)
                .body(body)
                .data(NotificationDto.Data
                        .builder()
                        .userId(request.getData().getUserId())
                        .contentId(request.getData().getContentId())
                        .notiType(request.getData().getNotiType())
                        .build())
                .build();
    }
}