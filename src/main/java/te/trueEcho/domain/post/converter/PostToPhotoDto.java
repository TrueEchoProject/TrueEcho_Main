package te.trueEcho.domain.post.converter;

import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.vote.dto.PhotoResponse;

public class PostToPhotoDto {

    public static PhotoResponse converter(Post post){
        return PhotoResponse.builder()
                .photoBackUrl(post.getUrlBack())
                .photoFrontUrl(post.getUrlFront())
                .build();
    }
}
