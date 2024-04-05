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
    private Gender gender;

    @Column(name = "connect_by_friend")
    private boolean connectByFriend; //친구의 친구에게 내 계정 노출

    @Column(name = "user_noti_time")
    @Enumerated(EnumType.STRING)
    private NotiTimeStatus notificationTime;

    @Column(name = "user_noti_setting")
    private boolean notificationSetting;

    @Column(name = "user_birthday")
    private LocalDate birthday;

    @Column(name = "user_location")
    private String location;

    @Column(name = "user_profile_url")
    private String profileURL;

    @Column(name = "user_password", nullable = false)
    private String password;

    @Column(name = "refresh_token", nullable = true)
    private String refreshToken;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Friend> friend;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Block> block;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SuspendedUser suspendedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rank_id")
    private Rank rank;

    @OneToMany(mappedBy = "userVoter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VoteResult> voteResults;

    @OneToMany(mappedBy = "userTarget", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VoteResult> targetResults;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post> posts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Like> likes;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private NotiTimeQ notiTimeQ;

    @Builder
    public User( String email,
                 String nickname,
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
        // 자동 초기화
        this.connectByFriend = true;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updateEmail(String email) {
        this.email = email;
    }


    public void updateGender(Gender gender) {
        this.gender = gender;
    }
    public void setEncryptedPassword(String encryptedPassword) {
        this.password = encryptedPassword;
    }



}
