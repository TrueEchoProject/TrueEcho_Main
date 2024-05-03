import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Button, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
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
            const response = await axios.get('http://192.168.0.27:3000/users');
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    usersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userButton: {
        width: '45%',
        padding: 10,
        margin: '2.5%',
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
        marginTop: 20,
        alignItems: 'center',
        width: 300,
        height: 300,
    },
    selectedUserImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default React.memo(VotePage);
