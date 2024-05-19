package te.trueEcho.domain.vote.service;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.repository.PostRepository;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.domain.user.repository.UserRepository;
import te.trueEcho.domain.vote.converter.VoteToDto;
import te.trueEcho.domain.vote.converter.VoteUserToDto;
import te.trueEcho.domain.vote.dto.PhotoResponse;
import te.trueEcho.domain.vote.dto.VoteContentsResponse;
import te.trueEcho.domain.vote.dto.VoteResultRequest;
import te.trueEcho.domain.vote.dto.VoteUsersResponse;
import te.trueEcho.domain.vote.entity.VoteResult;
import te.trueEcho.domain.vote.repository.VoteRepository;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.repository.VoteType;
import te.trueEcho.global.util.AuthUtil;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteServiceImpl implements VoteService {
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final UserAuthRepository userAuthRepository;
    private final AuthUtil authUtil;
    private final PostRepository postRepository;
    private final VoteUserToDto voteUserToDto;
    private final VoteToDto voteToDto;


    private VoteType pickVoteTypeByRandom() {
        VoteType[] values = VoteType.values();
        Random random = new Random();
        return values[random.nextInt(values.length)];
    }

    // TODO 투표지 요청하는 만큼 주기
    @Transactional
    @Override // 생성과 읽기를 동시에 실행하면 안됨.
    public VoteContentsResponse getVoteContents() {
        // 오늘자 투표내용 캐시되어 있으면 가져오기.
        VoteType votetype = pickVoteTypeByRandom();
        List<Vote> todayVoteList = voteRepository.getTodayVoteContentsByType(votetype, LocalDate.now());

        // 캐시 안되어 있으면 타입에 따라 오늘자꺼 만들기.
        if (todayVoteList==null) {
            voteRepository.createSelectedVoteContents();
            todayVoteList=   voteRepository.getTodayVoteContentsByType(votetype, LocalDate.now());
        }

        // 여전히 비어있으면 실패..
        if(todayVoteList == null || todayVoteList.isEmpty()) {
            return null;
        }

        return  voteToDto.coverter(todayVoteList);
    }

    @Override
    public VoteUsersResponse getVoteRandomUsers(int voteUserCount) {
        List<User> randomUsers =  userRepository.getRandomUsersWithLimit(voteUserCount);

        if(randomUsers == null || randomUsers.isEmpty()) {
            return null;
        }

        return voteUserToDto.converter(randomUsers);
    }

    @Override
    public boolean saveVoteResult(VoteResultRequest voteResultRequest) {
       User voter =   authUtil.getLoginUser();
       Vote selectedVote =  voteRepository.findVoteById(voteResultRequest.getVoteId());
       User targetUser = userAuthRepository.findUserById(voteResultRequest.getUserId());

       return voteRepository.saveVoteResult(
               VoteResult.builder()
                       .userTarget(targetUser)
                       .userVoter(voter)
                       .vote(selectedVote)
                       .build()
       );
    }

    @Override
    public PhotoResponse getVotePhoto(Long userId) {
       User targetUser =  userAuthRepository.findUserById(userId);
        List<User> usersToRead = new ArrayList<>();
        usersToRead.add(targetUser);
        List<Post> postList = postRepository.getAllPost(1, 0, usersToRead);
        if(postList==null || postList.isEmpty()) return null;

        return PhotoResponse.builder()
                .photoBackUrl(postList.get(0).getUrlBack())
                .photoFrontUrl(postList.get(0).getUrlFront())
                .build();


    }


}
