import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, FlatList, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Text, Image, Dimensions } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import Api from '../../../Api';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const getCurrentUserId = async () => {
    try {
        const currentUserId = await SecureStore.getItemAsync('currentUserId');
        return currentUserId;
    } catch (error) {
        console.error('Failed to get current user ID from SecureStore:', error);
        return null;
    }
};

const getAccessToken = async () => {
    try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        return accessToken;
    } catch (error) {
        console.error('Failed to get access token from SecureStore:', error);
        return null;
    }
};

const FriendsScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('recommend');
    const [subTab, setSubTab] = useState('receive');
    const [users, setUsers] = useState([]);
    const [invitedUsers, setInvitedUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); 
    const navigation = useNavigation();

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            await fetchInvitedUsers();
            if (activeTab === 'recommend') {
                await fetchRecommendedUsers();
            } else if (activeTab === 'invite') {
                await fetchInvitedUsers();
            } else if (activeTab === 'request') {
                await fetchFriendRequests();
            } else if (activeTab === 'friends') {
                await fetchFriends();
            }
            setLoading(false);
        };
        initializeData();
    }, [activeTab]);

    useEffect(() => {
        const fetchData = async () => {
            if (activeTab === 'request') {
                if (subTab === 'receive') {
                    await fetchFriendRequests();
                } else if (subTab === 'send') {
                    await fetchInvitedUsers();
                }
            }
        };
        fetchData();
    }, [subTab]);

    const fetchRecommendedUsers = useCallback(async () => {
        try {
            const response = await Api.get('/friends/recommend');
            console.log('Recommended users response:', response.data);
            if (response.data && Array.isArray(response.data.data)) {
                const recommendedUsers = response.data.data;
                const filteredUsers = recommendedUsers.filter(user => !invitedUsers.some(invited => invited.userId === user.userId));
                setUsers(filteredUsers);
            } else {
                setUsers([]);
            }
        } catch (error) {
            Alert.alert('에러', '추천 친구 목록을 불러오는 중 에러가 발생했습니다.');
        }
    }, [invitedUsers]);

    const fetchInvitedUsers = useCallback(async () => {
        try {
            const response = await Api.get('/friends/confirmRequest/send');
            console.log('Invited users response:', response.data);
            if (response.data && Array.isArray(response.data.data)) {
                setInvitedUsers(response.data.data);
                console.log('Invited users state set:', response.data.data);
            } else {
                setInvitedUsers([]);
            }
        } catch (error) {
            Alert.alert('에러', '보낸 친구 요청 목록을 불러오는 중 에러가 발생했습니다.');
        }
    }, []);

    const fetchFriendRequests = useCallback(async () => {
        try {
            const response = await Api.get('/friends/confirmRequest/receive');
            console.log('Friend requests response:', response.data);
            if (response.data && Array.isArray(response.data.data)) {
                setRequests(response.data.data);
            } else {
                setRequests([]);
            }
        } catch (error) {
            Alert.alert('에러', '받은 친구 요청 목록을 불러오는 중 에러가 발생했습니다.');
        }
    }, []);

    const fetchFriends = useCallback(async () => {
        try {
            const response = await Api.get('/friends/read');
            console.log('Friends response:', response.data);
            if (response.data && Array.isArray(response.data.data)) {
                const friends = response.data.data;
                setFriends(friends);
            } else {
                setFriends([]);
            }
        } catch (error) {
            Alert.alert('에러', '친구 목록을 불러오는 중 에러가 발생했습니다.');
        }
    }, []);

    const inviteFriend = async (userId) => {
        try {
            console.log('Inviting friend with userId:', userId);

            const formData = new FormData();
            formData.append('targetUserId', userId);

            const accessToken = await getAccessToken();
            console.log('Access Token:', accessToken);

            const response = await Api.post('/friends/add', formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Invite friend response:', response.data);

            if (response.data.code === "T002" && response.data.message === "친구 추가에 성공했습니다.") {
                const invitedUser = users.find(user => user.userId === userId);
                setInvitedUsers([...invitedUsers, invitedUser]);
                setUsers(users.filter(user => user.userId !== userId));
                Alert.alert('성공', '친구 초대 완료');
            } else {
                Alert.alert('실패', response.data.message || '친구 초대 실패');
            }
        } catch (error) {
            console.error('Error inviting friend:', error.message);
            Alert.alert('실패', '친구 초대 실패');
        }
    };

    const cancelFriendRequest = async (userId) => {
        const originalUser = invitedUsers.find(user => user.userId === userId);
    
        console.log(`Cancelling friend request for userId: ${userId}`);
        console.log('Original invited users:', invitedUsers);
    

        setInvitedUsers((prevInvitedUsers) => {
            const updatedInvitedUsers = prevInvitedUsers.filter(user => user.userId !== userId);
            console.log('Updated invited users after removal:', updatedInvitedUsers);
            return updatedInvitedUsers;
        });
        setRefreshKey(prevKey => prevKey + 1);
    
        try {
            const formData = new FormData();
            formData.append('targetUserId', userId);
    
            const accessToken = await getAccessToken();
            console.log('Access Token:', accessToken);
    
            const response = await Api.post('/friends/cancel', formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            console.log('Cancel friend request server response:', response.data);
    
            if (response.data.code === "T002" && response.data.message === "친구 요청 취소에 성공했습니다.") {
                console.log('Friend request successfully cancelled on the server.');
            } else {
                console.log('Unexpected server response:', response.data);
            }
        } catch (error) {
            console.error('Error during cancel friend request:', error.message);
        }
    };
    
    const acceptFriendRequest = async (userId) => {
        try {
            const formData = new FormData();
            formData.append('sendUserId', userId);
            const accessToken = await getAccessToken();
            const response = await Api.put('/friends/accept', formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Accept friend request response:', response.data);
            if (response.data.status === 202) {
                setRequests((prevRequests) => prevRequests.map(request =>
                    request.userId === userId ? { ...request, status: '수락 완료' } : request
                ));
                Alert.alert('성공', '친구 요청 수락 완료');
                fetchFriends();
            } else {
                Alert.alert('실패', '친구 요청 수락 실패');
            }
        } catch (error) {
            console.error('Error accepting friend request:', error.message);
            Alert.alert('실패', '친구 요청 수락 실패');
        }
    };

    const rejectFriendRequest = async (userId) => {
        try {
            const formData = new FormData();
            formData.append('sendUserId', userId);
            const accessToken = await getAccessToken();
            const response = await Api.delete('/friends/reject', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
                data: formData
            });
            console.log('Reject friend request response:', response.data);
            if (response.data.status === 202) {
                setRequests((prevRequests) => prevRequests.map(request =>
                    request.userId === userId ? { ...request, status: '거절 완료' } : request
                ));
                Alert.alert('성공', '친구 요청 거절 완료');
            } else {
                Alert.alert('실패', '친구 요청 거절 실패');
            }
        } catch (error) {
            console.error('Error rejecting friend request:', error.message);
            Alert.alert('실패', '친구 요청 거절 실패');
        }
    };

    const deleteFriend = async (friendId) => {
        try {
            const formData = new FormData();
            formData.append('friendId', friendId);
            const accessToken = await getAccessToken();
            const response = await Api.delete('/friends/delete', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
                data: formData
            });
            console.log('Delete friend response:', response.data);
            if (response.data.status === 202) {
                Alert.alert('성공', '친구 삭제 완료');
                fetchFriends();
            } else {
                Alert.alert('실패', '친구 삭제 실패');
            }
        } catch (error) {
            console.error('Error deleting friend:', error.message);
            Alert.alert('실패', '친구 삭제 실패');
        }
    };

    const getFilteredUsers = useCallback(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const data = activeTab === 'recommend' ? users : activeTab === 'invite' ? invitedUsers : activeTab === 'request' ? (subTab === 'receive' ? requests : invitedUsers) : friends;
        return data.filter((item) =>
            item.nickname.toLowerCase().includes(lowercasedQuery) || (item.email && item.email.toLowerCase().includes(lowercasedQuery))
        );
    }, [searchQuery, activeTab, subTab, users, invitedUsers, requests, friends]);

    useEffect(() => {
        // 상태가 변경될 때마다 리렌더링
    }, [invitedUsers, requests]);

    const renderUser = ({ item }) => (
        <ListItem containerStyle={styles.listItem}>
            <TouchableOpacity onPress={() => navigation.navigate("UserAlarm", { userId: item.userId })}>
                <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={["#1BC5DA", "#263283"]}
                        style={styles.avatarGradient}
                    >
                        <Image
                            source={item.userProfileUrl ? { uri: item.userProfileUrl } : require('../../../assets/logo.png')}
                            style={styles.avatar}
                        />
                    </LinearGradient>
                </View>
            </TouchableOpacity>
            <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle} numberOfLines={1} ellipsizeMode="tail">{item.nickname}</ListItem.Title>
            </ListItem.Content>
            {activeTab === 'recommend' && (
                invitedUsers.some(invited => invited.userId === item.userId) ? (
                    <TouchableOpacity style={styles.disabledButton}>
                        <Text style={styles.disabledButtonText}>완료</Text>
                    </TouchableOpacity>
                ) : (
                    <LinearGradient colors={['#1BC5DA', '#263283']} style={styles.gradientButton}>
                        <TouchableOpacity onPress={() => inviteFriend(item.userId)}>
                            <Text style={styles.buttonText}>추가</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                )
            )}
            {activeTab === 'request' && subTab === 'receive' && (
                item.status === '수락 완료' ? (
                    <TouchableOpacity style={styles.acceptedButton}>
                        <Text style={styles.buttonText}>수락 완료</Text>
                    </TouchableOpacity>
                ) : item.status === '거절 완료' ? (
                    <TouchableOpacity style={styles.acceptedButton}>
                        <Text style={styles.buttonText}>거절 완료</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.requestButtons}>
                        <LinearGradient colors={['#1BC5DA', '#263283']} style={styles.gradientButton}>
                            <TouchableOpacity onPress={() => acceptFriendRequest(item.userId)}>
                                <Text style={styles.buttonText}>수락</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                        <LinearGradient colors={['#292929', '#292929']} style={styles.gradientButton}>
                            <TouchableOpacity onPress={() => rejectFriendRequest(item.userId)}>
                                <Text style={styles.buttonText}>거절</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )
            )}
            {activeTab === 'request' && subTab === 'send' && (
                invitedUsers.some(user => user.userId === item.userId) ? (
                    <LinearGradient colors={['#292929', '#292929']} style={styles.gradientButton}>
                        <TouchableOpacity onPress={() => cancelFriendRequest(item.userId)}>
                            <Text style={styles.buttonText}>취소</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                ) : (
                    <TouchableOpacity style={styles.disabledButton}>
                        <Text style={styles.disabledButtonText}>취소 완료</Text>
                    </TouchableOpacity>
                )
            )}
            {activeTab === 'friends' && (
                <LinearGradient colors={['#292929', '#292929']} style={styles.gradientButton}>
                    <TouchableOpacity onPress={() => deleteFriend(item.userId)}>
                        <Text style={styles.buttonText}>삭제</Text>
                    </TouchableOpacity>
                </LinearGradient>
            )}
        </ListItem>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <LinearGradient colors={activeTab === 'recommend' ? ['#1BC5DA', '#263283'] : ['#000', '#000', '#000']} style={styles.gradientTab}>
                    <TouchableOpacity onPress={() => { setActiveTab('recommend'); setSubTab('receive'); }}>
                        <Text style={[styles.tabButtonText, activeTab === 'recommend' && styles.activeTabButtonText]}>추천</Text>
                    </TouchableOpacity>
                </LinearGradient>
                <LinearGradient colors={activeTab === 'request' ? ['#1BC5DA', '#263283'] : ['#000', '#000', '#000']} style={styles.gradientTab}>
                    <TouchableOpacity onPress={() => { setActiveTab('request'); setSubTab('receive'); }}>
                        <Text style={[styles.tabButtonText, activeTab === 'request' && styles.activeTabButtonText]}>요청</Text>
                    </TouchableOpacity>
                </LinearGradient>
                <LinearGradient colors={activeTab === 'friends' ? ['#1BC5DA', '#263283'] : ['#000', '#000', '#000']} style={styles.gradientTab}>
                    <TouchableOpacity onPress={() => { setActiveTab('friends'); setSubTab('receive'); }}>
                        <Text style={[styles.tabButtonText, activeTab === 'friends' && styles.activeTabButtonText]}>목록</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
            <View style={styles.searchContainer}>
                <View style={styles.searchSection}>
                    <Icon style={styles.searchIcon} name="search" size={25} color="#D4D4D4" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="검색"
                      placeholderTextColor="#AEAEAE"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {activeTab === 'request' && (
                <View style={styles.subHeader}>
                    <LinearGradient colors={subTab === 'receive' ? ['#1BC5DA', '#263283'] : ['#000', '#000', '#000']} style={styles.subTab}>
                        <TouchableOpacity onPress={() => setSubTab('receive')}>
                            <Text style={styles.subTabButtonText}>수신</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                    <LinearGradient colors={subTab === 'send' ? ['#1BC5DA', '#263283'] : ['#000', '#000', '#000']} style={styles.subTab}>
                        <TouchableOpacity onPress={() => setSubTab('send')}>
                            <Text style={styles.subTabButtonText}>송신</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            )}
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList 
                    key={`${activeTab}-${subTab}-${refreshKey}`} 
                    style={styles.userList}
                    data={getFilteredUsers()} 
                    extraData={invitedUsers} 
                    keyExtractor={(item) => item.userId.toString()} 
                    renderItem={renderUser} 
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '92.5%',
        height: windowHeight * 0.08,
    },
        gradientTab: {
            alignItems: 'center',
            justifyContent: 'center',
            width:  "30%",
            height: "70%",
            borderRadius: windowHeight * 0.017,
        },
        activeTabButtonText: {
            color: '#fff',
            fontSize: windowHeight * 0.023,
            fontWeight: 'bold',
        },
        tabButtonText: {
            color: '#fff',
            fontSize: windowHeight * 0.023,
            fontWeight: 'bold',
        },
    
    searchContainer: {
        width: '92.5%',
        height: windowHeight * 0.07,
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: windowHeight * 0.06,
        borderRadius: windowHeight * 0.015,
        backgroundColor: '#3B3B3B',
    },
        searchIcon: {
            padding: windowHeight * 0.013,
        },
        searchInput: {
            color: '#fff',
            fontSize: windowHeight * 0.023,
        },
    
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '92.5%',
        height: windowHeight * 0.08,
    },
        subTab: {
            alignItems: 'center',
            justifyContent: 'center',
            width: "23%",
            height: "70%",
            borderRadius: windowHeight * 0.0175,
        },
        subTabButtonText: {
            color: '#fff',
            fontSize: windowHeight * 0.022,
            fontWeight: 'bold',
        },
    
    userList: {
        width: '92.5%',
    },
    listItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: windowHeight * 0.1,
        width: '100%',
        borderRadius: windowHeight * 0.015,
        marginVertical: windowHeight * 0.008,
        paddingHorizontal: windowWidth * 0.02,
        backgroundColor: '#fff',
    },
        avatarContainer: {
            height: windowHeight * 0.078,
            width: windowHeight * 0.078,
        },
            avatarGradient: {
                alignItems: "center",
                justifyContent: "center",
                height: windowHeight * 0.078,
                width: windowHeight * 0.078,
                borderRadius: windowHeight,
            },
            avatar: {
                height: windowHeight * 0.072,
                width: windowHeight * 0.072,
                borderRadius: windowHeight,
                borderWidth: windowHeight * 0.002,
                borderColor: "white",
            },
        listItemTitle: {
            color: '#000',
            fontSize: windowHeight * 0.02,
            fontWeight: 'bold',
        },
    
        gradientButton: {
            justifyContent: 'center',
            alignItems: 'center',
            height: windowHeight * 0.05,
            width: windowWidth * 0.17,
            borderRadius: windowHeight * 0.017,
            marginRight: windowWidth * 0.03,
        },
            buttonText: {
                color: '#fff',
                fontSize: windowHeight * 0.0175,
                fontWeight: 'bold',
            },
        disabledButton: {
            alignItems: 'center',
            justifyContent: 'center',
            height: windowHeight * 0.05,
            width: windowWidth * 0.17,
            borderRadius: windowHeight * 0.017,
            marginRight: windowWidth * 0.03,
            backgroundColor: '#292929',
        },
            disabledButtonText: {
                backgroundColor: '#292929',
                color: '#fff',
                fontSize: 14,
            },
    
        requestButtons: {
            flexDirection: 'row',
            width: windowWidth * 0.372,
            marginRight: windowWidth * 0.03,
        },
            acceptedButton: {
                alignItems: 'center',
                justifyContent: 'center',
                width: windowWidth * 0.215,
                height: windowHeight * 0.05,
                borderRadius: windowHeight * 0.017,
                marginRight: windowWidth * 0.03,
                backgroundColor: '#292929',
            },
});

export default FriendsScreen;