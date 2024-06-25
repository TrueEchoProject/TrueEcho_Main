package te.trueEcho.domain.rank.dto;


import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class RankListResponse {
    private final String thisWeek;
    private final List<RankResponse> rankList;
}
