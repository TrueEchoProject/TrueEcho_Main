package te.trueEcho.domain.user.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.entity.User;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserAuthRepositoryImpl implements UserAuthRepository {

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
       try {
           return em.find(User.class, id);
       }catch (NoResultException e){
           return null;
       }
    }

    @Override
    public User findUserByEmail(String email) {
        try {
            return em.createQuery(
                            "select distinct u from User u " +
                                    "left join fetch u.suspendedUser " +
                                    "left join fetch u.notiTimeQ " +
                                    "where u.email = :email", User.class)
                    .setParameter("email", email)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    @Override
    public User findUserByNickName(String nickName) {
        try {
            return
                    em.createQuery("select u from User u where u.nickname=: nickName", User.class)
                            .setParameter("nickName", nickName)
                            .getSingleResult();
        }catch (NoResultException e){
            return null;
        }
    }


    public List<User> findAll() {
        return em.createQuery("select u from User u", User.class)
                .getResultList();
    }

    @Override
    public void deleteUserById(Long id) throws Exception {

    }

    @Transactional
    @Override
    public void updateUser(User user) {
        User existUser = em.find(User.class, user.getId());
        if (existUser == null) {
            throw new RuntimeException("User not found with id: " + user.getId());
        }
        // existUser 객체의 각 필드를 업데이트합니다.
        existUser.updateName(user.getName());
        existUser.setEncryptedPassword(user.getPassword());
        existUser.updateGender(user.getGender());
        existUser.updateNotificationTime(user.getNotificationTime());
        existUser.updateNotificationSetting(user.getNotificationSetting());
        existUser.updateBirthDay(user.getBirthday());
        existUser.updateLocation(user.getLocation());

    }


    @Override
    public   String getPasswordByEmail(String email){
       try {
           return (String) em.createQuery("select u.password from User u where email =: email")
                   .setParameter("email", email).getSingleResult();
       }catch(NoResultException e){
           return null;
       }
    }


}