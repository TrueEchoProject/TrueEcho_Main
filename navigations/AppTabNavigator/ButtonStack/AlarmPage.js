import React, { useState, } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Alarm = () => {
	const [selected, setSelected] = useState("랭킹");
	const [alarmList, setAlarmList] = useState([
		"랭킹", "투표 결과", "댓글", "좋아요",
	]);
	
	const toggleSetting = (item) => {
		setSelected(item); // 선택된 항목을 직접 설정
	};
	
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				{alarmList.map((item, index) => (
					<TouchableOpacity
						onPress={() => toggleSetting(item)}
						key={index}
						style={[
							styles.headerButton,
							selected === item ? styles.active : styles.inactive
						]}>
						<Text style={selected === item ? styles.activeText : styles.inactiveText}>{item}</Text>
					</TouchableOpacity>
				))}
			</View>
			<View style={styles.bottomContainer}>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	bottomContainer: {
		flex: 1,
		backgroundColor: "grey",
		borderWidth: 1,
		borderColor: "red",
	},
	header: {
		width: "100%",
		height: 50,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomWidth: 1,
		flexDirection: 'row',
	},
	headerButton: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
		padding: 10,
		margin: 3,
		borderRadius: 5,
	},
	active: {
		backgroundColor: '#3B4664', // 활성화 시 녹색
	},
	inactive: {
		backgroundColor: '#ddd', // 비활성화 시 회색
	},
	activeText: {
		color: 'white',
	},
	inactiveText: {
		color: 'grey',
	},
});
export default Alarm;