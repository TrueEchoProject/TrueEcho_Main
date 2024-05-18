package te.trueEcho.domain.setting.dto.calendar;


import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@Getter
public class MonthlyPostListResponse {
    private final int month;
    private final int postCount;
    private final List<MonthlyPostResponse> monthlyPostList;
}
