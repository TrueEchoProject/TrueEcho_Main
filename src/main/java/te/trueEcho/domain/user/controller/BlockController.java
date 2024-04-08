//package te.trueEcho.domain.user.controller;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.validation.annotation.Validated;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequiredArgsConstructor
//@Validated
//public class BlockController {
//
//    private final BlockService blockService;
//
//    @ApiOperation(value = "차단")
//    @PostMapping("/{blockMemberUsername}/block")
//    @ApiImplicitParam(name = "blockMemberUsername", value = "차단할 계정의 username", required = true, example = "dlwlrma")
//    public ResponseEntity<ResultResponse> block(@PathVariable("blockMemberUsername") String blockMemberUsername) {
//        final boolean success = blockService.block(blockMemberUsername);
//
//        return ResponseEntity.ok(ResultResponse.of(BLOCK_SUCCESS, success));
//    }
//
//    @ApiOperation(value = "차단해제")
//    @DeleteMapping("/{blockMemberUsername}/block")
//    @ApiImplicitParam(name = "blockMemberUsername", value = "차단해제할 계정의 username", required = true, example = "dlwlrma")
//    public ResponseEntity<ResultResponse> unblock(@PathVariable("blockMemberUsername") String blockMemberUsername) {
//        final boolean success = blockService.unblock(blockMemberUsername);
//
//        return ResponseEntity.ok(ResultResponse.of(UNBLOCK_SUCCESS, success));
//    }
//
//}@RestController
//@RequiredArgsConstructor
//@Validated
//public class BlockController {
//
//    private final BlockService blockService;
//
//    @ApiOperation(value = "차단")
//    @PostMapping("/{blockMemberUsername}/block")
//    @ApiImplicitParam(name = "blockMemberUsername", value = "차단할 계정의 username", required = true, example = "dlwlrma")
//    public ResponseEntity<ResultResponse> block(@PathVariable("blockMemberUsername") String blockMemberUsername) {
//        final boolean success = blockService.block(blockMemberUsername);
//
//        return ResponseEntity.ok(ResultResponse.of(BLOCK_SUCCESS, success));
//    }
//
//    @ApiOperation(value = "차단해제")
//    @DeleteMapping("/{blockMemberUsername}/block")
//    @ApiImplicitParam(name = "blockMemberUsername", value = "차단해제할 계정의 username", required = true, example = "dlwlrma")
//    public ResponseEntity<ResultResponse> unblock(@PathVariable("blockMemberUsername") String blockMemberUsername) {
//        final boolean success = blockService.unblock(blockMemberUsername);
//
//        return ResponseEntity.ok(ResultResponse.of(UNBLOCK_SUCCESS, success));
//    }
//
//}
