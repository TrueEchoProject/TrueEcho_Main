package te.trueEcho.domain.user.entity;

public enum NotiTimeStatus {
    /**
     *    entity : jun10920
     *    * @param : NONE
     *    ! 설명 및 주의사항
     *    last edit: 24.04.05
     */
    DAWN, // 00 ~ 07시
    MORNING, //07 ~ 12시
    EARLY_AFTERNOON, // 12 ~ 15시
    LATE_AFTERNOON , // 15 ~ 18시
    EARLY_NIGHT, // 18 ~ 21시
    LATE_NIGHT; // 21 ~ 24시
}
