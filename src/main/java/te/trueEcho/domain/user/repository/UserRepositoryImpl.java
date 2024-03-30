package te.trueEcho.domain.user.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.entity.User;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository{

    private final EntityManager em;

    public void save(User user) {
        if (user.getId() == null) {
            em.persist(user);
        } else {
            em.merge(user);
        }
    }
    @Override
    public User findUserById(Long id) {
        return em.find(User.class, id);
    }

    @Override
    public User findUserByEmail(String email) {
        return em.createQuery("select u from User u where u.email=: email" , User.class)
                .setParameter("email", email)
                .getSingleResult();
    }

    public List<User> findAll() {
        return em.createQuery("select u from User u", User.class)
                .getResultList();
    }

    @Transactional
    @Override
    public Long updateUser(User user) {
        User existUser = em.find(User.class, user.getId());
        if(existUser==null)
            return null;
    // 다른 필드도 추가해야됨.
        existUser.setEncryptedPassword(user.getPassword());
        return existUser.getId();
    }

    @Override
    @Transactional
    public void deleteUserById(Long id) throws Exception {
        User userToDelete = em.find(User.class, id);
        if (userToDelete != null) {
            em.remove(userToDelete);
        } else {
            // 삭제할 사용자가 없는 경우에 대한 처리
            throw new Exception("User with id " + id + " not found");
        }
    }

    @Override
    public boolean checkDuplication(String email) {
        List<User> user = em.createQuery("select u from User u where u.email = :email", User.class)
                .setParameter("email", email)
                .getResultList();
        return !user.isEmpty(); // 현재 email로 조회되지 않을때 중복x
    }

    @Override
    public   String getPasswordByEmail(String email){
        return (String) em.createQuery("select u.email from User u where email =: email")
                .setParameter("email", email).getSingleResult();

    }

}
