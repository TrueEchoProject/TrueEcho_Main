import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';

const days = ["일", "월", "화", "수", "목", "금", "토"];
const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

const Calendar = () => {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedDay, setSelectedDay] = useState(null);
	const [specificDates, setSpecificDates] = useState({
		'2024-04-15': 'https://ppss.kr/wp-content/uploads/2020/07/01-4-540x304.png',
		'2024-04-20': 'https://ppss.kr/wp-content/uploads/2020/07/01-4-540x304.png'
	});
	
	const handleDayPress = (day, isInCurrentMonth) => {
		const year = currentMonth.getFullYear()
		const month = currentMonth.getMonth()
		const formattedMonth = month < 9 ? `0${month + 1}` : month + 1;
		const formattedDay = day < 10 ? `0${day}` : day;
		const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
		if (isInCurrentMonth) {
			setSelectedDay(formattedDate);
		}
	};
	
	const generateMatrix = () => {
		let matrix = [];
		matrix[0] = days.map(day => ({ day })); // 요일 이름을 객체 형태로 변환하여 첫 행에 할당
		
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const firstDay = new Date(year, month, 1).getDay();
		const maxDays = new Date(year, month + 1, 0).getDate();
		let counter = 1 - firstDay;
		
		for (let row = 1; row < 7; row++) {
			matrix[row] = [];
			for (let col = 0; col < 7; col++, counter++) {
				const day = counter > 0 && counter <= maxDays ? counter : '';
				const dateKey = `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${day < 10 ? `0${day}` : day}`;
				matrix[row][col] = {
					day,
					isInCurrentMonth: day !== '',
					imageUrl: specificDates[dateKey]
				};
			}
		}
		return matrix;
	};
	
	const renderCalendar = () => {
		const matrix = generateMatrix();
		return (
			<View style={styles.calendar}>
				{matrix.map((row, rowIndex) => (
					<View style={styles.row} key={rowIndex}>
						{row.map((item, colIndex) => (
							item.imageUrl && rowIndex !== 0 ? (
								<TouchableOpacity
									key={colIndex}
									style={styles.cell}
									onPress={() => rowIndex !== 0 && item.day && handleDayPress(item.day, item.isInCurrentMonth)}
									disabled={rowIndex === 0 || !item.day}>
									<ImageBackground source={{ uri: item.imageUrl }} style={styles.backgroundImage}>
										<Text style={styles.dateText}>{item.day}</Text>
									</ImageBackground>
								</TouchableOpacity>
							) : (
								<View
									key={colIndex}
									style={styles.cell}
								>
									<Text style={styles.dateText}>{item.day}</Text>
								</View>
							)
						))}
					</View>
				))}
			</View>
		);
	};
	
	return (
		<SafeAreaView style={styles.bg}>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.monthLabel}>{currentMonth.getFullYear()}년 {months[currentMonth.getMonth()]}월</Text>
				</View>
				{renderCalendar()}
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	bg: {
		backgroundColor: 'rgba(0,0,0,0.3)',
		flex: 1,
		justifyContent: "center",
	},
	container: {
		backgroundColor: "#FFF",
		borderRadius: 8,
		width: "90%",
		height: "90%",
		marginLeft: "5%",
		marginRight: "5%",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "90%",
		marginLeft: "5%",
		marginRight: "5%",
		padding: 20,
		paddingBottom: 10,
	},
	calendar: {
		width: "90%",
		marginLeft: "5%",
		marginRight: "5%",
		height: 280,
		justifyContent: "space-between",
	},
	row: {
		flexDirection: "row",
	},
	cell: {
		flex: 1,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	backgroundImage: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	dateText: {
		color: '#000',
	},
	monthLabel: {
		fontSize: 18,
		fontWeight: 'bold',
	},
});

export default Calendar;
