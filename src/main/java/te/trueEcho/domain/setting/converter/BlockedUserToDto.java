package te.trueEcho.domain.setting.converter;

import org.apache.catalina.User;
import te.trueEcho.domain.setting.dto.BlockedUserListResponse;
import te.trueEcho.domain.setting.dto.BlockedUserResponse;
import te.trueEcho.domain.user.entity.Block;

import java.util.List;

public class BlockedUserToDto {

    public static BlockedUserListResponse converter(List<Block> blockedList){
        List<BlockedUserResponse> blockedUserResponseList = blockedList.stream().map(
                block -> BlockedUserResponse.builder()
                        .blockedUserId(block.getId())
                        .blockedUserName(block.getUser().getName())
                        .blockedUserProfileUrl(block.getUser().getProfileURL())
                        .build()
        ).toList();

        return BlockedUserListResponse.builder()
                .blockedUserNum(blockedList.size())
                .blockedUserList(blockedUserResponseList).build();

    }
}
