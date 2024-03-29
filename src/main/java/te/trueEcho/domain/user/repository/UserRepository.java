package te.trueEcho.domain.user.repository;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.Getter;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.user.entity.User;

import java.util.ArrayList;
import java.util.List;

public interface UserRepository {

    User findUserById(Long id);

    String findCheckCodeByEmail(String email);

    Long addUser(User user);

    void deleteUserById(Long id);

    boolean checkDuplication(String email);

    Long updateUser(User user);

    void saveCheckCode(String email, String checkCode);
}
