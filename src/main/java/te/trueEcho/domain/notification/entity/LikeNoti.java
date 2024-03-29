package te.trueEcho.domain.notification.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.NoArgsConstructor;
import te.trueEcho.domain.post.entity.Like;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("like_notis")
public class LikeNoti extends Notification {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "like_id")
    private Like like;

    @Builder
    public LikeNoti(Like like) {
        this.like = like;
    }
}
