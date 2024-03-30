package te.trueEcho.global.security.jwt.Repository;


import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.global.security.jwt.entity.RefreshToken;

import java.util.Objects;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RefreshTokenRepository {

    private final EntityManager em;
   public RefreshToken findByUser(User user){
      return (RefreshToken) em.createQuery("select t from RefreshToken t where t.user =: user")
                .setParameter("user", user)
                .getSingleResult();
    }

    public void save(RefreshToken refreshToken){
       em.persist(refreshToken);
    }

   public void deleteByUser(User user ){
        em.remove(user);
   }

   public boolean existsByUser(User user){
     User foundUser =  em.find(User.class, user);
     return foundUser!=null;
   }

   public boolean existsByToken(String refreshToken){
    Object result = em.createQuery("select t from RefreshToken t where t.refreshToken =: refreshToken")
               .setParameter("refreshToken", refreshToken)
               .getSingleResult();
    return result==null;
   }




}