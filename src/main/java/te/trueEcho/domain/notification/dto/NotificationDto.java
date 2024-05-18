package te.trueEcho.domain.notification.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class NotificationDto {
    private String title;
    private String body;
    private Data data;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Data {
        private Long userId;
        private Long postId;
        private int notiType;
        private String logicType;
    }
}