package te.trueEcho.domain.setting.dto.calendar;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Schema(description = "월간 게시물 목록 응답 DTO")
@Builder
@Getter
public class MonthlyPostListResponse {

    @Schema(description = "월", example = "5", required = true)
    private final int month;

    @Schema(description = "게시물 수", example = "10", required = true)
    private final int postCount;

    @Schema(description = "월간 게시물 목록", example = """
    [
        {
            "postId": 1,
            "createdAt": "2023-05-20T15:30:00",
            "postFrontUrl": "http://example.com/postFront.jpg",
            "postBackUrl": "http://example.com/postBack.jpg"
        },
        {
            "postId": 2,
            "createdAt": "2023-05-21T10:00:00",
            "postFrontUrl": "http://example.com/postFront2.jpg",
            "postBackUrl": "http://example.com/postBack2.jpg"
        }
    ]
    """)
    private final List<MonthlyPostResponse> monthlyPostList;
}
