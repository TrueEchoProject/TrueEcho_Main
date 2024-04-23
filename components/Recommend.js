import React, {useState} from 'react';
import {View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, } from 'react-native';
import axios from "axios";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const recommendations = [
	{
		"Recommendation_id": 1,
		"username": "진우_late_PUBLIC_일산동구",
		"profile_url": "https://cdn.discordapp.com/attachments/990816789246124032/1224155380670529666/barcaopeth1989_Construct_an_ultra-realistic_architectural_maque_bc564ebc-342a-490e-b142-f4b62ab1caad.png?ex=661c768a&is=660a018a&hm=39423115c81c929cfef9effb9af94bb5a16dbed617a83dad7380802defd29dc1&",
		"friend": 1
	},
	{
		"Recommendation_id": 2,
		"username": "민서_free_PUBLIC_일산동구",
		"profile_url": "https://cdn.discordapp.com/attachments/990816789246124032/1224141591980146708/journeyrhodes_70223_coloring_page_thin_lines_silly_doodles_a_sm_44427d02-4637-4f81-a2ee-4ea87a161632.png?ex=661c69b2&is=6609f4b2&hm=6db82c847dcbd44b3f683fa1032595dbda5facff0915a241338b35839de4de6f&",
		"friend": 1
	},
	{
		"Recommendation_id": 3,
		"username": "나은_onTime_PUBLIC_일산동구",
		"profile_url": "https://cdn.discordapp.com/attachments/990816789246124032/1224105150780543216/starfire4777_psychadelic_Easter_egg_25d346ea-9b57-4b36-8574-3b8271010f89.png?ex=661c47c2&is=6609d2c2&hm=1604573f6fde060920bb62348f1391b677e73f300bdab1a92feb48d3062d5171&",
		"friend": 1
	},
	{
		"Recommendation_id": 4,
		"username": "예린_free_FRIEND_장안구",
		"profile_url": "https://cdn.discordapp.com/attachments/990816789246124032/1224152435585585253/barcaopeth1989_Develop_an_ultra-realistic_architectural_maquett_214eaae1-58bc-4f96-94b4-df1034f9cc3d.png?ex=661c73cc&is=6609fecc&hm=c965bdef307512dc00846097a8264c97d1dd9556f83b3736abad881476766c42&",
		"friend": 1
	}
];

const Recommend = () => {
	const [friendsStatus, setFriendsStatus] = useState(recommendations.map(() => false)); // 각 항목의 친구 추가 상태를 배열로 관리
	
	const toggleFriendSend = async (index, item) => {
		console.log(item.username);
		try {
			await axios.post(`http://192.168.0.3:3000/friendSend`, {
				friendSendUser: item.username
			});
			console.log('Send updated successfully');
			const newFriendsStatus = [...friendsStatus];
			newFriendsStatus[index] = true; // 특정 인덱스의 상태를 true로 변경
			setFriendsStatus(newFriendsStatus);
		} catch (error) {
			console.error('Error updating Send:', error);
		}
	};
	
	return (
		<View style={styles.container}>
			{recommendations.map((item, index) => (
				<View key={item.Recommendation_id} style={styles.card}>
					<Image source={{ uri: item.profile_url }} style={styles.image} />
					<Text style={styles.username}>{item.username}</Text>
					{!friendsStatus[index] ? (
						<TouchableOpacity onPress={() => toggleFriendSend(index, item)} style={styles.button}>
							<Text style={styles.buttonText}>친구 추가</Text>
						</TouchableOpacity>
					) : (
						<View style={styles.button}>
							<Text style={styles.buttonText}>추가 완료</Text>
						</View>
					)}
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		alignItems: 'center'
	},
	card: {
		width:windowWidth * 0.8,
		height:windowHeight * 0.17,
		justifyContent: "center",
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 10,
		marginBottom: 10,
		alignItems: 'center',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	image: {
		width: 45,
		height: 45,
		borderRadius: 45,
		marginTop: 10,
	},
	username: {
		marginTop: 10,
		marginBottom: 10,
	},
	button: {
		backgroundColor: "#3B4664",
		padding: 5,
		marginBottom: 10,
		borderRadius: 3,
		alignItems: 'center',
		justifyContent: 'center'
	},
	buttonText: {
		fontSize: 15,
		color: "white",
	},
});

export default Recommend;