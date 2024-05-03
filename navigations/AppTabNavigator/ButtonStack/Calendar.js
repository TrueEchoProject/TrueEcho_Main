import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
export default class Calendar extends Component {
	render() {
		return (
			<View style={style.container}>
				<View style={style.calendar}>
					<RNCalendar
						hideArrows={true}
						onDayPress={(day) => { console.log('selected day', day); }}
						onMonthChange={(month) => { console.log('month changed', month); }}
						monthFormat={'yyyy MM'}
						hideExtraDays={true}
						firstDay={1}
						theme={{
							'stylesheet.day.basic': {
								base: {
									width: 60,  // 셀의 너비를 60으로 설정
									height: 60, // 셀의 높이를 60으로 설정
									alignItems: 'center',
									justifyContent: 'center'
								},
								text: {
									fontSize: 16,  // 날짜 텍스트의 폰트 크기 설정
								}
							},
							'stylesheet.calendar.header': {
								week: {
									marginTop: 5,
									marginBottom: 5,
									flexDirection: 'row',
									justifyContent: 'space-between',
									paddingHorizontal: 10
								},
								dayHeader: {
									marginTop: 2,
									marginBottom: 7,
									width: 34,
									textAlign: 'center',
									fontSize: 16,
									fontWeight: 'bold'
								}
							},
							selectedDayTextColor: '#6491ff',
							selectedDayBackgroundColor: '#eef6ff',
							todayTextColor: '#ffffff',
							todayBackgroundColor: '#6491ff',
							dayTextColor: '#616d82',
							textDisabledColor: '#d9e1e8',
							arrowColor: 'orange',
							textDayFontFamily: 'monospace',
							textMonthFontFamily: 'monospace',
							textDayHeaderFontFamily: 'monospace',
							textDayFontWeight: '300',
							textMonthFontWeight: 'bold',
						}}
					/>
				</View>
			</View>
		);
	}
}

const style = StyleSheet.create({
	container: {
		flex: 1,  // 이 값에 따라 사용 가능한 공간을 모두 채우거나, 조절 가능
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'white',
	},
	calendar: {
		width: screenWidth, // 전체 화면 너비 사용
		height: screenHeight * 0.65, // 화면 높이의 절반 사용
	}
});
