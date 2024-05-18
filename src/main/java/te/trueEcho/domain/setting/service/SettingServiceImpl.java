package te.trueEcho.domain.setting.service;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.friend.entity.Friend;
import te.trueEcho.domain.friend.repository.FriendRepository;
import te.trueEcho.domain.post.entity.Pin;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.post.repository.PostRepository;
import te.trueEcho.domain.setting.converter.NotificationSettingToDto;
import te.trueEcho.domain.setting.converter.PinListToDto;
import te.trueEcho.domain.setting.converter.PostListToDto;
import te.trueEcho.domain.post.repository.PinsRepository;
import te.trueEcho.domain.setting.converter.UserPinToDto;
import te.trueEcho.domain.setting.dto.calendar.MonthlyPostListResponse;
import te.trueEcho.domain.setting.dto.mypage.EditMyInfoRequest;
import te.trueEcho.domain.setting.dto.mypage.MyInfoResponse;
import te.trueEcho.domain.setting.dto.mypage.MyPageResponse;
import te.trueEcho.domain.setting.dto.mypage.OtherPageResponse;
import te.trueEcho.domain.setting.dto.notiset.NotificationSettingDto;
import te.trueEcho.domain.setting.dto.pin.PinListResponse;
import te.trueEcho.domain.setting.dto.pin.PinsRequest;
import te.trueEcho.domain.setting.dto.random.RandomNotifyTResponse;
import te.trueEcho.domain.setting.entity.NotiTimeStatus;
import te.trueEcho.domain.setting.entity.NotificationSetting;
import te.trueEcho.domain.setting.repository.SettingRepository;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.domain.user.service.UserService;
import te.trueEcho.domain.vote.entity.VoteResult;
import te.trueEcho.global.util.AuthUtil;
import te.trueEcho.infra.azure.AzureUploader;
import java.time.LocalDate;
import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService{
    private final UserService userService;
    private final UserAuthRepository userAuthRepository;
    private final AuthUtil authUtil;
    private final SettingRepository settingRepository;
    private final AzureUploader azureUploader;
    private final PinsRepository pinsRepository;
    private final PostRepository postRepository;
    private final PostListToDto postListToDto;
    private final PinListToDto pinListToDto;
    private final NotificationSettingToDto notificationSettingToDto;
    private final UserPinToDto userPinToDto;
    private final FriendRepository friendRepository;
    private final NotificationEditService notificationEditService;

    @Override
    public MyPageResponse getMyPage() {
        User loginUser = authUtil.getLoginUser();
        String mostVotedTitle = settingRepository.getMostVotedTitle(loginUser);

        return MyPageResponse.builder().
                profileUrl(loginUser.getProfileURL())
                .username(authUtil.getLoginUser().getName())
                .mostVotedTitle(mostVotedTitle)
                .location(loginUser.getLocation())
                .build();
    }

    @Override
    public OtherPageResponse getOtherPage(Long userId) {
        User user = userAuthRepository.findUserById(userId);

        if (user == null) {
            log.error("No user found for this id");
            return null;
        }
        List<Pin> pinList = settingRepository.getPinsByUser(user);
        String mostVotedTitle = settingRepository.getMostVotedTitle(user);
        List<User> friends = friendRepository.findMyFriendsByUser(user);

        return userPinToDto.converter(user, pinList, mostVotedTitle, friends.contains(authUtil.getLoginUser()));

    }

    public MonthlyPostListResponse getMonthlyPosts(Integer month) {
        if(month == null){
            month = LocalDate.now().getMonthValue();
        }

        List<Post> postList =  settingRepository.getMonthlyPosts(month, authUtil.getLoginUser());

        if(postList.isEmpty()){
            log.warn("No post found for this month");
            return null;
        }

        return postListToDto.converter(postList, month);
    }

    @Override
    public PinListResponse getPins() {
        User loginUser = authUtil.getLoginUser();
        List<Pin> pinList = settingRepository.getPinsByUser(loginUser);
        if(pinList.isEmpty()){
            log.warn("No pin found for this user");
            return null;
        }
        return pinListToDto.convert(pinList);
    }

    @Transactional
    @Override
    public PinListResponse editPins(PinsRequest editPinsRequest) {
        User loginUser = authUtil.getLoginUser();

        if (!settingRepository.deletePinsByUser(loginUser)){
            return null;
        }

        if (editPinsRequest.getUpdatedPostIdList().isEmpty()){
            return getPins();
        }

        List<Post> postList =  postRepository.getPostByIdList(editPinsRequest.getUpdatedPostIdList());

        List<Pin> newPins =
                postList.stream().map(
                        post -> new Pin(1, loginUser, post)
                ).toList();

        pinsRepository.saveAll(newPins);

        return getPins();
    }


    @Transactional
    @Override
    public boolean editMyInfo(EditMyInfoRequest editMyInfoRequest) {
        User loginUser = authUtil.getLoginUser();

        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            return false;
        }

        MultipartFile profileImage = editMyInfoRequest.getProfileImage();

        if (profileImage == null ) {
            log.error("Invalid file upload attempt -  file is null");
            return false;
        }

        String profileUrl = null;

        try {
            azureUploader.deleteImage(loginUser.getProfileURL());
            profileUrl = azureUploader.uploadImage(profileImage);
        } catch (Exception e) {
            log.error("File upload failed", e);
            return false;
        }

        if (profileUrl == null) {
            log.error("Failed to upload profile image to Azure Storage");
            return false;
        }
        log.info("Profile image uploaded successfully");
        log.info("Profile image url: {}", profileUrl); ;

        try {
            loginUser.updateProfileUrl(profileUrl);
            loginUser.updateName(editMyInfoRequest.getUsername());
            loginUser.updateNickName(editMyInfoRequest.getNickname());
            loginUser.updateLocation(editMyInfoRequest.getLocation());
            userAuthRepository.updateUser(loginUser);
            return true;
        } catch (DataAccessException e) {
            log.error("Failed to save the updated user to db", e);
            return false;
        }
    }

    public MyInfoResponse getMyInfo() {
        User loginUser = authUtil.getLoginUser();

        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            return null;
        }

        return MyInfoResponse.builder()
                .username(loginUser.getName())
                .nickname(loginUser.getNickname())
                .profileUrl(loginUser.getProfileURL())
                .yourLocation(loginUser.getLocation())
                .build();
    }


    @Override
    public RandomNotifyTResponse getRandomNotifyTime() {
        User loginUser = authUtil.getLoginUser();

        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            return null;
        }
        return RandomNotifyTResponse.builder()
                .randomNotifyTime(loginUser.getNotificationSetting().
                        getNotificationTimeStatus())
                .build();
    }

    //수정 권한 (알림을 못 받았으면, 대기 큐에 넣고, 나중에 알림을 받으면 큐에서 꺼내서 알림 시간대 수정)
    @Override
    public boolean editRandomNotifyTime(int notifyTime) {

        try {
            notificationEditService.isUserReceivedNotification(authUtil.getLoginUser(), NotiTimeStatus.values()[notifyTime]);
            return true;
        }catch (Exception e) {
            log.error("Failed to edit notification time", e);
            return false;
        }
    }

    @Override
    public NotificationSettingDto getNotificationSetting() {
        User loginUser = authUtil.getLoginUser();

        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            return null;
        }
        return notificationSettingToDto.converter(loginUser.getNotificationSetting());
    }

    @Override
    public NotificationSettingDto editNotificationSetting(NotificationSettingDto notificationSettingDto) {
        User loginUser = authUtil.getLoginUser();

        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            return null;
        }

        NotificationSetting notificationSetting = loginUser.getNotificationSetting();
        notificationSetting.editNotificationSetting(notificationSettingDto);

        return notificationSettingToDto.converter(settingRepository.editNotificationSetting(notificationSetting));
    }
}
