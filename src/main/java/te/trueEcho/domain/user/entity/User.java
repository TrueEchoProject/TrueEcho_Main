package te.trueEcho.domain.user.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import lombok.NoArgsConstructor;
@Getter
@Builder
@AllArgsConstructor
public  class User {

    private final Long id;
    private final String username;
    private final String password;
    private final String email;
    private final String code;
    private final int gender;
    private final  String dob;
    private final int notificationTime;
    private final String location;
    private final String role;
}