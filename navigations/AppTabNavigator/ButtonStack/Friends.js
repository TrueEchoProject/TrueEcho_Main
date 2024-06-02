import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import Api from '../../../Api';
import * as SecureStore from 'expo-secure-store';

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
	const [users, setUsers] = useState([]);
	const [invitedUsers, setInvitedUsers] = useState([]);
	const [requests, setRequests] = useState([]);
	const [friends, setFriends] = useState([]);
	const [loading, setLoading] = useState(false);
	
	useEffect(() => {
		setLoading(true);
		if (activeTab === 'invite') {
			fetchInvitedUsers();
		} else if (activeTab === 'recommend') {
			fetchRecommendedUsers();
		} else if (activeTab === 'request') {
			fetchFriendRequests();
		} else if (activeTab === 'friends') {
			fetchFriends();
		}
	}, [activeTab]);
	
	const fetchRecommendedUsers = useCallback(async () => {
		try {
			const response = await Api.get('/friends/recommend');
			console.log('Recommended users response:', response.data); // 응답 데이터 확인
			if (response.data && Array.isArray(response.data.data)) {
				setUsers(response.data.data);
			} else {
				setUsers([]); // 기본값 설정
			}
		} catch (error) {
			Alert.alert('에러', '추천 친구 목록을 불러오는 중 에러가 발생했습니다.');
		} finally {
			setLoading(false);
		}
	}, []);
	
	const fetchInvitedUsers = useCallback(async () => {
		try {
			const response = await Api.get('/friends/confirmRequest/send');
			console.log('Invited users response:', response.data); // 응답 데이터 확인
			if (response.data && Array.isArray(response.data.data)) {
				setInvitedUsers(response.data.data);
				console.log('Invited users state set:', response.data.data); // 상태 설정 확인
			} else {
				setInvitedUsers([]); // 기본값 설정
			}
		} catch (error) {
			Alert.alert('에러', '보낸 친구 요청 목록을 불러오는 중 에러가 발생했습니다.');
		} finally {
			setLoading(false);
		}
	}, []);
	
	const fetchFriendRequests = useCallback(async () => {
		try {
			const response = await Api.get('/friends/confirmRequest/receive');
			console.log('Friend requests response:', response.data); // 응답 데이터 확인
			if (response.data && Array.isArray(response.data.data)) {
				setRequests(response.data.data);
			} else {
				setRequests([]); // 기본값 설정
			}
		} catch (error) {
			Alert.alert('에러', '받은 친구 요청 목록을 불러오는 중 에러가 발생했습니다.');
		} finally {
			setLoading(false);
		}
	}, []);
	
	const fetchFriends = useCallback(async () => {
		try {
			const response = await Api.get('/friends/read');
			console.log('Friends response:', response.data); // 응답 데이터 확인
			if (response.data && Array.isArray(response.data.data)) {
				const friends = response.data.data; // 전체 데이터를 사용
				setFriends(friends);
			} else {
				setFriends([]); // 기본값 설정
			}
		} catch (error) {
			Alert.alert('에러', '친구 목록을 불러오는 중 에러가 발생했습니다.');
		} finally {
			setLoading(false);
		}
	}, []);
	
	const inviteFriend = async (userId) => {
		try {
			console.log('Inviting friend with userId:', userId);
			const formData = new FormData();
			formData.append('targetUserId', userId);
			const response = await Api.post('/friends/add', formData);
			console.log('Invite friend response:', response.data);
			if (response.data.success) {
				const invitedUser = users.find(user => user.userId === userId);
				setInvitedUsers([...invitedUsers, invitedUser]);
				Alert.alert('성공', '친구 초대 완료');
			} else {
				Alert.alert('실패', '친구 초대 실패');
			}
		} catch (error) {
			console.error('Error inviting friend:', error.message);
			Alert.alert('실패', '친구 초대 실패');
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
			console.log('Accept friend request response:', response.data); // 응답 데이터 확인
			if (response.data.status === 202) {
				Alert.alert('성공', '친구 요청 수락 완료');
				fetchFriendRequests();
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
			console.log('Reject friend request response:', response.data); // 응답 데이터 확인
			if (response.data.status === 202) {
				Alert.alert('성공', '친구 요청 거절 완료');
				fetchFriendRequests();
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
			console.log('Delete friend response:', response.data); // 응답 데이터 확인
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
		const data = activeTab === 'recommend' ? users : activeTab === 'invite' ? invitedUsers : activeTab === 'request' ? requests : friends;
		return data.filter((item) =>
			item.nickname.toLowerCase().includes(lowercasedQuery) || (item.email && item.email.toLowerCase().includes(lowercasedQuery))
		);
	}, [searchQuery, activeTab, users, invitedUsers, requests, friends]);
	
	const renderUser = ({ item }) => (
		<ListItem>
			<Avatar source={{ uri: item.userProfileUrl }} rounded />
			<ListItem.Content>
				<ListItem.Title>{item.nickname}</ListItem.Title>
				{item.email && <ListItem.Subtitle>{item.email}</ListItem.Subtitle>}
			</ListItem.Content>
			{activeTab === 'recommend' && <Button title="친구 추가" onPress={() => inviteFriend(item.userId)} />}
			{activeTab === 'request' && (
				<View style={styles.requestButtons}>
					<Button title="수락" onPress={() => acceptFriendRequest(item.userId)} />
					<Button title="거절" onPress={() => rejectFriendRequest(item.userId)} />
				</View>
			)}
			{activeTab === 'friends' && <Button title="삭제" onPress={() => deleteFriend(item.userId)} />}
		</ListItem>
	);
	
	return (
		<View style={styles.container}>
			<TextInput
				style={styles.searchInput}
				placeholder="친구 추가 또는 검색"
				value={searchQuery}
				onChangeText={setSearchQuery}
			/>
			{loading ? (
				<ActivityIndicator size="large" color="#0000ff" />
			) : (
				<FlatList data={getFilteredUsers()} keyExtractor={(item) => item.userId.toString()} renderItem={renderUser} />
			)}
			<View style={styles.footer}>
				<Button title="추천" onPress={() => setActiveTab('recommend')} color={activeTab === 'recommend' ? 'blue' : 'gray'} />
				<Button title="초대" onPress={() => setActiveTab('invite')} color={activeTab === 'invite' ? 'blue' : 'gray'} />
				<Button title="친구 요청" onPress={() => setActiveTab('request')} color={activeTab === 'request' ? 'blue' : 'gray'} />
				<Button title="친구 목록" onPress={() => setActiveTab('friends')} color={activeTab === 'friends' ? 'blue' : 'gray'} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
	searchInput: {
		fontSize: 18,
		padding: 10,
		margin: 10,
		borderWidth: 1,
		borderColor: '#ccc',
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 10,
	},
	requestButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: 100,
	},
});

export default FriendsScreen;
