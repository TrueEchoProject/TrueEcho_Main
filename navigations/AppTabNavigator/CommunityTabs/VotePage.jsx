import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Button } from 'react-native';
import axios from 'axios';

const fetchUserData = async () => {
    try {
        const response = await axios.get('http://192.168.123.121:3000/users');
        console.log('Data fetched successfully'); // 데이터 성공적으로 받아왔을 때 로그 출력
        return response.data || [];
    } catch (error) {
        console.error('Error refreshing user data: ', error);
        return [];
    }
};

const VotePage = ({ question, onUserSelect }) => {
    const [userData, setUserData] = useState([]);

    useEffect(() => {
        // console.log('Received question prop:', question); // 테스트용 콘솔. 부모로부터 프롭스를 잘 받아오는지.

        const initFetch = async () => { // 컴포넌트가 마운트되면 데이터 받아옴. 또는
            const data = await fetchUserData();
            setUserData(data);
        };

        initFetch();
    }, [question]); // question 값이 변경될 때마다 

    const refreshUserData = async () => { // 새로고침시 유저 데이터 새로 받아옴. 
        const data = await fetchUserData();
        setUserData(data);
        console.log('User data refreshed.'); // 데이터 새로고침 시 콘솔 로그 출력
    };

    const handleUserPress = (selectedUser) => { // 콜백 함수. 선택된 유저와 질문이 부모컴포넌트로 이동. 
        onUserSelect(question.id, selectedUser);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.questionText}>{question.question}</Text>
            <Button title="Refresh Users" onPress={refreshUserData} />
            <View style={styles.buttonContainer}>
                {userData.map((user, index) => (
                    <TouchableOpacity key={index} style={styles.optionButton} onPress={() => handleUserPress(user.user)}>
                        <Image source={{ uri: user.url || 'https://via.placeholder.com/150' }} style={styles.userImage} />
                        <Text>{user.user}</Text>
                    </TouchableOpacity>
                ))}
            </View>
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
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    optionButton: {
        padding: 10,
        margin: 5,
        backgroundColor: '#eee',
        borderRadius: 5,
        alignItems: 'center',
    },
    userImage: {
        width: 50, 
        height: 50,
    },
});

export default React.memo(VotePage);
