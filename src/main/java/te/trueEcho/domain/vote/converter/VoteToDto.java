package te.trueEcho.domain.vote.converter;

import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;
import te.trueEcho.domain.vote.dto.VoteContentsResponse;
import te.trueEcho.domain.vote.dto.VoteResponse;
import te.trueEcho.domain.vote.entity.Vote;

import java.util.List;

@Component
@NoArgsConstructor
public class VoteToDto {

    public  VoteContentsResponse converter(List<Vote> contentList){
        List<VoteResponse> titleList = contentList.stream().map(
                content -> VoteResponse.builder()
                            .id(content.getId())
                            .title(content.getTitle())
                            .build()
        ).toList();
        return VoteContentsResponse.builder().contentsSize(titleList.size()).contentList(titleList).build();
    }
}

