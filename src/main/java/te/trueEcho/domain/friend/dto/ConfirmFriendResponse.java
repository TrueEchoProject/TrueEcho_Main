package te.trueEcho.domain.friend.dto;

import lombok.*;


@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ConfirmFriendResponse {
    private Long userId;
    private String userProfileUrl;
    private String nickname;
}
