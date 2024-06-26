package te.trueEcho.domain.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.notification.entity.NotificationEntity;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Like;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.rank.entity.Rank;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;
import te.trueEcho.domain.setting.entity.NotificationSetting;
import te.trueEcho.domain.vote.entity.VoteResult;
import te.trueEcho.global.entity.CreatedDateAudit;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "users")
public class User extends CreatedDateAudit {

    /**
     *    entity : jun10920
     *    * @param : NONE
     *    ! 설명 및 주의사항
     *    TODO: updateLocation 로직 구상해서 추후에 수정
     *    last edit: 24.04.05

     */

    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name= "user_role", nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "user_email", nullable = false, unique = true)
    @Email
    private String email; // 가입시 사용하는 ID

    @Column(name = "user_name",  length = 20, unique = false)
    private String name;

    @Column(name = "user_nick_name", nullable = false, length = 20, unique = true)
    private String nickname; // user 구분하는 식별자

    @Enumerated(EnumType.STRING)
    @Column(name = "user_gender", nullable = true)
    private Gender gender;

    @Column(name = "connect_by_friend", nullable = true)
    private Boolean connectByFriend; //친구의 친구에게 내 계정 노출

    @Column(name = "user_birthday", nullable = true)
    private LocalDate birthday;

    @Column(name = "user_location", nullable = true)
    private String location;

    @Column(name = "user_coordinate", nullable = true)
    @Embedded
    private Coordinate coordinate;

    @Lob
    @Column(name = "user_profile_url", nullable = true, columnDefinition = "TEXT")
    private String profileURL;

    @Column(name = "user_password")
    private String password;

    @Column(name = "refresh_token", nullable = true)
    private String refreshToken;

    @Column(name = "fcm_token", nullable = true)
    private String fcmToken;

    @OneToMany(mappedBy = "sendUser", cascade = CascadeType.ALL)
    private List<Friend> friend = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Block> blockedUsers = new ArrayList<>();

//    @OneToOne(mappedBy = "user",  cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private SuspendedUser suspendedUser;

    @ManyToOne(fetch = FetchType.LAZY , cascade=CascadeType.ALL)
    @JoinColumn(name = "rank_id")
    private Rank rank; // TODO: Rank 연관관계 확인 필요.

    @OneToMany(mappedBy = "userVoter", cascade=CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VoteResult> voteResults;

    @OneToMany(mappedBy = "userTarget", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VoteResult> targetResults;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade=CascadeType.ALL)
    private List<Post> posts;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade=CascadeType.ALL)
    private List<Like> likes;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY , cascade=CascadeType.ALL)
    private List<Comment> comments;

    @OneToOne(fetch = FetchType.LAZY,  cascade=CascadeType.ALL)
    @JoinColumn(name = "notification_setting_id", nullable = false)
    private NotificationSetting notificationSetting;


    @OneToMany(mappedBy = "receiver", fetch = FetchType.LAZY , orphanRemoval = true)
    private List<NotificationEntity> notificationEntity = new ArrayList<>();

    @Builder
    public User( String email,
                 String nickname,
                 String name,
                 Gender gender,
                 LocalDate birthday,
                 NotiTimeStatus notificationTimeStatus,
                 String location,
                 Coordinate coordinate,
                 String password,
                 Role role,
                 NotificationEntity notificationEntity) {
        this.email = email;
        this.nickname = nickname;
        this.gender = gender;
        this.birthday = birthday;
        this.location = location;
        this.coordinate= coordinate;
        this.password = password;
        this.role = role;
        this.name = name;

        // 자동 초기화 : 디폴트
        this.connectByFriend = true;
      
        // NotificationSetting 엔티티 생성 및 설정
        this.notificationSetting =
                NotificationSetting.builder()
                        .notificationTimeStatus(notificationTimeStatus)
                        .build();
    }

    public int getAge(){
        return LocalDate.now().getYear() - this.birthday.getYear();
    }


    public void setEncryptedPassword(String encryptedPassword) {
        this.password = encryptedPassword;

    }

    public void setFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updateNickName(String nickname) {
        this.nickname = nickname;
    }


    public void updatePassword(String password) {
        this.password = password;
    }

    public void updateGender(Gender gender) {
        this.gender = gender;
    }


    public void updateBirthDay(LocalDate birthday) {
        this.birthday = birthday;
    }

    public void updateProfileUrl(String profileURL) {
        this.profileURL = profileURL;
    }

    public void updateLocation(double x, double y, String location) {
        this.coordinate = new Coordinate(x, y);
        this.location = location;
    }

    // public void removeSuspendedUser() {this.suspendedUser = null;}

    public LocalDateTime getNotiTime() {
        return this.notificationSetting.getNotificationTime();
    }
}
