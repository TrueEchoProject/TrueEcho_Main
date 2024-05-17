package te.trueEcho.domain.setting.converter;


import lombok.Getter;
import lombok.NoArgsConstructor;
import te.trueEcho.domain.post.entity.Pin;
import te.trueEcho.domain.setting.dto.pin.PinListResponse;
import te.trueEcho.domain.setting.dto.pin.PinResponse;

import java.util.List;



@NoArgsConstructor
public class PinListToDto {

    public  PinListResponse convert(List<Pin> pins) {

        List<PinResponse> pinListResponse = pins.stream().map(pin -> {
            return PinResponse.builder()
                    .pinId(pin.getId())
                    .postId(pin.getPost().getId())
                    .postFrontUrl(pin.getPost().getUrlFront())
                    .postBackUrl(pin.getPost().getUrlBack())
                    .createdAt(pin.getCreatedAt())

                    .build();
        }).toList();

        return PinListResponse.builder()
                .pinsCount(pins.size())
                .pinList(pinListResponse)
                .build();

    }
}
