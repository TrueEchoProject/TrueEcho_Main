package te.trueEcho.domain.setting.entity;

public enum NotiTimeStatus {

    DAWN(0, 7), // 00 ~ 07시 : 7시간
    MORNING(7, 12), //07 ~ 12시 : 5시간
    EARLY_AFTERNOON(12, 15), // 12 ~ 15시 : 3시간
    LATE_AFTERNOON(15, 18), // 15 ~ 18시 : 3시간
    EARLY_NIGHT(18, 21), // 18 ~ 21시 : 3시간
    LATE_NIGHT(21, 24); // 21 ~ 24시 :  3시간

    private final int startHours;
    private final int endHours;

    NotiTimeStatus(int startHours, int endHours) {
        this.startHours = startHours;
        this.endHours = endHours;
    }

    public int getStartHours() {
        return startHours;
    }

    public int getEndHours() {
        return endHours;
    }
}