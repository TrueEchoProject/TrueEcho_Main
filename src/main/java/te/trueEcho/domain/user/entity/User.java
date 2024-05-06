package te.trueEcho.domain.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.notification.entity.NotiTimeQ;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Like;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.rank.entity.Rank;
import te.trueEcho.domain.vote.entity.VoteResult;
import te.trueEcho.global.entity.CreatedDateAudit;

import java.time.LocalDate;
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

    @Column(name = "user_noti_time", nullable = true)
    @Enumerated(EnumType.STRING)
    private NotiTimeStatus notificationTime;

    @Column(name = "user_noti_setting", nullable = true)
    private Boolean notificationSetting;

    @Column(name = "user_birthday", nullable = true)
    private LocalDate birthday;

    @Column(name = "user_location", nullable = true)
    private String location;

    @Lob
    @Column(name = "user_profile_url", nullable = true)
    private String profileURL;

    @Column(name = "user_password")
    private String password;

    @Column(name = "refresh_token", nullable = true)
    private String refreshToken;

    @OneToMany(mappedBy = "sendUser", cascade = CascadeType.ALL)
    private List<Friend> friend;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Block> block;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SuspendedUser suspendedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rank_id")
    private Rank rank;

    @OneToMany(mappedBy = "userVoter", fetch = FetchType.LAZY)
    private List<VoteResult> voteResults;

    @OneToMany(mappedBy = "userTarget", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VoteResult> targetResults;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Post> posts;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Like> likes;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Comment> comments;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private NotiTimeQ notiTimeQ;

    @Builder
    public User( String email,
                 String nickname,
                 String name,
                 Gender gender,
                 NotiTimeStatus notificationTime,
                 boolean notificationSetting,
                 LocalDate birthday,
                 String location,
                 String password,
                 Role role) {
        this.email = email;
        this.nickname = nickname;
        this.gender = gender;
        this.notificationSetting = notificationSetting;
        this.notificationTime = notificationTime;
        this.birthday = birthday;
        this.location = location;
        this.password = password;
        this.role = role;
        this.name = name;
        // 자동 초기화
        this.connectByFriend = true;
    }

    public int getAge(){
        return LocalDate.now().getYear() - this.birthday.getYear();
    }

    public boolean getNotificationSetting() {
        return this.notificationSetting;
    }

    public void setEncryptedPassword(String encryptedPassword) {
        this.password = encryptedPassword;

    }

    public void updateName(String name) {
        this.name = name;
    }


    public void updatePassword(String updatepassword) {
        this.password = password;
    }

    public void updateGender(Gender gender) {
        this.gender = gender;
    }

    public void updateNotificationTime(NotiTimeStatus notificationTime) {
        this.notificationTime = notificationTime;
    }

    public void updateNotificationSetting(boolean notificationSetting) {
        this.notificationSetting = notificationSetting;
    }

    public void updateBirthDay(LocalDate birthday) {
        this.birthday = birthday;
    }

    public void updateLocation(String location) {
        // 위치 갱신하는 로직을 새로 작성
        this.location = location;
    }

    public void removeSuspendedUser() {
        this.suspendedUser = null;
    }

}
