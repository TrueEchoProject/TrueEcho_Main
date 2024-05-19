package te.trueEcho.domain.setting.dto.mypage;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;


@Getter
@Builder
public class EditMyInfoRequest {
    private MultipartFile profileImage;
    private String nickname;
    private String username;
    private String location;
}


