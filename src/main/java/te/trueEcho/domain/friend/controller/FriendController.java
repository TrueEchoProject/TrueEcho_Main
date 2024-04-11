package te.trueEcho.domain.friend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import te.trueEcho.domain.friend.service.FriendService;
import te.trueEcho.global.response.ResponseForm;

import static te.trueEcho.global.response.ResponseCode.*;

@Slf4j
@Validated
@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/add")
        public ResponseEntity<ResponseForm> addFriend(@RequestParam Long targetUserId){ {

            boolean isAdded = friendService.addFriend(targetUserId);
            return isAdded ?
                    ResponseEntity.ok(ResponseForm.of(ADD_FRIEND_SUCCESS)) :
                    ResponseEntity.ok(ResponseForm.of(ADD_FRIEND_FAIL));
        }
    }
}


