import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ProgressChart } from 'react-native-chart-kit';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ResultPage = ({ question, topRankList, thisWeek }) => {
	const screenWidth = wp('80%');
	
	// Colors for each rank
	const colors = [
		'rgba(255, 99, 132, 1)',
		'rgba(54, 162, 235, 1)',
		'rgba(255, 206, 86, 1)',
		'rgba(75, 192, 192, 1)',
		'rgba(153, 102, 255, 1)',
		'rgba(255, 159, 64, 1)',
	];
	
	const data = {
		labels: topRankList.map(rank => ''), // Empty labels
		data: topRankList.map(rank => rank.voteCount / Math.max(...topRankList.map(rank => rank.voteCount))),
	};
	
	const chartConfig = {
		backgroundGradientFrom: '#f8f8f8',
		backgroundGradientTo: '#f8f8f8',
		color: (opacity = 1, index) => colors[index % colors.length],
		strokeWidth: 2,
		barPercentage: 0.5,
		useShadowColorFromDataset: false,
	};
	
	return (
		<View style={styles.page}>
			<Text style={styles.weekText}>
				<FontAwesome name="trophy" size={hp('4%')} color="gold" style={styles.trophyIcon} /> 주간 랭킹 : {thisWeek}
			</Text>
			<ProgressChart
				data={data}
				width={screenWidth}
				height={hp('30%')}
				chartConfig={chartConfig}
				style={styles.chartStyle}
			/>
			<View style={[styles.profileContainer, topRankList.length === 1 ? styles.centerAlign : styles.spaceAround]}>
				{topRankList.map((rank, index) => (
					<View key={rank.id.toString()} style={styles.profileItem}>
						<Image source={{ uri: rank.profileUrl }} style={styles.profileImage} />
						<Text style={[styles.nicknameText, { color: colors[index % colors.length] }]}>
							{rank.nickname}
						</Text>
						<Text style={styles.rankText}>{index + 1}위 ({rank.voteCount} 표)</Text>
					</View>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	page: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: wp('5%'),
		backgroundColor: '#fff',
		borderRadius: wp('2%'),
		elevation: 3,
	},
	weekText: {
		fontSize: hp('3%'),
		color: '#333',
		fontWeight: '600',
		marginBottom: hp('2%'),
	},
	trophyIcon: {
		marginVertical: hp('1%'),
	},
	profileContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		marginTop: hp('3%'),
	},
	spaceAround: {
		justifyContent: 'space-around',
	},
	centerAlign: {
		justifyContent: 'center',
	},
	profileItem: {
		alignItems: 'center',
		marginHorizontal: wp('2%'),
	},
	profileImage: {
		width: wp('15%'),
		height: wp('15%'),
		borderRadius: wp('7.5%'),
		marginBottom: hp('1%'),
	},
	nicknameText: {
		fontSize: hp(2),
		fontWeight: 'bold',
		textAlign: 'center',
	},
	rankText: {
		fontSize: hp('2%'),
		color: '#333',
		textAlign: 'center',
	},
	chartStyle: {
		borderRadius: wp('2%'),
		marginVertical: hp('2%'),
		fontSize: hp(5),
	}
});

export default ResultPage;
