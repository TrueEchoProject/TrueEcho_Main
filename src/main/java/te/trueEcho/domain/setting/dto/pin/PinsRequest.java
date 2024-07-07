package te.trueEcho.domain.setting.dto.pin;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import java.util.List;


@Getter
@Builder

public class PinsRequest {
    private PinsRequest(){}

    public PinsRequest(
        List<Long> updatedPostIdList
    ){
        this.updatedPostIdList = updatedPostIdList;
    }

    private List<Long> updatedPostIdList;
}
