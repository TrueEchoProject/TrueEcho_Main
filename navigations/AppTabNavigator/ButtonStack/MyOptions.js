import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import { FontAwesome5, AntDesign, FontAwesome6, MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';

const OptionText = ({ label }) => {
	return <Text style={styles.smallText}>{label}</Text>;
};
const OptionItem = ({ icon, iconType, label, backgroundColor = "#99A1B6" }) => {
	const IconComponent = iconType;
	return (
		<TouchableOpacity>
			<View style={[styles.View, { backgroundColor }]}>
				<IconComponent name={icon} style={{marginRight: 15}} size={30} color="black" />
				<Text style={styles.smallText}>{label}</Text>
			</View>
		</TouchableOpacity>
	);
};

const MyOptions = () =>{
	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={{margin: 10}}>
					<View style={styles.View}>
						<View style={styles.Image}/>
						<View style={{marginLeft: 10}}>
							<Text style={styles.Text}>박신형</Text>
							<Text style={styles.Text}>sin1234</Text>
						</View>
					</View>
					<View>
						<OptionText label="기능"/>
						<OptionItem iconType={FontAwesome5} icon="calendar-alt" label="캘린더"/>
					</View>
					<View>
						<OptionText label="설정"/>
						<OptionItem iconType={AntDesign} icon="bells" label="알림" />
						<OptionItem iconType={FontAwesome6} icon="user-shield" label="개인정보 보호" />
						<OptionItem iconType={MaterialIcons} icon="phonelink-ring" label="시간대" />
					</View>
					<View>
						<OptionText label="더보기"/>
						<OptionItem iconType={AntDesign} icon="sharealt" label="공유" />
						<OptionItem iconType={Entypo} icon="chat" label="도움받기" />
					</View>
					<View style={{marginTop: 30}}>
						<OptionItem iconType={Entypo} icon="log-out" label="로그아웃" backgroundColor="grey" />
						<OptionItem iconType={Ionicons} icon="alert-circle" label="계정 삭제" backgroundColor="red" />
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	scrollView: {
		margin: 20,
	},
	View: {
		flexDirection: "row",
		alignItems: "center",
		padding: 20,
		borderRadius: 15,
		backgroundColor: "#99A1B6",
		marginBottom: 10,
	},
	Image: {
		width: 74,
		height: 74,
		borderRadius: 37,
		backgroundColor: 'white',
	},
	Text: {
		fontSize: 25,
		fontWeight: "300",
	},
	smallText: {
		fontSize: 22,
		fontWeight: "300",
		margin: 10,
	}
})
export default MyOptions;