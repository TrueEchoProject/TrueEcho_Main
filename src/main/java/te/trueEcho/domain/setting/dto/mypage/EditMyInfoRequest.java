package te.trueEcho.domain.setting.dto.mypage;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

@Schema(description = "개인 정보 수정 요청 DTO")
@Getter
@Builder
public class EditMyInfoRequest {

    @Schema(description = "프로필 이미지 파일", required = true)
    private MultipartFile profileImage;

    @Schema(description = "닉네임", example = "newNickname", required = true)
    private String nickname;

    @Schema(description = "사용자 이름", example = "newUsername", required = true)
    private String username;

    @Schema(description = "경도 x 좌표", example = "127.0", required = true)
    private Double x;

    @Schema(description = "위도 y 좌표", example = "37.5", required = true)
    private Double y;
}
