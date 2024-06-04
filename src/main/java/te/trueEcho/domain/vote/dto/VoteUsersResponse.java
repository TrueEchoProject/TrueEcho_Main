package te.trueEcho.domain.vote.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Schema(description = "투표 대상 사용자 응답 DTO")
@Builder
@Getter
public class VoteUsersResponse {

    @Schema(description = "사용자 수", example = "10")
    int userNum;

    @Schema(description = "사용자 목록", example = """
    [
        {
            "id": 1,
            "postId": 101,
            "username": "user1",
            "profileUrl": "http://example.com/profile.jpg",
            "photoFrontUrl": "http://example.com/photoFront.jpg",
            "photoBackUrl": "http://example.com/photoBack.jpg"
        },
        {
            "id": 2,
            "postId": 102,
            "username": "user2",
            "profileUrl": "http://example.com/profile2.jpg",
            "photoFrontUrl": "http://example.com/photoFront2.jpg",
            "photoBackUrl": "http://example.com/photoBack2.jpg"
        }
    ]
    """)
    List<TargetUserResponse> userList;
}
