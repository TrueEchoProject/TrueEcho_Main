package te.trueEcho.domain.user.repository;


import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.entity.User;

import java.util.List;

@Repository
@Slf4j
@RequiredArgsConstructor
public class UserRepository {
    private final EntityManager em;

    @Transactional
    public List<User> filterSelectedUserByLocation(String location, List<User> selectedUsers ){
      return  em.createQuery("select u from User u where u  in : selectedUsers and u.location like :location", User.class)
                .setParameter("selectedUsers",selectedUsers)
                .setParameter("location",location)
                .getResultList();
    }

    @Transactional
    public List<User> filterNotSelectedUserByLocation(String location, List<User> selectedUsers ){
        try {
            return em.createQuery("select u from User u where (u not in : selectedUsers) " +
                            "and u.location like :location", User.class)
                    .setParameter("selectedUsers", selectedUsers)
                    .setParameter("location", location)
                    .getResultList();
        }catch (Exception e){
            log.info("query exception = {}", e);
            return null;
        }
    }

}
