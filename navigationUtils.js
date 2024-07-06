import * as Linking from 'expo-linking';

export const createNavigationUrl = (type, data) => {
  switch (type) {
    case "0":
      return Linking.createURL("main/camera/camera-option");
    case "1":
      return Linking.createURL("main/community/community/result");
    case "2":
      return Linking.createURL("main/community/community/result");
    case "3":
      return Linking.createURL(`main/mainpost/user-alarm`, {
        queryParams: { userId: data.contentId },
      });
    case "4":
      return Linking.createURL(`main/mainpost/feed-alarm`, {
        queryParams: { postId: data.contentId },
      });
    case "5":
      return Linking.createURL(`main/mainpost/feed-alarm`, {
        queryParams: { postId: data.contentId },
      });
    case "6":
      return Linking.createURL(`main/mainpost/feed-alarm`, {
        queryParams: { postId: data.contentId },
      });
    case "7":
      return Linking.createURL("main/mainpost/friends");
    default:
      console.log("Unknown notification type received.");
      return null;
  }
};
