import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { View, Text, Button } from 'react-native';

const GetLocation = ({ onLocationReceived, refresh }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('위치 접근 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    onLocationReceived(location.coords.latitude, location.coords.longitude);
  };

  useEffect(() => {
    getLocation();
  }, [refresh]); // refresh prop이 변경될 때마다 getLocation 호출

  const openSettings = () => {
    Linking.openSettings();
  };

  if (errorMsg) {
    return (
      <View>
        <Text>{errorMsg}</Text>
        <Button title="Retry" onPress={getLocation} />
        <Button title="Open Settings" onPress={openSettings} />
      </View>
    );
  }

  return null;
};

export default GetLocation;
