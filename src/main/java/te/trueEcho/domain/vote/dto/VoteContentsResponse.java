package te.trueEcho.domain.vote.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Schema(description = "투표 내용 응답 DTO")
@Builder
@Getter
public class VoteContentsResponse {

    @Schema(description = "투표 내용의 수", example = "5")
    int contentsSize;

    @Schema(description = "투표 내용 목록", example = """
    [
        {
            "id": 1,
            "title": "Best Programming Language",
            "category": "Technology"
        },
        {
            "id": 2,
            "title": "Best Movie of the Year",
            "category": "Entertainment"
        }
    ]
    """)
    List<VoteResponse> contentList;
}
