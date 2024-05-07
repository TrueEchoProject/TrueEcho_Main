package te.trueEcho.domain.setting.repository;


import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

@Slf4j
@Repository
@RequiredArgsConstructor
public class SettingRepositoryImpl implements SettingRepository{
    private final EntityManager em;
}
