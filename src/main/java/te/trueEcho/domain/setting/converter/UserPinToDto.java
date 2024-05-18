package te.trueEcho.domain.setting.converter;
import lombok.NoArgsConstructor;
import te.trueEcho.domain.post.entity.Pin;
import te.trueEcho.domain.setting.dto.mypage.MyInfoResponse;
import te.trueEcho.domain.setting.dto.mypage.MyPageResponse;
import te.trueEcho.domain.setting.dto.mypage.OtherPageResponse;
import te.trueEcho.domain.setting.dto.pin.PinListResponse;
import te.trueEcho.domain.setting.dto.pin.PinResponse;
import te.trueEcho.domain.user.entity.User;
import java.util.List;
@NoArgsConstructor



public class UserPinToDto {
    public OtherPageResponse converter(User user, List<Pin> pinList,
                                       String mostVotedTitle, boolean isFriend) {

        return OtherPageResponse.builder()
                .userId(user.getId())
                .pageInfo(
                        MyPageResponse.builder()
                                .username(user.getName())
                                .mostVotedTitle(mostVotedTitle)
                                .profileUrl(user.getProfileURL())
                                .location(user.getLocation())
                                .build())
                .isFriend(isFriend)
                .pinList(
                        PinListResponse.builder()
                                .pinsCount(pinList.size())
                                .pinList(
                                        pinList.stream().map(pin -> {
                                            return PinResponse.builder()
                                                    .pinId(pin.getId())
                                                    .postBackUrl(pin.getPost().getUrlBack())
                                                    .postFrontUrl(pin.getPost().getUrlFront())
                                                    .createdAt(pin.getCreatedAt())
                                                    .postId(pin.getPost().getId())
                                                    .build();
                                        }).toList())
                                .build()
                ).build();
    }
}


