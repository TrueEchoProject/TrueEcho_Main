package te.trueEcho.domain.setting.entity;

public enum NotiTimeStatus {

    DAWN(0), // 00 ~ 07시 : 7시간
    MORNING(7), //07 ~ 12시 : 5시간
    EARLY_AFTERNOON(12), // 12 ~ 15시 : 3시간
    LATE_AFTERNOON(15), // 15 ~ 18시 : 3시간
    EARLY_NIGHT(18), // 18 ~ 21시 : 3시간
    LATE_NIGHT(21); // 21 ~ 24시 :  3시간

    private final int hours;

    NotiTimeStatus(int hours) {
        this.hours = hours;
    }

    public int getHours() {
        return hours;
    }
}