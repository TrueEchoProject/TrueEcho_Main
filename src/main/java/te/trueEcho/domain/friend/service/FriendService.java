package te.trueEcho.domain.friend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.friend.entity.FriendStatus;
import te.trueEcho.domain.friend.repository.FriendRepositoryImpl;
import te.trueEcho.domain.user.dto.EditUserResponse;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.SuspendedUserRepository;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.domain.user.service.UserAuthServiceImpl;
import te.trueEcho.global.util.AuthUtil;

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
}
