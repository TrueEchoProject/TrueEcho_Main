package te.trueEcho.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "suspended_users")
public class SuspendedUser {

    @Id
    @Column(name = "suspendedUser_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "suspended_date")
    private LocalDate suspendDate;

    @Builder
    public SuspendedUser(User user, LocalDate suspendDate) {
        this.user = user;
        this.suspendDate = suspendDate;
    }
}
