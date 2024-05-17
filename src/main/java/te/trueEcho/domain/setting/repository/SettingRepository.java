package te.trueEcho.domain.setting.repository;

import te.trueEcho.domain.post.entity.Pin;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.setting.dto.EditMyInfoRequest;
import te.trueEcho.domain.user.entity.Block;
import te.trueEcho.domain.user.entity.User;

import java.util.List;

public interface SettingRepository {

    List<Post> getMontlyPosts(int month, User user);

    List<Pin> getMyPins(User user);

    boolean editMyPins();

    boolean deleteMyPins();

    String getMostVotedTitle(User user);

    List<Block> getBlockedUserList(User user);
}
