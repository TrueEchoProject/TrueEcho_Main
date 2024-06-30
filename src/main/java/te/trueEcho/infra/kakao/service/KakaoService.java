package te.trueEcho.infra.kakao.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import te.trueEcho.infra.kakao.dto.KakaoResponse;

@RequiredArgsConstructor
@Service
public class KakaoService {

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    private final RestTemplate restTemplate;

    public KakaoResponse getRegionByCoordinates(double x, double y) {
        String url = "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=" + x + "&y=" + y;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<KakaoResponse> response = restTemplate.exchange(url, HttpMethod.GET, entity, KakaoResponse.class);

        if(response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        } else {
            throw new RuntimeException("Failed to fetch data from Kakao API");
        }
    }
}
