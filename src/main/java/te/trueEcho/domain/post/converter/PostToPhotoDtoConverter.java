package te.trueEcho.domain.post.converter;

import te.trueEcho.domain.post.dto.PostListResponse;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.vote.dto.PhotoResponse;

import java.util.List;

public class PostToPhotoDtoConverter {

    public static PhotoResponse converter(Post post){
        return PhotoResponse.builder()
                .photoBackUrl(post.getUrlBack())
                .photoFrontUrl(post.getUrlFront())
                .build();
    }
}
