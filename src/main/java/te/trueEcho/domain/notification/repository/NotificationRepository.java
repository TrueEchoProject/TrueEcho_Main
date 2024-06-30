package te.trueEcho.domain.notification.repository;

import org.hibernate.annotations.BatchSize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.notification.dto.NotiType;
import te.trueEcho.domain.notification.entity.NotificationEntity;
import te.trueEcho.domain.user.entity.User;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true " +
            "ELSE false END " +
            "FROM NotificationEntity n " +
            "WHERE n.receiver = :user AND " +
            "n.data.notiType = :notiType AND " +
            " DATE(n.createdAt) = :today")
    boolean existsNotificationWithNotiTypeZero(@Param("user") User user, @Param("notiType") int notiType, @Param("today") LocalDate today);

//    @Query("SELECT n FROM NotificationEntity n WHERE n.receiver = :receiver AND n.data.notiType IN :list")
//    List<NotificationEntity> findByReceiverAndNotiTypeIn(@Param("receiver") User receiver, @Param("list") List<Integer> list);

    @Query("SELECT n FROM NotificationEntity n WHERE n.receiver = :receiver AND n.data.notiType IN :notiTypes")
    Page<NotificationEntity> findByReceiverAndData_NotiTypeIn(User receiver, List<Integer> notiTypes, Pageable pageable);
}