package te.trueEcho.domain.user.repository;

import te.trueEcho.domain.user.entity.User;

import java.util.List;

public interface UserRepository {

    void save(User user); // CREATE

    Long updateUser(User user); //UPDATE

    User findUserById(Long id); //READ

    List<User> findAll(); //READ

    void deleteUserById(Long id) throws Exception; //DELETE

    boolean checkDuplication(String email); //READ

    String getPasswordByEmail(String email);
}
