package te.trueEcho.domain.friend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.query.IllegalQueryOperationException;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.friend.dto.ConfirmFriendResponse;
import te.trueEcho.domain.friend.dto.FriendListResponse;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.friend.repository.FriendRepositoryImpl;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.service.UserAuthServiceImpl;
import te.trueEcho.global.util.AuthUtil;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static te.trueEcho.domain.friend.entity.FriendStatus.NOT_FRIEND;

@Slf4j
@Service
@RequiredArgsConstructor
public class FriendService {
    private final UserAuthServiceImpl userAuthService;
    private final AuthUtil authUtil;
    private final FriendRepositoryImpl friendRepository;

    public boolean addFriend(Long targetUserId) {
        try {
            final User sendUser = authUtil.getLoginUser();
            final User targetUser = userAuthService.findUserByID(targetUserId);

            if (sendUser == null || targetUser == null) {
                log.error("User not found");
                return false;
            }

            final Friend friend = Friend.builder()
                    .sendUser(sendUser)
                    .status(NOT_FRIEND)
                    .targetUser(targetUser)
                    .build();

            friendRepository.save(friend);

            return true;

        } catch (Exception e) {
            log.error("Error occurred while adding friend", e);
            return false;
        }
    }

    public List<ConfirmFriendResponse> confirmReceiveRequest() {
        try {
            final User targetUser = authUtil.getLoginUser();
            if (targetUser == null) {
                log.info("targetUser not found");
                return Collections.emptyList();
            }

            final List<User> sendUsers = friendRepository.getSendUser(targetUser);

            if (sendUsers == null || sendUsers.isEmpty()) {
                log.error("sendUser not found");
                return Collections.emptyList();
            }

            return sendUsers.stream()
                    .map(sendUser -> ConfirmFriendResponse.builder()
                            .userId(sendUser.getId())
                            .userProfileUrl(sendUser.getProfileURL())
                            .nickname(sendUser.getNickname())
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error occurred while confirming friend request", e);
            return Collections.emptyList();
        }
    }

    public List<ConfirmFriendResponse> confirmSendRequest() {
        try {
            final User sendUser = authUtil.getLoginUser();
            if (sendUser == null) {
                log.error("sendUser not found");
                return Collections.emptyList();
            }

            final List<User> targetUsers = friendRepository.getTargetuser(sendUser);

            if (targetUsers == null || targetUsers.isEmpty()) {
                log.info("targetUser not found");
                return Collections.emptyList();
            }

            return targetUsers.stream()
                    .map(targetUser -> ConfirmFriendResponse.builder()
                            .userId(targetUser.getId())
                            .userProfileUrl(targetUser.getProfileURL())
                            .nickname(targetUser.getNickname())
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error occurred while confirming friend request", e);
            return Collections.emptyList();
        }
    }

    public boolean acceptRequest(Long sendUserId) {
        try {
            final User targetUser = authUtil.getLoginUser();
            friendRepository.acceptRequest(targetUser, sendUserId);
            return true;

        } catch (IllegalArgumentException e) {
            log.error("Invalid argument provided", e);
            return false;
        } catch (IllegalQueryOperationException e) {
            log.error("Error occurred while executing the query", e);
            return false;
        } catch (Exception e) {
            log.error("An unexpected error occurred", e);
            return false;
        }
    }

    public boolean removeFriend(Long sendUserId) {
        try {
            final User targetUser = authUtil.getLoginUser();
            final User sendUser = userAuthService.findUserByID(sendUserId);

            boolean firstRemove = friendRepository.rejectRequest(targetUser, sendUser);
            boolean secondRemove = friendRepository.rejectRequest(sendUser, targetUser);

            if (!firstRemove || !secondRemove) {
                log.error("Error occurred while removing friend");
                return false;
            }
            return true;

        } catch (IllegalArgumentException e) {
            log.error("Invalid argument provided", e);
            return false;
        } catch (IllegalQueryOperationException e) {
            log.error("Error occurred while executing the query", e);
            return false;
        } catch (Exception e) {
            log.error("An unexpected error occurred", e);
            return false;
        }
    }

    public List<FriendListResponse> getFriendList() {
        try {
            final User loginUser = authUtil.getLoginUser();

            if (loginUser == null) {
                log.error("sendUser not found");
                return Collections.emptyList();
            }

            List<User> friends = friendRepository.getFriendList(loginUser);

            if (friends == null) {
                log.error("No friends found for the user");
                return Collections.emptyList();
            }

            return friends.stream()
                    .map(friend -> FriendListResponse.builder()
                            .userId(friend.getId())
                            .nickname(friend.getNickname())
                            .userProfileUrl(friend.getProfileURL())
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error occurred while getting friend list", e);
            return Collections.emptyList();
        }
    }
}
