package te.trueEcho.infra.kakao.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.util.List;

@Schema(description = "카카오 API 응답 DTO")
@Getter
public class KakaoResponse {

    @Schema(description = "문서 리스트")
    @JsonProperty("documents")
    private List<Document> documents;

    @Schema(description = "카카오 API 문서 DTO")
    @Getter
    public static class Document {

        @Schema(description = "지역 타입", example = "region")
        @JsonProperty("region_type")
        private String regionType;

        @Schema(description = "주소 이름", example = "서울특별시 강남구 역삼동")
        @JsonProperty("address_name")
        private String addressName;

        @Schema(description = "경도", example = "127.029288")
        @JsonProperty("x")
        private double x;

        @Schema(description = "위도", example = "37.492361")
        @JsonProperty("y")
        private double y;
    }
}
