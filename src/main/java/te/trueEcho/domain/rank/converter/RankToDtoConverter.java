package te.trueEcho.domain.rank.converter;


import lombok.NoArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.rank.dto.RankListResponse;
import te.trueEcho.domain.rank.dto.RankResponse;
import te.trueEcho.domain.rank.dto.RankUserResponse;
import te.trueEcho.domain.user.dto.RegisterRequest;
import te.trueEcho.domain.user.entity.Role;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.entity.VoteResult;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;


@Component
@NoArgsConstructor
public class RankToDtoConverter {

    public static RankListResponse converter(Map<Vote, Map<User, Integer>> thisWeekRanks) {

        // 모든 랭킹 폼
        List<RankResponse> rankUserResponses = thisWeekRanks.entrySet().stream()
                .map(voteUnit -> {

                    Vote vote = voteUnit.getKey();
                    Map<User, Integer> userVoteCountMap = voteUnit.getValue();

                    // 투표지별
                    List<RankUserResponse> rankUserResponseList = userVoteCountMap.entrySet().stream()
                            .map(userUnit -> {
                                User user = userUnit.getKey();
                                Integer voteCount = userUnit.getValue();

                                //rank에 있는 각 유저 폼
                                return RankUserResponse.builder()
                                        .id(user.getId())
                                        .nickname(user.getNickname())
                                        .profileUrl(user.getProfileURL())
                                        .age(user.getAge())
                                        .voteCount(voteCount)
                                        .gender(user.getGender().toString())
                                        .build();
                            }).toList();

                    return RankResponse.builder()
                            .voteId(vote.getId())
                            .title(vote.getTitle())
                            .category(String.valueOf(vote.getCategory()))
                            .topRankList(rankUserResponseList).build();

                }).toList();

        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        String thisWeek = LocalDate.now().format(DateTimeFormatter.ofPattern("M월 "))
                + LocalDate.now().get(weekFields.weekOfMonth()) + "째주";

        return RankListResponse.builder()
                .thisWeek(thisWeek)
                .rankList(rankUserResponses)
                .build();
    }
}