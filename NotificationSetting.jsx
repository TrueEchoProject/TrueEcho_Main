import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, TextInput } from 'react-native';
import NotificationManager from './NotificationManager'; // 알림을 관리하는 컴포넌트

const NotificationSettings = () => {
  const [notificationMinutes, setNotificationMinutes] = useState({});
  const [notificationTime, setNotificationTime] = useState('');

  const toggleMinuteSwitch = (minute) => {
    setNotificationMinutes((prevState) => ({
      ...prevState,
      [minute]: !prevState[minute],
    }));
  };

  const handleCustomMinuteChange = (text) => {
    const minutes = parseInt(text);
    if (!isNaN(minutes) && minutes >= 0 && minutes <= 10) {
      setNotificationTime(`${minutes < 10 ? '0' : ''}${minutes}:00`);
    } else {
      setNotificationTime('');
    }
  };

  const generateRandomNotification = () => {
    const selectedMinutes = Object.entries(notificationMinutes)
      .filter(([minute, selected]) => selected)
      .map(([minute, selected]) => minute);

    if (selectedMinutes.length < 1) {
      alert('적어도 한 분을 선택해야 합니다.');
      return;
    }

    const randomMinuteIndex = Math.floor(Math.random() * selectedMinutes.length);
    const randomMinute = selectedMinutes[randomMinuteIndex];
    setNotificationTime(randomMinute);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>알림 시간 설정</Text>
      <View style={styles.minutesContainer}>
        {[...Array(11).keys()].map((minute) => (
          <View key={minute} style={styles.minuteItem}>
            <Text>{`${minute < 10 ? '0' : ''}${minute}분`}</Text>
            <Switch
              value={notificationMinutes[`minute${minute}`]}
              onValueChange={() => toggleMinuteSwitch(`minute${minute}`)}
            />
          </View>
        ))}
        <View style={styles.customMinuteInputContainer}>
          <Text>직접 입력:</Text>
          <TextInput
            style={styles.customMinuteInput}
            placeholder="분을 입력하세요"
            keyboardType="numeric"
            onChangeText={handleCustomMinuteChange}
            value={notificationTime}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={generateRandomNotification}>
        <Text style={styles.buttonText}>랜덤 알림 설정</Text>
      </TouchableOpacity>

      {/* 알림이 발생하는 로직을 처리하는 컴포넌트 */}
      {notificationTime !== '' && <NotificationManager notificationTime={notificationTime} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  minutesContainer: {
    marginBottom: 20,
  },
  minuteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  customMinuteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customMinuteInput: {
    marginLeft: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: 100,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationSettings;
