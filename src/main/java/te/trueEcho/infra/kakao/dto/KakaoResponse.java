package te.trueEcho.infra.kakao.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;

@Getter
public class KakaoResponse {

    @JsonProperty("documents")
    private List<Document> documents;

    @Getter
    public static class Document {
        @JsonProperty("region_type")
        private String regionType;

        @JsonProperty("address_name")
        private String addressName;

        @JsonProperty("x")
        private double x;

        @JsonProperty("y")
        private double y;
    }
}
