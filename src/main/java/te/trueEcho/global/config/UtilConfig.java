package te.trueEcho.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import te.trueEcho.domain.post.converter.CommentToDto;
import te.trueEcho.domain.post.converter.DtoToComment;
import te.trueEcho.domain.post.converter.PostToDto;
import te.trueEcho.domain.rank.converter.RankToDto;
import te.trueEcho.domain.setting.converter.NotificationSettingToDto;
import te.trueEcho.domain.setting.converter.PinListToDto;
import te.trueEcho.domain.setting.converter.PostListToDto;
import te.trueEcho.domain.setting.converter.UserPinToDto;
import te.trueEcho.domain.user.converter.SignUpDtoToUser;
import te.trueEcho.domain.vote.converter.VoteToDto;
import te.trueEcho.domain.vote.converter.VoteUserToDto;

@Configuration
public class UtilConfig {
    @Bean
    public SignUpDtoToUser signUpDtoToUserConverter() {return new SignUpDtoToUser();   }

    @Bean
    public VoteToDto voteToDto() {
        return new VoteToDto();
    }

    @Bean
    public VoteUserToDto voteUserToDto() {   return new VoteUserToDto();
    }

    @Bean
    public PostToDto postToDto() {
        return new PostToDto();
    }

    @Bean
    public CommentToDto commentToDto() {
        return new CommentToDto();
    }

    @Bean
    public RankToDto rankToDto() {
        return new RankToDto();
    }

    @Bean
    public PinListToDto pinListToDto() {
        return new PinListToDto();
    }

    @Bean
    public PostListToDto postListToDto() {
        return new PostListToDto();
    }

    @Bean
    public NotificationSettingToDto notificationSettingToDtoConverter() {
        return new NotificationSettingToDto();
    }
    @Bean
    public UserPinToDto userPinToDto() {
        return new UserPinToDto();
    }

    @Bean
    public DtoToComment dtoToComment() {
        return new DtoToComment();
    }
}
