//package te.trueEcho.domain.notification.entity.before;
//
//import jakarta.persistence.*;
//import lombok.AccessLevel;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//import te.trueEcho.domain.user.entity.NotiTimeStatus;
//import te.trueEcho.domain.user.entity.User;
//
//@Entity
//@Getter
//@NoArgsConstructor(access = AccessLevel.PROTECTED)
//@Table(name = "noti_time_Q")
//public class RandomNoti {
//
//    @Id
//    @Column(name = "q_id")
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(name = "q_noti_time")
//    @Enumerated(EnumType.STRING)
//    private NotiTimeStatus notificationTime;
//
//    @OneToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id")
//    private User user;
//}
