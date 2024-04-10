//package te.trueEcho.domain.post.entity;
//
//import jakarta.persistence.*;
//import lombok.AccessLevel;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//
//@Getter
//@Entity
//@NoArgsConstructor(access = AccessLevel.PROTECTED)
//@Table(name = "under_comments", uniqueConstraints = {
//        @UniqueConstraint(
//                name = "prevent_duplicated_under_comments",
//                columnNames = {"sub_comment_id"}
//        )
//})
//public class UnderComment {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "under_comments_id")
//    private Long id;
//
//
//
//    public UnderComment(Comment mainComment, Comment subComment) {
//        this.mainComment = mainComment;
//        this.subComment = subComment;
//    }
//}
