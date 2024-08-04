import React, { useState } from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FriendPosts, PublicPosts } from './index';
import FeedButton from "../../../components/FeedButton";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MainPostTab = createBottomTabNavigator();

export const MainPostTabScreen = ({ route }) => {
  const friendPostsRef = React.useRef();
  const publicPostsRef = React.useRef();
  const initialTab = route.params?.initialTab || 'FriendFeed';
  const [currentTab, setCurrentTab] = useState(initialTab);

  const handleToggleOptions = () => {
    if (publicPostsRef.current && publicPostsRef.current.toggleOptions) {
      publicPostsRef.current.toggleOptions();
    } else {
      console.error('toggleOptions method is not available on publicPostsRef');
    }
  };

  return (
    <MainPostTab.Navigator
      screenOptions={{
        tabBarStyle: {
          display: 'none',
        borderTopWidth: 1, // 상단 경계선 제거
        borderColor: 'black', // 경계선 색상을 검정으로 설정
        elevation: 0, // 안드로이드에서 그림자 제거
        shadowOpacity: 0, // iOS에서 그림자 제거
        backgroundColor: 'black', // 배경색을 검정으로 설정
        },
        headerTitleAlign: "center",
        headerStyle: {
          height: 70,
          backgroundColor: 'black',
          borderTopWidth: 0, // 상단 경계선 제거
          borderBottomWidth: 0, // 하단 경계선 제거
          shadowColor: 'transparent', // 그림자 색상을 투명하게 설정
          elevation: 0, // 안드로이드에서 그림자 제거
        },
      }}
      initialRouteName={initialTab}
    >
      <MainPostTab.Screen
        name="FriendFeed"
        children={(props) => <FriendPosts ref={friendPostsRef} {...props} />}
        options={({ navigation }) => ({
          headerTitle: () => {
            const currentRouteName = navigation.getState().routes[navigation.getState().index].name;
            return (
              <View style={styles.headerContainer}>
                <FeedButton
                  title="친구"
                  onPress={() => {
                    setCurrentTab('FriendFeed');
                    if (currentRouteName === 'FriendFeed') {
                      friendPostsRef.current.getPosts();
                    } else { navigation.navigate('FriendFeed') }
                  }}
                  isSelected={currentRouteName === 'FriendFeed'}
                />
                <FeedButton
                  title="더보기"
                  onPress={() => {
                    setCurrentTab('OtherFeed');
                    if (currentRouteName === 'OtherFeed') {
                      publicPostsRef.current.getPosts();
                    } else { navigation.navigate('OtherFeed'); }
                  }}
                  isSelected={currentRouteName === 'OtherFeed'}
                />
                {currentRouteName === 'OtherFeed' && (
                  <TouchableOpacity onPress={handleToggleOptions} style={styles.settingsButton}>
                    <LinearGradient
                      colors={['#1BC5DA', '#263283']}
                      style={styles.gradient}
                    >
                      <MaterialIcons
                        name='settings'
                        size={28}
                        style={styles.iconStyle}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            );
          },
        })}
      />
      <MainPostTab.Screen
        name="OtherFeed"
        children={(props) => <PublicPosts ref={publicPostsRef} {...props} />}
        options={({ navigation }) => ({
          headerTitle: () => {
            const currentRouteName = navigation.getState().routes[navigation.getState().index].name;
            return (
              <View style={styles.headerContainer}>
                <FeedButton
                  title="친구"
                  onPress={() => {
                    setCurrentTab('FriendFeed');
                    if (currentRouteName === 'FriendFeed') {
                      friendPostsRef.current.getPosts();
                    } else { navigation.navigate('FriendFeed') }
                  }}
                  isSelected={currentRouteName === 'FriendFeed'}
                />
                <FeedButton
                  title="더보기"
                  onPress={() => {
                    setCurrentTab('OtherFeed');
                    if (currentRouteName === 'OtherFeed') {
                      publicPostsRef.current.getPosts();
                    } else { navigation.navigate('OtherFeed'); }
                  }}
                  isSelected={currentRouteName === 'OtherFeed'}
                />
                {currentRouteName === 'OtherFeed' && (
                  <TouchableOpacity onPress={handleToggleOptions} style={styles.settingsButton}>
                    <LinearGradient
                      colors={['#1BC5DA', '#263283']}
                      style={styles.gradient}
                    >
                      <MaterialIcons
                        name='settings'
                        size={28}
                        style={styles.iconStyle}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            );
          },
        })}
      />
    </MainPostTab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0,
    shadowColor: 'transparent',
  },
  settingsButton: {
    marginLeft: 10,
    borderRadius: 14,
    width: 50, // 버튼 너비 추가
    height: 50, // 버튼 높이 추가
  },
  gradient: {
    padding: 5,
    borderRadius: 14,
    width: '100%', // 그라데이션 너비 추가
    height: '100%', // 그라데이션 높이 추가
    alignItems: 'center', // 아이콘 가운데 정렬
    justifyContent: 'center', // 아이콘 가운데 정렬
  },
  iconStyle: {
    color: "white",
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default MainPostTabScreen;