package te.trueEcho.domain.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import te.trueEcho.domain.notification.entity.NotificationEntity;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
}
