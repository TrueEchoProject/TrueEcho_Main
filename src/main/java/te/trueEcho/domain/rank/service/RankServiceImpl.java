package te.trueEcho.domain.rank.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.rank.dto.RankListResponse;
import te.trueEcho.domain.rank.repository.RankRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class RankServiceImpl implements RankService{
    private final RankRepository rankRepository;
    private final ScheduledRankService scheduledRankService;

    @Override
    public RankListResponse getRank() {



        RankListResponse rankListResponse = rankRepository.getRanksByWeek();
        if(rankListResponse == null){
            scheduledRankService.makeRank();
            rankListResponse = rankRepository.getRanksByWeek();
        }
        return rankListResponse;
    }
}
