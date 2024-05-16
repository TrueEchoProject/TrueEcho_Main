import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Button, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import SecureApi from '../../../SecureApi';


import axios from 'axios';

const VotePage = ({ question, onUserSelect }) => {
    const [userData, setUserData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserImgUrls, setSelectedUserImgUrls] = useState(null);
    const [isFrontShowing, setIsFrontShowing] = useState(true);
    
    useEffect(() => {
        fetchUserData();
    }, [question]);
    
    const fetchUserData = async () => {
        try {
            const response = await SecureApi.get('/users');
            setUserData(response.data || []);
            setSelectedUser(null);
            setSelectedUserImgUrls(null); // 이미지 상태 초기화
        } catch (error) {
            console.error('Error fetching user data: ', error);
        }
    };
    
    const handleUserPress = (user) => {
        const selectedUserData = userData.find((userData) => userData.userName === user);
        setSelectedUser(user);
        setSelectedUserImgUrls({
            front: selectedUserData.photoFrontUrl,
            back: selectedUserData.photoBackUrl
        });
        setIsFrontShowing(true);
        onUserSelect(question.id, selectedUserData.userID);
    };
    
    const toggleImage = () => {
        setIsFrontShowing(!isFrontShowing);
    };
    
    return (
      <View style={styles.container}>
          <Text style={styles.questionText}>{question.question}</Text>
          <TouchableWithoutFeedback onPress={toggleImage}>
              <View style={styles.selectedUserImageContainer}>
                  <Image
                    source={selectedUserImgUrls ? { uri: isFrontShowing ? selectedUserImgUrls.front : selectedUserImgUrls.back } : require('../../../assets/emoji.png')}
                    style={styles.selectedUserImage}
                  />
              </View>
          </TouchableWithoutFeedback>
          <View style={styles.usersContainer}>
              {userData.map((user, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                      styles.userButton,
                      selectedUser === user.userName ? styles.selectedButton : null
                  ]}
                  onPress={() => handleUserPress(user.userName)}
                >
                    <Text>{user.userName}</Text>
                    <Image source={{ uri: user.profileUrl }} style={styles.profileImage} />
                </TouchableOpacity>
              ))}
          </View>
          <Button title="Refresh Users" onPress={fetchUserData} />
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // 화면 전체를 차지
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20, // 일정 간격 유지
    },
    questionText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center', // 중앙 정렬
        marginBottom: 20, // 여백 추가
    },
    usersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around', // 요소들 사이에 공간을 균등하게 배분
        alignItems: 'center',
        width: '100%', // 부모 컨테이너 전체 너비 사용
    },
    userButton: {
        flex: 1, // flex 레이아웃 사용
        maxWidth: '45%', // 최대 너비 설정
        padding: 10,
        margin: 5, // 마진 조정
        backgroundColor: '#eee',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedButton: {
        backgroundColor: 'blue',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginTop: 5,
    },
    selectedUserImageContainer: {
        width: '80%', // 화면의 80% 차지
        aspectRatio: 1, // 1:1 비율 유지
        marginTop: 20,
        alignItems: 'center',
    },
    selectedUserImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default React.memo(VotePage);
