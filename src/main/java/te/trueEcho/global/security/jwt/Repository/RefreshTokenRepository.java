package te.trueEcho.global.security.jwt.Repository;


import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.entity.User;

@Repository
@Slf4j
@RequiredArgsConstructor
public class RefreshTokenRepository {

    private final EntityManager em;
   public String findTokenByUser(User user){
       User foundUser = em.find(User.class, user.getId());
       log.info("getRefreshToken = {}",foundUser.getRefreshToken());
       return foundUser.getRefreshToken();
    }
    @Transactional
    public void saveTokenByEmail(String refreshToken, String email){
       log.info("refreshToken ={}",refreshToken);
       em.createQuery("update User u set u.refreshToken=:refreshToken where u.email =:email")
               .setParameter("email",email)
               .setParameter("refreshToken",refreshToken)
                       .executeUpdate();
       em.flush();
       em.clear();
    }
    @Transactional
   public void deleteTokenByUser(User user){
        saveTokenByEmail(null, user.getEmail());
   }

   public String findTokenByToken(String refreshToken){
       try {
          return (String) em.createQuery("select u.refreshToken from User u where u.refreshToken =: refreshToken")
                   .setParameter("refreshToken", refreshToken)
                   .getSingleResult();
       }catch (NoResultException e){
           return null;
       }

   }




}