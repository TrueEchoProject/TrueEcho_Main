package te.trueEcho.global.util;

import java.time.LocalDate;
import java.time.temporal.ChronoField;

public class WeekUtil {

    public static int getThisWeekAsNum(){
        LocalDate now = LocalDate.now();
        return now.get(ChronoField.ALIGNED_WEEK_OF_YEAR);
    }
}
