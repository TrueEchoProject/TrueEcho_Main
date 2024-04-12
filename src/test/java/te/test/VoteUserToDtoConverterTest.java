package te.test;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.temporal.ChronoField;


public class VoteUserToDtoConverterTest {

    @Test
    public void getVoteContentsByWeek() {
        LocalDate now = LocalDate.now();
        int weekOfYear = now.get(ChronoField.ALIGNED_WEEK_OF_YEAR);
        System.out.println("week of Year : " + weekOfYear);
    }

}
