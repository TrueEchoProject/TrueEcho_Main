package te.trueEcho.domain.notification.repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import te.trueEcho.domain.notification.entity.NotificationEntity;
import te.trueEcho.domain.user.entity.User;

import java.time.LocalDate;
import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true " +
            "ELSE false END " +
            "FROM NotificationEntity n " +
            "WHERE n.receiver = :user AND " +
            "n.data.notiType = :notiType AND " +
            " DATE(n.createdAt) = :today")
    boolean existsNotificationWithNotiTypeZero(@Param("user") User user, @Param("notiType") int notiType, @Param("today") LocalDate today);

    @Query("SELECT n FROM NotificationEntity n WHERE n.receiver = :receiver AND n.data.notiType IN :list")
    List<NotificationEntity> findByReceiverAndNotiTypeIn(@Param("receiver") User receiver, @Param("list") List<Integer> list);

    List<NotificationEntity> findByReceiverAndNotiTypeIn(User receiver, List<Integer> notiTypes, Sort sort);
}