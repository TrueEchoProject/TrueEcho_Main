package te.trueEcho.domain.post.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Builder
public class AddPostRequest {
    private FeedType feedType;
    private MultipartFile postFront;
    private MultipartFile postBack;
    private String title;
    private int postStatus;
}



