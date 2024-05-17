package te.trueEcho.domain.setting.converter;




import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.setting.dto.MonthlyPostListResponse;
import te.trueEcho.domain.setting.dto.MonthlyPostResponse;

import java.util.List;


public class PostListToDto {
    public static MonthlyPostListResponse converter(List<Post> postList, int month){

        List<MonthlyPostResponse> monthlyPostResponseList = postList.stream().map(post -> {
            return MonthlyPostResponse.builder()
                    .postId(post.getId())
                    .createdAt(post.getCreatedAt())
                    .postFrontUrl(post.getUrlFront())
                    .postBackUrl(post.getUrlBack())
                    .build();
        }).toList();

        return MonthlyPostListResponse.builder()
                .month(month)
                .postCount(postList.size())
                .monthlyPostList(monthlyPostResponseList)
                .build();
    }
}
