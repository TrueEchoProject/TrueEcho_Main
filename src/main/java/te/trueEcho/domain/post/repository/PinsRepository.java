package te.trueEcho.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import te.trueEcho.domain.post.entity.Pin;


public interface PinsRepository  extends JpaRepository<Pin, Long> {
}
