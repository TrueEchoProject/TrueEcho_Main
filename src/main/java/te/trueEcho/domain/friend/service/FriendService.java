package te.trueEcho.domain.friend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.query.IllegalQueryOperationException;
import org.springframework.stereotype.Service;
import te.trueEcho.domain.friend.dto.ConfirmFriendResponse;
import te.trueEcho.domain.friend.dto.FriendListResponse;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.friend.repository.FriendRepositoryImpl;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.service.UserAuthServiceImpl;
import te.trueEcho.global.util.AuthUtil;

import java.util.*;
import java.util.stream.Collectors;

import static te.trueEcho.domain.friend.entity.FriendStatus.NOT_FRIEND;

@Slf4j
@Service
@RequiredArgsConstructor
public class FriendService {
    private final UserAuthServiceImpl userAuthService;
    private final AuthUtil authUtil;
    private final FriendRepositoryImpl friendRepository;

    public boolean addFriend(Long targetUserId) {
        try {
            final User sendUser = authUtil.getLoginUser();
            final User targetUser = userAuthService.findUserByID(targetUserId);

            if (sendUser == null || targetUser == null) {
                log.error("User not found");
                return false;
            }

            final Friend friend = Friend.builder()
                    .sendUser(sendUser)
                    .status(NOT_FRIEND)
                    .targetUser(targetUser)
                    .build();

            friendRepository.save(friend);

            return true;

        } catch (Exception e) {
            log.error("Error occurred while adding friend", e);
            return false;
        }
    }
    public boolean cancelRequest(Long targetUserId) {
        try {
            final User sendUser = authUtil.getLoginUser();
            final User targetUser = userAuthService.findUserByID(targetUserId);

            if (sendUser == null || targetUser == null) {
                log.error("User not found");
                return false;
            }

            friendRepository.rejectRequest(targetUser, sendUser);

            return true;

        } catch (Exception e) {
            log.error("Error occurred while adding friend", e);
            return false;
        }
    }

    public List<ConfirmFriendResponse> confirmRequest(String type) {
        try {
            final User loginUser = authUtil.getLoginUser();
            if (loginUser == null) {
                log.error("Login user not found");
                return Collections.emptyList();
            }

            List<User> users;
            if ("receive".equals(type)) {
                users = friendRepository.getSendUser(loginUser);
            } else if ("send".equals(type)) {
                users = friendRepository.getTargetuser(loginUser);
            } else {
                log.error("Invalid type: " + type);
                return Collections.emptyList();
            }

            if (users == null || users.isEmpty()) {
                log.error("No users found for the type: " + type);
                return Collections.emptyList();
            }

            return users.stream()
                    .map(user -> ConfirmFriendResponse.builder()
                            .userId(user.getId())
                            .userProfileUrl(user.getProfileURL())
                            .nickname(user.getNickname())
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error occurred while confirming friend request", e);
            return Collections.emptyList();
        }
    }

    public boolean acceptRequest(Long sendUserId) {
        try {
            final User targetUser = authUtil.getLoginUser();
            friendRepository.acceptRequest(targetUser, sendUserId);
            return true;

        } catch (IllegalArgumentException e) {
            log.error("Invalid argument provided", e);
            return false;
        } catch (IllegalQueryOperationException e) {
            log.error("Error occurred while executing the query", e);
            return false;
        } catch (Exception e) {
            log.error("An unexpected error occurred", e);
            return false;
        }
    }

    public boolean removeFriend(Long sendUserId) {
        try {
            final User targetUser = authUtil.getLoginUser();
            final User sendUser = userAuthService.findUserByID(sendUserId);

            boolean firstRemove = friendRepository.rejectRequest(targetUser, sendUser);
            boolean secondRemove = friendRepository.rejectRequest(sendUser, targetUser);

            if (!firstRemove || !secondRemove) {
                log.error("Error occurred while removing friend");
                return false;
            }
            return true;

        } catch (IllegalArgumentException e) {
            log.error("Invalid argument provided", e);
            return false;
        } catch (IllegalQueryOperationException e) {
            log.error("Error occurred while executing the query", e);
            return false;
        } catch (Exception e) {
            log.error("An unexpected error occurred", e);
            return false;
        }
    }

    public List<FriendListResponse> getFriendList() {
        try {
            final User loginUser = authUtil.getLoginUser();

            if (loginUser == null) {
                log.error("sendUser not found");
                return Collections.emptyList();
            }

            List<User> friends = getFriendList(loginUser);

            if (friends == null) {
                log.error("No friends found for the user");
                return Collections.emptyList();
            }

            return friends.stream()
                    .map(friend -> FriendListResponse.builder()
                            .userId(friend.getId())
                            .nickname(friend.getNickname())
                            .userProfileUrl(friend.getProfileURL())
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error occurred while getting friend list", e);
            return Collections.emptyList();
        }
    }

    public List<FriendListResponse> recommendFriends() {
        List<FriendListResponse> response = new ArrayList<>();

        try {
            final User loginUser = authUtil.getLoginUser();

            if (loginUser == null) {
                log.error("Login user not found");
                return response;
            }

            List<User> friendList = getFriendListForRecommend(loginUser);
            if (friendList == null) {
                log.error("No friends found for the user");
                return response;
            }

            Set<User> friends = new HashSet<>(friendList);  // 현재 사용자의 친구 목록
            Map<User, Integer> recommendationMap = new HashMap<>();

            // 친구의 친구들을 찾아서 추천 맵에 추가
            for (User friend : friends) {
                List<User> fofList = getFriendListForRecommend(friend);
                if (fofList != null) {
                    for (User fof : fofList) {
                        if (!friends.contains(fof) && !fof.equals(loginUser)) {
                            recommendationMap.put(fof, recommendationMap.getOrDefault(fof, 0) + 1);
                        }
                    }
                }
            }

            int size = 4;
            response = recommendationMap.entrySet().stream()
                    .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                    .map(Map.Entry::getKey)
                    .limit(size)
                    .map(user -> FriendListResponse.builder()
                            .userId(user.getId())
                            .nickname(user.getNickname())
                            .userProfileUrl(user.getProfileURL())
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error occurred while recommending friends", e);
        }
        return response;
    }

    private List<User> getFriendList(User loginUser) {
        List<User> friendList = new ArrayList<>();

        try {
            friendList = friendRepository.getFriendList(loginUser);
        } catch (Exception e) {
            log.error("Error occurred while getting friend list", e);
        }

        return friendList;
    }

    private List<User> getFriendListForRecommend(User loginUser) {
        List<User> friendList = new ArrayList<>();

        try {
            friendList = friendRepository.getFriendListForRecommend(loginUser);
        } catch (Exception e) {
            log.error("Error occurred while getting friend list", e);
        }

        return friendList;
    }
}
