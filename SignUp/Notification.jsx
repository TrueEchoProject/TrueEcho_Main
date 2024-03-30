import { useEffect } from 'react';
import * as Notifications from 'expo-notifications'; // 알림 권한 얻는 라이브러리. 

const Notification = () => {
  useEffect(() => {
    const getNotificationPermission = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync(); // 현재 디바이스의 알림권한 상태를 existingStatus에  할당.
      if (existingStatus !== 'granted') { // 권한이 없는경우 
        const { status } = await Notifications.requestPermissionsAsync(); // 알림 권한 요청하는 팝업 띄움.
        if (status !== 'granted') { // 팝업을 띄웠음에도 거부했을 경우. 거부되었다고 팝업 띄움.
          alert('푸시 알림 수신 권한이 거부되었습니다.');
          return;
        }
      }
    };

    getNotificationPermission();
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더하지 않고 알림 권한 용도로만 사용된다. 
};

export default Notification;
