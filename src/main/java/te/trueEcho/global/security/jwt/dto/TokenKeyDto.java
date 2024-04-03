package te.trueEcho.global.security.jwt.dto;

import lombok.Builder;
import lombok.Getter;

import java.security.Key;


@Builder
@Getter
public class TokenKeyDto {
    long validityInMilliseconds;
    Key key;
}
