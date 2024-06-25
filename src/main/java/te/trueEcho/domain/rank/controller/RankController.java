package te.trueEcho.domain.rank.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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


@Tag(name = "Rank API", description = "랭킹 조회 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/rank")
public class RankController {
    private final RankService rankService;

    @Operation(summary = "랭킹 조회", description = "랭킹 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "GET_RANK_SUCCESS - 랭킹 조회 성공"),
            @ApiResponse(responseCode = "400", description = "GET_RANK_FAIL - 랭킹 조회 실패")
    })
    @GetMapping("/read")
    public ResponseEntity<ResponseForm> readContent() {

        final RankListResponse rankListResponse = rankService.getRank();

        return rankListResponse != null ?
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_SUCCESS,rankListResponse)) :
                ResponseEntity.ok(ResponseForm.of(ResponseCode.GET_RANK_FAIL));
    }
}
