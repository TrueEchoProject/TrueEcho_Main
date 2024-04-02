package te.trueEcho.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.post.entity.Comment;
import te.trueEcho.domain.post.entity.Like;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.rank.entity.Rank;
import te.trueEcho.domain.vote.entity.VoteResult;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "users")
public class User {
    /**
     *    entity : jun10920
     *    * @param : NONE
     *    ! 설명 및 주의사항
     *    User는 builder 추후에 생성 - enum 타입이나 아직 토의할 부분이 필요해보임
     *
     *    TODO: token 엔티티 토의
     *    last edit: 04.03.26
     */

    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name= "user_role", nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "user_email", nullable = false, unique = true)
    private String email;

    @Column(name = "user_name", nullable = false, length = 20, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "connect_by_friend")
    private boolean connectByFriend; //친구의 친구에게 내 계정 노출

    @Column(name = "connect_by_phone")
    private boolean connectByPhone; //전화번호로 내 계정 노출

    @Column(name = "user_noti_time")
    private NotiTimeStatus notificationTime;

    @CreatedDate
    @Column(name = "user_created_date")
    private LocalDateTime createdDate;

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



    @Builder
    public User( String email,
                 String name,
                 Gender gender,
                 NotiTimeStatus notificationTime,
                 boolean notificationSetting,
                 LocalDate birthday,
                 String location,
                 String password,
                 Role role) {
        this.email = email;
        this.name = name;
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

    public void setRefreshToken(String refreshToken){
        this.refreshToken=refreshToken;
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
