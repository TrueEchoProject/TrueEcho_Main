import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const NotificationManager = ({ notificationTime }) => {
  useEffect(() => {
    const triggerNotification = async () => {
      const identifier = 'unique_identifier_for_notification';
      const [hours, minutes] = notificationTime.split(':').map((value) => parseInt(value));

      const trigger = {
        hour: hours,
        minute: minutes,
        repeats: true, // 반복 알림 설정
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '새로운 알림',
          body: '알림이 발생했습니다!',
        },
        trigger,
        identifier,
      });
    };

    triggerNotification();
  }, [notificationTime]);

  return null;
};

export default NotificationManager;
