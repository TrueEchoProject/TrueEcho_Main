package te.trueEcho.global.security.jwt.Repository;


import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import te.trueEcho.domain.user.entity.User;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@Slf4j
@RequiredArgsConstructor
public class RefreshTokenRepository {

    private static final ConcurrentHashMap<String, String> invalidTokenMap = new ConcurrentHashMap<>();

    private final EntityManager em;


    public boolean isInvalidToken(String key){
        return invalidTokenMap.containsKey(key);
    }

    public void addInvalidToken(String accessToken, String key){
        invalidTokenMap.put(key, accessToken);
    }

    public void removeInvalidToken(String key){
        invalidTokenMap.remove(key);
    }

    public String findTokenByUser(User user){
       log.info("getRefreshToken = {}",user.getRefreshToken());
       return user.getRefreshToken();
    }

    @Transactional
    public boolean updateTokenByEmail(String refreshToken, String email){
       log.info("refreshToken ={}",refreshToken);
        try {
            em.createQuery("update User u set u.refreshToken=:refreshToken where u.email =:email")
                    .setParameter("email", email)
                    .setParameter("refreshToken", refreshToken)
                    .executeUpdate();
            em.flush();
            return true;
        }catch (Exception e){
            log.error("saveTokenByEmail error ={}",e.getMessage());
            return false;
        }
    }

    @Transactional
    public boolean deleteTokenByEmail(String email){
      return updateTokenByEmail(null, email);
    }

   public String findTokenByToken(String refreshToken){
       try {
            return (String) em.createQuery("select u.refreshToken from User u " +
                            "where u.refreshToken =: refreshToken")
                   .setParameter("refreshToken", refreshToken)
                   .getSingleResult();
       }catch (NoResultException e){
           return null;
       }

   }




}