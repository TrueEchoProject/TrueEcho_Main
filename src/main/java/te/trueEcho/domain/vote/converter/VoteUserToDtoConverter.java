package te.trueEcho.domain.vote.converter;


import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.vote.dto.TargetUserResponse;
import te.trueEcho.domain.vote.dto.VoteUsersResponse;

import java.util.List;

@Component
@NoArgsConstructor
public class VoteUserToDtoConverter {

    public static VoteUsersResponse converter(List<User> targetuserList){
    List<TargetUserResponse> targetUserResponseList =  targetuserList.stream().map(
            user -> TargetUserResponse.builder()
                        .id(user.getId())
                        .username(user.getNickname())
                        .profileUrl(user.getProfileURL())
                        .build()
    ).toList();

    return  VoteUsersResponse.builder()
                .userNum(targetUserResponseList.size())
                .userList(targetUserResponseList).build();
    }
}
