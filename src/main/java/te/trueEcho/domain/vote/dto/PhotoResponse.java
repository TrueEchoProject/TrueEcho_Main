package te.trueEcho.domain.vote.dto;


import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class PhotoResponse {
    private String photoFrontUrl;
    private String photoBackUrl;

}
