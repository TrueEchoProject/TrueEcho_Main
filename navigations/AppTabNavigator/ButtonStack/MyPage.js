import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import PagerView from "react-native-pager-view";

const MyPage = () =>{
	return (
		<View style={styles.container}>
			<View style={styles.topContainer}>
				<View style={{
					width: 74,
					height: 74,
					borderRadius: 37,
					backgroundColor: 'grey',
				}}>
				</View>
				<View style={{
					flexDirection: "row",
					alignItems: 'flex-end',
					marginTop: 5,
				}}>
					<Text style={{ fontSize: 30, fontWeight: "300" }}>박신형</Text>
					<FontAwesome5
						name="crown"
						style={{ marginLeft:10, marginBottom: 10, }}
						size={24} color="blue"
					/>
				</View>
				<View style={{
					flexDirection: "row",
					alignItems: 'flex-end',
				}}>
					<Text>이성 친구가 제일 많을 거 같은 친구</Text>
				</View>
			</View>
			<View style={styles.pinsContainer}>
				<Text style={styles.pinsTitle}>Pins</Text>
				<PagerView style={styles.pagerView}>
					<View key="1" style={styles.pageStyle}>
						<Text style={[styles.pinsTitle, {color: "white"}]}>1</Text>
					</View>
					<View key="2" style={styles.pageStyle}>
						<Text style={[styles.pinsTitle, {color: "white"}]}>2</Text>
					</View>
					<View key="3" style={styles.pageStyle}>
						<Text style={[styles.pinsTitle, {color: "white"}]}>3</Text>
					</View>
					<View key="4" style={styles.pageStyle}>
						<Text style={[styles.pinsTitle, {color: "white"}]}>4</Text>
					</View>
					<View key="5" style={styles.pageStyle}>
						<Text style={[styles.pinsTitle, {color: "white"}]}>5</Text>
					</View>
				</PagerView>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	topContainer: {
		flexGrow: 0,
		margin: 30,
		marginBottom: 20,
	},
	pinsContainer: {
		flex: 1,
		backgroundColor: "yellow",
		marginHorizontal: 30,
		marginBottom: 20, // 하단 마진을 추가합니다.
	},
	pinsTitle: {
		fontSize: 25,
		fontWeight: "300",
	},
	pagerView: {
		flex: 1,
		marginTop: 10,
		borderRadius: 10,
		backgroundColor: 'red',
	},
	pageStyle: {
		margin: 10,
		justifyContent: 'center', // 자식 컴포넌트를 수직 방향으로 중앙 정렬
		alignItems: 'center',     // 자식 컴포넌트를 수평 방향으로 중앙 정렬
		borderRadius: 10,
		backgroundColor: 'blue',   // 배경 색상은 예시이며 변경 가능합니다
	},
})
export default MyPage;