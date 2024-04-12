package te.trueEcho.domain.user.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.query.IllegalQueryOperationException;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.friend.dto.FriendListResponse;
import te.trueEcho.domain.user.dto.BlockListResponse;
import te.trueEcho.domain.user.entity.Block;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.BlockRepository;
import te.trueEcho.domain.user.repository.SuspendedUserRepository;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.global.util.AuthUtil;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlockService {

    private final AuthUtil authUtil;
    private final UserAuthServiceImpl userAuthService;
    private final BlockRepository blockRepository;

    @Transactional
    public boolean addBlock(Long blockUserId) {
        try {
            final User loginUser = authUtil.getLoginUser();
            final User targetUser = userAuthService.findUserByID(blockUserId);

            if (loginUser == null || targetUser == null) {
                log.error("User not found");
                return false;
            }

            final Block block = Block.builder()
                    .user(loginUser)
                    .blockUser(targetUser)
                    .build();

            blockRepository.save(block);

            return true;

        } catch (Exception e) {
            log.error("Error occurred while adding friend", e);
            return false;
        }
    }

    @Transactional
    public boolean removeBlock(Long blockUserId) {
        try {
            final User loginUser = authUtil.getLoginUser();
            final User targetUser = userAuthService.findUserByID(blockUserId);

            if (loginUser == null || targetUser == null) {
                log.error("User not found");
                return false;
            }

            blockRepository.removeBlock(loginUser, targetUser);
            return true;
        } catch (Exception e) {
            log.error("Error occurred while removing block", e);
            return false;
        }
    }

    public List<BlockListResponse> getBlockList() {
        try {
            final User loginUser = authUtil.getLoginUser();

            if (loginUser == null) {
                log.error("sendUser not found");
                return Collections.emptyList();
            }

            List<User> blocks = blockRepository.getBlockList(loginUser);

            if (blocks == null) {
                log.error("No friends found for the user");
                return Collections.emptyList();
            }

            return blocks.stream()
                    .map(block -> BlockListResponse.builder()
                            .userId(block.getId())
                            .nickname(block.getNickname())
                            .userProfileUrl(block.getProfileURL())
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error occurred while getting friend list", e);
            return Collections.emptyList();
        }
    }
}
