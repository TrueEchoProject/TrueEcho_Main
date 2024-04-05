package te.trueEcho.domain.user.repository;

import te.trueEcho.domain.user.entity.User;

import java.util.List;

public interface UserAuthRepository {

    void save(User user); // CREATE

    Long updateUser(User user); //UPDATE

    User findUserById(Long id); //READ

    User findUserByNickName(String nickName);

    User findUserByEmail(String email); //READ

    List<User> findAll(); //READ

    void deleteUserById(Long id) throws Exception; //DELETE


    String getPasswordByEmail(String email);

}
