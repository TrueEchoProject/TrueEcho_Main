package te.trueEcho.domain.user.repository;

import lombok.Getter;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.user.entity.User;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@Getter
public class UserMemoryRepositoryImpl implements UserRepository {

    private static final Map<Long, User> userMap = new HashMap<>(); //static
    private static final Map<String, String>checkCodeMap = new HashMap<>();
    private static long sequence = 0L; //static


    @Override
    public Long addUser(User user){
        userMap.put(sequence, user);
        return sequence++;
    }


    public String findCheckCodeByEmail(String email){
        return checkCodeMap.get(email);
    }
    @Override
    public User findUserById(Long id) {
        return userMap.get(id);
    }
    public List<User> findAll() {
        return new ArrayList<>(userMap.values());
    }

    @Override
    public void deleteUserById(Long id) {
        userMap.remove(id);

    }

    @Override
    public boolean checkDuplication(String email) {

    }

    @Override
    public Long updateUser(User user) {
         User updaetdUser = User.builder()
                 .id(user.getId())
                 .username(user.getUsername())
                 .password(user.getPassword())
                 .email(user.getEmail())
                 .code(user.getEmail())
                 .location(user.getLocation())
                 .notificationTime(user.getNotificationTime())
                 .build();

        deleteUserById(user.getId());
        userMap.putIfAbsent(user.getId(),updaetdUser);

        return user.getId();
    }

    @Override
    public void saveCheckCode(String email, String checkCode) {
        checkCodeMap.put(email,checkCode);
    }


    public void clearStore() {
        userMap.clear();
    }
}
