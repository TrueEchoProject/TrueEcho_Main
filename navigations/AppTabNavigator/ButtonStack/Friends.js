import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import { nodeServerApi } from '../../../Api';

const FriendsScreen = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState('recommend');
	const [users, setUsers] = useState([]);
	const [invitedUsers, setInvitedUsers] = useState([]);
	const [requests, setRequests] = useState([]);
	const [friends, setFriends] = useState([]);
	
	useEffect(() => {
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
	
	const fetchRecommendedUsers = async () => {
		try {
			console.log('Fetching recommended users from /friends/recommend');
			const response = await nodeServerApi.get(`/friends/recommend?user_id=${currentUser.id}`);
			const recommendedUserIds = response.data;
			
			const userResponses = await Promise.all(recommendedUserIds.map(userId => nodeServerApi.get(`/users/${userId}`)));
			const recommendedUsers = userResponses.map(res => res.data);
			
			console.log('Fetched recommended users:', recommendedUsers);
			setUsers(recommendedUsers);
		} catch (error) {
			console.error('Error fetching recommended users:', error.message);
			Alert.alert('에러', '추천 친구 목록을 불러오는 중 에러가 발생했습니다.');
		}
	};
	
	const fetchInvitedUsers = async () => {
		try {
			console.log('Fetching invited users from /friends/confirmRequest/send');
			const response = await nodeServerApi.get(`/friends/confirmRequest/send?sendUserId=${currentUser.id}`);
			console.log('Fetched invited users:', response.data);
			setInvitedUsers(response.data);
		} catch (error) {
			console.error('Error fetching invited users:', error.message);
			Alert.alert('에러', '보낸 친구 요청 목록을 불러오는 중 에러가 발생했습니다.');
		}
	};
	
	const fetchFriendRequests = async () => {
		try {
			console.log('Fetching friend requests from /friends/confirmRequest/receive');
			const response = await nodeServerApi.get('/friends/confirmRequest/receive');
			console.log('Fetched friend requests:', response.data);
			setRequests(response.data);
		} catch (error) {
			console.error('Error fetching friend requests:', error.message);
			Alert.alert('에러', '받은 친구 요청 목록을 불러오는 중 에러가 발생했습니다.');
		}
	};
	
	const fetchFriends = async () => {
		try {
			console.log('Fetching friends from /friends/read');
			const response = await nodeServerApi.get(`/friends/read?userId=${currentUser.id}`);
			console.log('Fetched friends:', response.data);
			
			const friends = response.data.filter(friend =>
				(friend.sendUserId === currentUser.id || friend.targetUserId === currentUser.id) &&
				friend.friend_status === 'FRIEND'
			);
			setFriends(friends);
		} catch (error) {
			console.error('Error fetching friends:', error.message);
			Alert.alert('에러', '친구 목록을 불러오는 중 에러가 발생했습니다.');
		}
	};
	
	const inviteFriend = async (userId) => {
		try {
			console.log('Inviting friend with userId:', userId);
			const response = await nodeServerApi.post('/friends/add', { targetUserId: userId });
			console.log('Invite friend response:', response.data);
			if (response.data.success) {
				const invitedUser = users.find(user => user.user_id === userId);
				setInvitedUsers([...invitedUsers, invitedUser]);
				Alert.alert('성공', '친구 초대 완료');
			}
		} catch (error) {
			console.error('Error inviting friend:', error.message);
			Alert.alert('실패', '친구 초대 실패');
		}
	};
	
	const acceptFriendRequest = async (userId) => {
		try {
			console.log('Accepting friend request for userId:', userId);
			const response = await nodeServerApi.put('/friends/accept', {
				targetUserId: currentUser.id,
				sendUserId: userId,
				friend_status: 'FRIEND'
			});
			console.log('Accept friend request response:', response.data);
			if (response.data.success) {
				Alert.alert('성공', '친구 요청 수락 완료');
				fetchFriendRequests();
				fetchFriends();
			}
		} catch (error) {
			console.error('Error accepting friend request:', error.message);
			Alert.alert('실패', '친구 요청 수락 실패');
		}
	};
	
	const rejectFriendRequest = async (userId) => {
		try {
			console.log('Rejecting friend request for userId:', userId);
			const response = await nodeServerApi.delete('/friends/reject', {
				data: {
					targetUserId: currentUser.id,
					sendUserId: userId
				}
			});
			console.log('Reject friend request response:', response.data);
			if (response.data.success) {
				Alert.alert('성공', '친구 요청 거절 완료');
				fetchFriendRequests();
			}
		} catch (error) {
			console.error('Error rejecting friend request:', error.message);
			Alert.alert('실패', '친구 요청 거절 실패');
		}
	};
	
	const deleteFriend = async (friendId) => {
		try {
			console.log('Deleting friend with friendId:', friendId);
			const response = await nodeServerApi.delete('/friends/delete', {
				data: { friendId }
			});
			console.log('Delete friend response:', response.data);
			if (response.data.success) {
				Alert.alert('성공', '친구 삭제 완료');
				fetchFriends();
			}
		} catch (error) {
			console.error('Error deleting friend:', error.message);
			Alert.alert('실패', '친구 삭제 실패');
		}
	};
	
	const getFilteredUsers = () => {
		const lowercasedQuery = searchQuery.toLowerCase();
		const data = activeTab === 'recommend' ? users : activeTab === 'invite' ? invitedUsers : activeTab === 'request' ? requests : friends;
		return data.filter(item =>
			item.nickname.toLowerCase().includes(lowercasedQuery) || item.email.toLowerCase().includes(lowercasedQuery)
		);
	};
	
	const renderUser = ({ item }) => (
		<ListItem>
			<Avatar source={{ uri: item.profile_url }} rounded />
			<ListItem.Content>
				<ListItem.Title>{item.nickname}</ListItem.Title>
				<ListItem.Subtitle>{item.email}</ListItem.Subtitle>
			</ListItem.Content>
			{activeTab === 'recommend' && (
				<Button title="친구 추가" onPress={() => inviteFriend(item.user_id)} />
			)}
			{activeTab === 'request' && (
				<View style={styles.requestButtons}>
					<Button title="수락" onPress={() => acceptFriendRequest(item.user_id)} />
					<Button title="거절" onPress={() => rejectFriendRequest(item.user_id)} />
				</View>
			)}
			{activeTab === 'friends' && (
				<Button title="삭제" onPress={() => deleteFriend(item.friendId)} />
			)}
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
			<FlatList
				data={getFilteredUsers()}
				keyExtractor={(item) => item.user_id.toString()}
				renderItem={renderUser}
			/>
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
		flex: 1, padding: 10,
	},
	searchInput: {
		fontSize: 18, padding: 10, margin: 10, borderWidth: 1, borderColor: '#ccc',
	},
	footer: {
		flexDirection: 'row', justifyContent: 'space-around', padding: 10,
	},
	requestButtons: {
		flexDirection: 'row', justifyContent: 'space-between', width: 100,
	},
});

export default FriendsScreen;
