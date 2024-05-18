package te.trueEcho.domain.setting.repository;

import te.trueEcho.domain.post.entity.Pin;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.vote.entity.VoteResult;

import java.util.List;

public interface SettingRepository {

    List<Post> getMonthlyPosts(int month, User user);

    boolean deletePinsByUser(User user);

    List<Pin> getPinsByUser(User user);

    String getMostVotedTitle(User user);

}
