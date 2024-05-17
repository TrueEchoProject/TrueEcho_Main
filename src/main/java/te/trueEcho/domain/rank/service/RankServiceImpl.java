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

    @Override
    public RankListResponse getRank() {
        return rankRepository.getRanksByWeek();
    }
}
