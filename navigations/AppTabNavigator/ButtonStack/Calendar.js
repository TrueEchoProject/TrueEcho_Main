import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ImageBackground,
	Modal,
	Dimensions,
} from 'react-native';
import axios from "axios";
import { Image } from "expo-image"

const days = ["일", "월", "화", "수", "목", "금", "토"];
const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const Calendar = () => {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [specificDates, setSpecificDates] = useState({});
	const [isImageVisible, setIsImageVisible] = useState(false);
	const [currentImageUrls, setCurrentImageUrls] = useState({ front: null, back: null });
	
	const fetchCalendar = async () => {
		try {
			const response = await axios.get(`http://192.168.0.3:3000/user_calendar`);
			const calendarData = response.data;
			const newSpecificDates = {};
			calendarData.forEach(item => {
				newSpecificDates[item.created_at] = { front: item.post_front_url, back: item.post_back_url };
			});
			setSpecificDates(newSpecificDates);
		} catch (error) {
			console.error('Error fetching calendar data', error);
		}
	};
	
	useEffect(() => {
		fetchCalendar();
	}, []);
	
	const toggleImageVisibility = (imageUrl, imageBackUrl) => {
		setCurrentImageUrls({ front: imageUrl, back: imageBackUrl });
		setIsImageVisible(!isImageVisible);
	};
	
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
					imageUrl: specificDates[dateKey]?.front,
					imageBackUrl: specificDates[dateKey]?.back
				};
			}
		}
		return matrix;
	};
	
	const ImageModal = ({ isVisible, postFront, postBack, onClose }) => {
		const [isFrontShowing, setIsFrontShowing] = useState(true);
		const changeImage = () => {
			setIsFrontShowing(!isFrontShowing);
		};
		
		return (
			<Modal
				animationType="slide"
				visible={isVisible}
				onRequestClose={onClose}
				transparent={true}
			>
				<View style={styles.modalContainer}>
					<TouchableOpacity
						onPress={onClose}
						style={styles.closeButton}
					>
						<Text style={styles.buttonText}>
							닫기
						</Text>
					</TouchableOpacity>
					<View style={styles.imageContainer}>
						<TouchableOpacity
							onPress={changeImage}
							style={styles.frontImage}
						>
							<Image
								source={{ uri: isFrontShowing ? postFront : postBack }}
								style={styles.smallImage}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={changeImage}
							style={styles.backImage}
						>
							<Image
								source={{ uri: isFrontShowing ? postBack : postFront }}
								style={styles.fullImage}
							/>
						</TouchableOpacity>
					</View>
					<TouchableOpacity onPress={onClose} style={styles.selectButton}>
						<Text style={styles.buttonText}>
							Pin 지정
						</Text>
					</TouchableOpacity>
				</View>
			</Modal>
		);
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
									onPress={() => toggleImageVisibility(item.imageUrl, item.imageBackUrl)}
								>
									<ImageBackground source={{ uri: item.imageBackUrl }} style={styles.backgroundImage}>
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
				{isImageVisible && (
					<ImageModal
						isVisible={isImageVisible}
						postFront={currentImageUrls.front}
						postBack={currentImageUrls.back}
						onClose={() => setIsImageVisible(false)}
					/>
				)}
				<View style={{
					position: "absolute",
					bottom: 1,
					marginHorizontal: "10%",
					marginBottom: "1%",
				}}>
					<Text>
						hello
					</Text>
				</View>
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
		flex: 1,
		backgroundColor: "#FFF",
		position: "relative",
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
	modalContainer: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	imageContainer: {
		width: windowWidth * 0.8,
		height: windowHeight * 0.6,
		backgroundColor: 'white',
		position: 'relative',
	},
	fullImage: {
		width: windowWidth * 0.8,
		height: windowHeight * 0.6,
	},
	smallImage: {
		width: windowWidth * 0.3,
		height: windowHeight * 0.2,
		borderRadius: 12,
	},
	frontImage: {
		zIndex: 2,
		position: 'absolute',
		top: 10,
		left: 10
	},
	backImage: {
		zIndex: 1,
		position: 'relative'
	},
	closeButton: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "white",
		borderTopEndRadius: 10,
		borderTopStartRadius: 10,
		width: windowWidth * 0.8,
		height: 40,
	},
	selectButton: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "white",
		borderBottomEndRadius: 10,
		borderBottomStartRadius: 10,
		width: windowWidth * 0.8,
		height: 40,
	},
	buttonText: {
		color: "black",
		fontSize: 15,
		fontWeight: "bold",
		textAlign: "center",
	},
});

export default Calendar;