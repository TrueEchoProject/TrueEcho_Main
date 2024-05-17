package te.trueEcho.domain.setting.service;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import te.trueEcho.domain.post.entity.Pin;
import te.trueEcho.domain.post.entity.Post;
import te.trueEcho.domain.setting.converter.BlockedUserToDto;
import te.trueEcho.domain.setting.converter.PinListToDto;
import te.trueEcho.domain.setting.converter.PostListToDto;
import te.trueEcho.domain.setting.dto.*;
import te.trueEcho.domain.setting.repository.SettingRepository;
import te.trueEcho.domain.user.entity.Block;
import te.trueEcho.domain.user.entity.User;
import te.trueEcho.domain.user.repository.UserAuthRepository;
import te.trueEcho.domain.user.service.UserService;
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

    public MonthlyPostListResponse getMonthlyPosts(Integer month) {
        if(month == null){
            month = LocalDate.now().getMonthValue();
        }

        List<Post> postList =  settingRepository.getMontlyPosts(month, authUtil.getLoginUser());

        if(postList.isEmpty()){
            log.warn("No post found for this month");
            return null;
        }

        return PostListToDto.converter(postList, month);
    }

    @Override
    public PinListResponse getPins() {
        User loginUser = authUtil.getLoginUser();
        List<Pin> pinList = settingRepository.getMyPins(loginUser);
        if(pinList.isEmpty()){
            log.warn("No pin found for this user");
            return null;
        }
        return PinListToDto.convert(pinList);
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
            loginUser.updateName(editMyInfoRequest.getNickname());
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
    public void editNotifyTime() {

    }

    @Override
    public RandomNotifyTResponse getRandomNotifyTime() {
        User loginUser = authUtil.getLoginUser();

        if (loginUser == null) {
            log.error("Authentication failed - No login user found");
            return null;
        }

        return RandomNotifyTResponse.builder()
                .randomNotifyTime(loginUser.getNotificationTime())
                .build();
    }
}
