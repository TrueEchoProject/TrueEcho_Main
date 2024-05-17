package te.trueEcho.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import te.trueEcho.domain.post.converter.CommentToDto;
import te.trueEcho.domain.post.converter.PostToDto;
import te.trueEcho.domain.rank.converter.RankToDto;
import te.trueEcho.domain.setting.converter.PinListToDto;
import te.trueEcho.domain.setting.converter.PostListToDto;
import te.trueEcho.domain.user.converter.SignUpDtoToUser;
import te.trueEcho.domain.vote.converter.VoteToDto;
import te.trueEcho.domain.vote.converter.VoteUserToDto;

@Configuration
public class UtilConfig {
    @Bean
    public SignUpDtoToUser signUpDtoToUserConverter() {return new SignUpDtoToUser();   }

    @Bean
    public VoteToDto voteToDtoConverter() {
        return new VoteToDto();
    }

    @Bean
    public VoteUserToDto voteUserToDto() {   return new VoteUserToDto();
    }

    @Bean
    public PostToDto postToDtoConverter() {
        return new PostToDto();
    }

    @Bean
    public CommentToDto commentToDtoConverter() {
        return new CommentToDto();
    }

    @Bean
    public RankToDto rankToDtoConverter() {
        return new RankToDto();
    }

    @Bean
    public PinListToDto pinListToDtoConverter() {
        return new PinListToDto();
    }

    @Bean
    public PostListToDto postListToDtoConverter() {
        return new PostListToDto();
    }
}
