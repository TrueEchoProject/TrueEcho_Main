import React from 'react';
import Navigation from "./navigations";
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect, useCallback } from'react';
import { View, Text } from'react-native';

// 로딩이 완료되기 전, 자동으로 loding 화면이 넘어가는 것을 방지
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ isReady, setIsReady ] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load 되어야 하는 API 등을 여기에 기술
        // 2초 딜레이
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // 어플에게 로딩이 되었음을 알림
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    
    prepare();
  }, []);
  
  return (
      <Navigation />
  );
}

