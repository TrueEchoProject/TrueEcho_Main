package te.trueEcho.domain.setting.repository;


import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.post.entity.Pin;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.user.entity.Block;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.entity.User;
import java.util.List;

@Slf4j
@Repository
@RequiredArgsConstructor
public class SettingRepositoryImpl implements SettingRepository{
    private final EntityManager em;


    @Override
    public List<Post> getMontlyPosts(int month, User user) {
        log.info("getMontlyPosts called month {}: ",month);
        try{
            return em.createQuery("select p from Post p " +
                            "where p.user =:user and month(p.createdAt) = :month", Post.class)
                    .setParameter("user", user)
                    .setParameter("month", month)
                    .getResultList();

        }catch(Exception e){
            log.error("getMontlyPosts error : {}", e.getMessage());
        }

        return List.of();
    }

    @Override
    public List<Pin> getMyPins(User user) {
        try {
            return em.createQuery("select p from Pin p where p.user =:user", Pin.class)
                    .setParameter("user", user)
                    .getResultList();
        } catch (Exception e) {
            log.error("getMyPins error : {}", e.getMessage());
        }
        return List.of();
    }

    @Override
    public boolean editMyPins() {
        return false;
    }



    @Override
    public boolean deleteMyPins() {
        return false;
    }

    @Override
    public String getMostVotedTitle(User user) {
        try {
              return  em.createQuery(
                            "SELECT v.title " +
                                    "FROM VoteResult vr " +
                                    "JOIN FETCH vr.vote v " +
                                    "WHERE vr.userTarget = :user " +
                                    "GROUP BY v.title " +
                                    "ORDER BY COUNT(vr) DESC, vr.createdAt DESC",
                            String.class)
                    .setParameter("user", user)
                    .setMaxResults(1)
                    .getSingleResult();
        } catch (Exception e) {
            log.error("getMostVotedTitle error : {}", e.getMessage());
            return null;
        }
    }

    @Override
    public List<Block> getBlockedUserList(User user) {
        try {
            return em.createQuery("select b from Block b join fetch User u " +
                            "where b.user =:user ", Block.class)
                    .setParameter("user", user)
                    .getResultList();
        } catch (Exception e) {
            log.error("getBlockedUserList error : {}", e.getMessage());
            return null;
        }

    }
}
