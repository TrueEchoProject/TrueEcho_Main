package te.trueEcho.domain.vote.dto;

import lombok.Builder;
import lombok.Getter;
import te.trueEcho.domain.user.entity.User;

import java.util.List;

@Builder
@Getter
public class VoteUsersResponse {
    int userNum;
    List<TargetUserResponse> userList;
}
