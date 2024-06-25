package te.trueEcho.domain.vote.converter;


import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.vote.dto.PhotoResponse;
import te.trueEcho.domain.vote.dto.TargetUserResponse;
import te.trueEcho.domain.vote.dto.VoteUsersResponse;

import java.util.List;

@Component
@NoArgsConstructor
public class VoteUserToDto {

    public  VoteUsersResponse converter(List<Post> postList){
    List<TargetUserResponse> targetUserResponseList =  postList.stream().map(
            post -> TargetUserResponse.builder()
                        .id(post.getUser().getId())
                        .postId(post.getId())
                        .username(post.getUser().getNickname())
                        .profileUrl(post.getUser().getProfileURL())
                        .photoFrontUrl(post.getUrlFront())
                        .photoBackUrl(post.getUrlBack()
                        ).build()
    ).toList();

    return  VoteUsersResponse.builder()
                .userNum(targetUserResponseList.size())
                .userList(targetUserResponseList).build();
    }
}
