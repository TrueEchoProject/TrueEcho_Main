package te.trueEcho.domain.rank.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import te.trueEcho.domain.rank.dto.RankListResponse;
import te.trueEcho.domain.rank.service.RankService;
import te.trueEcho.domain.rank.service.ScheduledRankService;
import te.trueEcho.global.response.ResponseCode;
import te.trueEcho.global.response.ResponseForm;

@RestController
@RequiredArgsConstructor
@RequestMapping("/rank")
public class RankController {
    private final RankService rankService;


    @GetMapping("/read")
    public ResponseEntity<ResponseForm> readContent() {

        final RankListResponse rankListResponse = rankService.getRank();

        return rankListResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_SUCCESS,rankListResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_FAIL));
    }
}
