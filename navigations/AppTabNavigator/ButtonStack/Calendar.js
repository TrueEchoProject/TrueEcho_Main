import React, { useState, useEffect } from 'react'
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
} from 'react-native'

const days = ["일", "월", "화", "수", "목", "금", "토",]
const months = [
	"01",
	"02",
	"03",
	"04",
	"05",
	"06",
	"07",
	"08",
	"09",
	"10",
	"11",
	"12",
]

const Calendar = () => {
	const [currentMonth, setCurrentMonth] = useState(new Date())
	const [selectedDay, setSelectedDay] = useState(null)
	const [specificDates, setSpecificDates] = useState([])
	const [checkDate, setCheckDate] = useState("")
	
	const handleDayPress = (day, isInCurrentMonth) => {
		const year = currentMonth.getFullYear()
		const month = currentMonth.getMonth()
		
		if (isInCurrentMonth) {
			const formattedMonth = month < 9 ? `0${month + 1}` : month + 1;
			const formattedDay = day < 10 ? `0${day}` : day;
			const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
			setSelectedDay(day);
			setCheckDate(formattedDate)
		}
	};
	
	const generateMatrix = () => {
		let matrix = [];
		matrix[0] = days;
		
		let year = currentMonth.getFullYear();
		let month = currentMonth.getMonth();
		let firstDay = new Date(year, month, 1).getDay();
		let maxDays = new Date(year, month + 1, 0).getDate()
		
		let counter = -firstDay + 1;
		for (let row = 1; row < 7; row++) {
			matrix[row] = [];
			for (let col = 0; col < 7; col++) {
				let cellValue = counter > 0 && counter <= maxDays ? counter : "";
				matrix[row][col] = {
					day: cellValue,
					isInCurrentMonth: counter > 0 && counter <= maxDays
				}
				counter++;
			}
		}
		return matrix;
	}
	
	const renderCalendar = () => {
		let matrix = generateMatrix();  // 날짜 데이터 생성
		let rows = matrix.map((row, rowIndex) => {
			let rowItems = row.map((item, colIndex) => {
				// rowIndex === 0이면 요일 행이므로 days 배열에서 요일 이름을 사용
				const content = rowIndex === 0 ? days[colIndex] : item.day;
				const textStyle = getTextStyle(rowIndex, colIndex, item);
				return (
					<TouchableOpacity
						style={styles.cell}
						key={colIndex}
						onPress={() => rowIndex !== 0 && item.day && handleDayPress(item.day, item.isInCurrentMonth)}
						disabled={rowIndex === 0 || !item.day}>
						<Text style={textStyle}>{content}</Text>
					</TouchableOpacity>
				);
			});
			return <View style={styles.row} key={rowIndex}>{rowItems}</View>
		});
		return <View style={styles.calendar}>{rows}</View>
	};
	
	const getTextStyle = (rowIndex, colIndex, item) => {
		if (rowIndex !== 0) {
			const year = currentMonth.getFullYear();
			const month = currentMonth.getMonth() + 1;
			const formattedMonth = month < 10 ? `0${month}` : month;
			const formattedDay = item.day < 10 ? `0${item.day}` : item.day;
			const fullDate = `${year}-${formattedMonth}-${formattedDay}`
			
			let textStyle = item.isInCurrentMonth
				? colIndex === 0
					? styles.cellTextRed
					: colIndex === 6
						? styles.cellTextBlue
						: styles.cellText
				: colIndex === 0
					? {...styles.cellTextRed, ...styles.cellTextGrayOpacity}
					: colIndex === 6
						? {...styles.cellTextBlue, ...styles.cellTextGrayOpacity}
						: {...styles.cellTextGray, ...styles.cellTextGrayOpacity}
			
			if (item.isInCurrentMonth && specificDates.includes(fullDate)) {
				textStyle = {...textStyle, ...styles.specificDate};
			}
			
			if (item.day === selectedDay && item.isInCurrentMonth) {
				textStyle = styles.selectedDay;
			}
			return textStyle;
		} else if (rowIndex === 0) {
			return colIndex === 0
				? styles.headerTextRed
				: colIndex === 6
					? styles.headerTextBlue
					: styles.headerText
		}
	}
	
	return (
		<SafeAreaView style={styles.bg}>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.monthLabel}>
						{currentMonth.getFullYear()}.&nbsp;
						{months[currentMonth.getMonth()]}
					</Text>
				</View>
				<View style={styles.calendar}>{renderCalendar()}</View>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	bg: {
		backgroundColor: 'rgba(0,0,0,0.3)',
		position: "absolute",
		height: "100%",
		width: "100%",
		flex: 1,
		display: "flex",
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
	monthLabel: {
		fontSize: 18,
		color: "#000",
	},
	row: {
		flexDirection: "row",
	},
	cell: {
		flex: 1,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	headerText: {
		color: "#000",
	},
	headerTextRed: {
		color: "#FF0000",
	},
	headerTextBlue: {
		color: "#007BA4",
	},
	cellText: {
		color: "#000",
	},
	cellTextRed: {
		color: "#FF0000",
	},
	cellTextBlue: {
		color: "#007BA4",
	},
	cellTextGray: {
		color: "#0000004D"
	},
	selectedDay: {
		backgroundColor: "#E6EEF5",
		textAlign: "center",
		lineHeight: 40,
		color: "#000",
		height: 40,
		width: 40,
		borderRadius: 20,
		overflow: "hidden",
	},
	cellTextGrayOpacity: {
		opacity: 0.3,
	},
	specificDate: {
		color: "#FF0000",
	}
});

export default Calendar;
