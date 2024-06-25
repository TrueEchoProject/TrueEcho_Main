package te.trueEcho.domain.setting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import te.trueEcho.domain.setting.entity.NotificationSetting;

@Repository
public interface SettingJpaRepository extends JpaRepository<NotificationSetting, Long>{
}
