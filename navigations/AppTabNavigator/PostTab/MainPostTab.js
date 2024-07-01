import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from 'react-native';
import { FriendPosts, PublicPosts } from './index';
import FeedButton from "../../../components/FeedButton";

const MainPostTab = createBottomTabNavigator();

export const MainPostTabScreen = ({ route }) => {
  const friendPostsRef = React.useRef();
  const PublicPostsRef = React.useRef();
  const initialTab = route.params?.initialTab || 'FriendFeed';

  return (
    <MainPostTab.Navigator
      screenOptions={{
        tabBarStyle: { display: 'none' },
        headerTitleAlign: "center",
        headerStyle: {
          height: 70, // 상단 헤더의 높이를 적절히 조정
          backgroundColor: 'black', // 상단 헤더의 배경색을 검정색으로 설정
        }
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
                    if (currentRouteName === 'FriendFeed') {
                      friendPostsRef.current.getPosts();
                    } else { navigation.navigate('FriendFeed') }
                  }}
                  isSelected={currentRouteName === 'FriendFeed'}
                />
                <FeedButton
                  title="더보기"
                  onPress={() => {
                    if (currentRouteName === 'OtherFeed') {
                      PublicPostsRef.current.getPosts();
                    } else { navigation.navigate('OtherFeed'); }
                  }}
                  isSelected={currentRouteName === 'OtherFeed'}
                />
              </View>
            );
          },
        })}
      />
      <MainPostTab.Screen
        name="OtherFeed"
        children={(props) => <PublicPosts ref={PublicPostsRef} {...props} />}
        options={({ navigation }) => ({
          headerTitle: () => {
            const currentRouteName = navigation.getState().routes[navigation.getState().index].name;
            return (
              <View style={styles.headerContainer}>
                <FeedButton
                  title="친구"
                  onPress={() => {
                    if (currentRouteName === 'FriendFeed') {
                      PublicPostsRef.current.getPosts();
                    } else { navigation.navigate('FriendFeed') }
                  }}
                  isSelected={currentRouteName === 'FriendFeed'}
                />
                <FeedButton
                  title="더보기"
                  onPress={() => {
                    if (currentRouteName === 'OtherFeed') {
                      PublicPostsRef.current.getPosts();
                    } else { navigation.navigate('OtherFeed'); }
                  }}
                  isSelected={currentRouteName === 'OtherFeed'}
                />
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
    paddingVertical: 10, // 패딩을 조정하여 배경 범위를 자연스럽게 확장
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black', // 헤더 컨테이너의 배경색을 검정색으로 설정
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default MainPostTabScreen;
