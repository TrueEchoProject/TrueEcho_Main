package te.trueEcho.domain.friend.repository;

import te.trueEcho.domain.user.entity.User;
import java.util.List;

public interface FriendRepository {
    List<User> findMyFriendsByUser(User user);
}