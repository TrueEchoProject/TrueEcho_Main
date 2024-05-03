import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import axios from "axios";

const days = ["일", "월", "화", "수", "목", "금", "토"];
const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

const Calendar = () => {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedDay, setSelectedDay] = useState(null);
	const [specificDates, setSpecificDates] = useState({});
	
	const fetchCalendar = async () => {
		try {
			const response = await axios.get(`http://192.168.0.3:3000/user_calendar`);
			const calendarData = response.data;
			const newSpecificDates = {};
			calendarData.forEach(item => {
				newSpecificDates[item.created_at] = item.post_back_url;
			});
			setSpecificDates(newSpecificDates);
		} catch (error) {
			console.error('Error fetching calendar data', error);
		}
	};
	useEffect(() => {
		if (specificDates) {
			console.log(specificDates);
		}
	}, [specificDates]); // userData 변화 감지
	useEffect(() => {
		fetchCalendar();
	}, []);
	
	
	const generateMatrix = () => {
		let matrix = [days.map(day => ({ day }))];
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
									onPress={toggleImageVisibility}
									disabled={rowIndex === 0 || !item.day}>
									<ImageBackground source={{ uri: item.imageUrl }} style={styles.backgroundImage}>
										<Text style={styles.dateImageText}>{item.day}</Text>
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
	dateImageText: {
		color: 'white',
		fontWeight: 'bold',
	},
	monthLabel: {
		fontSize: 18,
		fontWeight: 'bold',
	},
});

export default Calendar;
