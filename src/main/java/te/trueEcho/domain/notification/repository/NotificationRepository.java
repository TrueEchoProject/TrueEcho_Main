package te.trueEcho.domain.notification.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import te.trueEcho.domain.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import te.trueEcho.domain.user.entity.User;
import java.time.LocalDate;


public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true " +
            "ELSE false END " +
            "FROM NotificationEntity n " +
            "WHERE n.receiver = :user AND " +
            "n.data.notiType = :notiType AND " +
            " DATE(n.createdAt) = :today")
    boolean existsNotificationWithNotiTypeZero(@Param("user") User user, @Param("notiType") int notiType, @Param("today") LocalDate today);
}
