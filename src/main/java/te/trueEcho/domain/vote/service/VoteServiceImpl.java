package te.trueEcho.domain.vote.service;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.repository.PostRepository;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.domain.vote.converter.VoteToDto;
import te.trueEcho.domain.vote.converter.VoteUserToDto;
import te.trueEcho.domain.vote.dto.*;
import te.trueEcho.domain.vote.entity.VoteResult;
import te.trueEcho.domain.vote.repository.VoteRepository;
import te.trueEcho.domain.vote.entity.Vote;
import te.trueEcho.domain.vote.repository.VoteType;
import te.trueEcho.global.util.AuthUtil;

import java.util.*;
import java.util.stream.IntStream;

import static te.trueEcho.global.util.WeekUtil.getThisWeekAsNum;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteServiceImpl implements VoteService {
    private final VoteRepository voteRepository;
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
        List<Vote> todayVoteList = voteRepository.getThisWeekVoteByType(votetype, getThisWeekAsNum());

        // 캐시 안되어 있으면 타입에 따라 이번주꺼 만들기.
        if (todayVoteList==null) {
            voteRepository.createSelectedVoteContents();
            todayVoteList=   voteRepository.getThisWeekVoteByType(votetype, getThisWeekAsNum());
        }

        // 여전히 비어있으면 실패..
        if(todayVoteList == null || todayVoteList.isEmpty()) {
            return null;
        }

        return  voteToDto.converter(todayVoteList);
    }


    @Override
    public VoteUsersResponse getRandomUsersWithPostForVote(int voteUserCount) {

        VoteUsersResponse voteUsersResponse = voteRepository.getTargetUsers(false);

        if(voteUsersResponse != null) {
            if(voteUsersResponse.getUserNum() == -2) {
                reShuffleAndCache(voteUserCount);
                return voteRepository.getTargetUsers(false);
            }
            return voteUsersResponse;
        }else{ // 새로 만들기
            List<Post> randomPosts =  postRepository.getRandomPost();

            if(randomPosts == null || randomPosts.isEmpty()) {
                return null;
            }

            Map<User, Post> latestPostsByUser = new LinkedHashMap<>();

            for (Post post : randomPosts) {
                User user = post.getUser();
                if (!latestPostsByUser.containsKey(user)) {
                    latestPostsByUser.put(user, post);
                }else{
                    Post latestPost = latestPostsByUser.get(user);
                    if (latestPost.getCreatedAt().isBefore(post.getCreatedAt())) {
                        latestPostsByUser.put(user, post);
                    }
                }
            }
            cacheShuffledList(voteUserCount, Arrays.asList(randomPosts.toArray()), false);
            return getRandomUsersWithPostForVote(voteUserCount);
        }
    }

    private void reShuffleAndCache(int voteUserCount) {
        List<TargetUserResponse> collectedPosts = new ArrayList<>();
        VoteUsersResponse temp = voteRepository.getTargetUsers(true);
        while (temp!=null) {
            log.trace("temp : {}", temp);
            collectedPosts.addAll(temp.getUserList());
            temp = voteRepository.getTargetUsers(true);
        }

        cacheShuffledList(voteUserCount, Arrays.asList(collectedPosts.toArray()), true);
    }


    private void cacheShuffledList(int voteUserCount, List<Object> targetList, boolean isReShuffle) {
        List<List<Object>> groupedPosts =
                shuffleAndDivide(voteUserCount, Arrays.asList(targetList.toArray()));

        if (isReShuffle) {
            for (List<Object> voteUsersResponseList : groupedPosts) {
                voteRepository.putTargetUsers(
                        VoteUsersResponse.builder()
                                .userNum(voteUserCount)
                                .userList(voteUsersResponseList.stream()
                                        .map(voteUsersResponse ->
                                                (TargetUserResponse) voteUsersResponse).toList()
                                )
                                .build());
            }
        }else{
            for (List<Object> posts : groupedPosts) {
                voteRepository.putTargetUsers(voteUserToDto.converter(
                        posts.stream().map(post -> (Post) post).toList()));
            }
        }

        voteRepository.putTargetUsers(VoteUsersResponse.builder().userNum(-1).build()); // 끝 표시
    }

    private List<List<Object>> shuffleAndDivide(int voteUserCount, List<Object> shuffleTarget) {
        Collections.shuffle(shuffleTarget);

        List<List<Object>> groupedPosts = new ArrayList<>();
        IntStream.range(0, shuffleTarget.size())
                .forEach(i -> {
                    if (i % voteUserCount == 0) {
                        groupedPosts.add(new ArrayList<>());
                    }
                    groupedPosts.get(i / voteUserCount).add(shuffleTarget.get(i));
                });
        // 나머지 없애기
        if (groupedPosts.get(groupedPosts.size() - 1).size() < voteUserCount) {
            groupedPosts.remove(groupedPosts.size() - 1);
        }
        return groupedPosts;
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
