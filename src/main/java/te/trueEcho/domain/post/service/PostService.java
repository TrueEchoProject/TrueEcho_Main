package te.trueEcho.domain.post.service;


import org.springframework.stereotype.Service;
import te.trueEcho.domain.post.dto.PostGetDto;
import te.trueEcho.domain.post.dto.PostListDto;


public interface PostService {

    PostListDto getPost(PostGetDto postGetDto);
}
