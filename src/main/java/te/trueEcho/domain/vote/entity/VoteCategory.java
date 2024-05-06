package te.trueEcho.domain.vote.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;


@Getter
@RequiredArgsConstructor
public enum VoteCategory {
    PERSONALITY(1),

    INTEREST(2),

    CAREER(3),

    LIFESTYLE(4),

    ROMANCE(5),

    BRAVENESS(6),
    BIAS(7);

    private final int value;
}



