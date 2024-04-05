package te.trueEcho.domain.user.repository;


import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.user.entity.User;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserRepository {
    private final EntityManager em;
    public List<User> filterSelectedUserByLocation(String location, List<User> selectedUsers ){
      return  em.createQuery("select u from User u where u.id not in : selectedUsers and u.location =:location", User.class)
                .setParameter("selectedUsers",selectedUsers)
                .setParameter("location",location)
                .getResultList();
    }
}
