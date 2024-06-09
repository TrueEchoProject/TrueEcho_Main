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
	ScrollView, ActivityIndicator,
	Image,
} from 'react-native';
import Api from '../../../Api';
import { Image as ExpoImage } from 'expo-image'; // expo-image 패키지 import

const days = ["일", "월", "화", "수", "목", "금", "토"];
const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const Calendar = ({ navigation }) => {
	const [selectedPins, setSelectedPins] = useState([]); // 선택된 핀들의 정보를 저장할 상태
	const [serverSelectedPins, setServerSelectedPins] = useState([]); // 서버로부터 받아온 선택된 핀들의 정보를 저장할 상태
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmit, setIsSubmit] = useState(false);
	const [specificDates, setSpecificDates] = useState({});
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [isImageVisible, setIsImageVisible] = useState(false);
	const [currentImageUrls, setCurrentImageUrls] = useState({ front: null, back: null });
	const defaultImage = "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
	
	useEffect(() => {
		fetchCalendarAndPins();
	}, []);
	useEffect(() => {
		if (selectedPins) {
			console.log(selectedPins);
		}
	}, [selectedPins]); // userData 변화 감지
	useEffect(() => {
		console.log("specificDates is", specificDates);
	}, [specificDates]);
	useEffect(() => {
		console.log("serverSelectedPins is", serverSelectedPins);
	}, [serverSelectedPins]);
	
	const fetchCalendarAndPins = async () => {
		try {
			// Fetch monthly posts
			const calendarResponse = await Api.get(`/setting/monthlyPosts`);
			const calendarData = calendarResponse.data.data.monthlyPostList || [];
			// Process calendar data to keep the latest post for each date
			const latestPostsByDate = {};
			calendarData.forEach(item => {
				const date = item.createdAt.split('T')[0];
				if (!latestPostsByDate[date] || new Date(item.createdAt) > new Date(latestPostsByDate[date].createdAt)) {
					latestPostsByDate[date] = item;
				}
			});
			const newSpecificDates = {};
			Object.keys(latestPostsByDate).forEach(date => {
				const item = latestPostsByDate[date];
				newSpecificDates[date] = { front: item.postFrontUrl, back: item.postBackUrl, postId: item.postId };
			});
			setSpecificDates(newSpecificDates);
			// Fetch selected pins
			const pinsResponse = await Api.get(`/setting/pins`);
			const selectedPinsData = pinsResponse.data?.data?.pinList || [];
			const newSelectedPins = selectedPinsData.map(pin => ({
				pinId: pin.pinId,
				postId: pin.postId,
				date: pin.createdAt.split('T')[0], // 'T' 이후를 잘라서 저장
				frontUrl: pin.postFrontUrl ? pin.postFrontUrl : defaultImage,
				backUrl: pin.postBackUrl ? pin.postBackUrl : defaultImage,
				isFrontShowing: false // 기본적으로 전면 이미지를 보여줌
			}));
			setSelectedPins(newSelectedPins);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching calendar data or selected pins', error);
		}
	};
	const postPins = async () => {
		if (isSubmit) return;
		setIsSubmit(true);
		
		if (selectedPins.length === 0) {
			alert("선택된 핀이 없습니다.");
			return;
		}
		const updatedPostIdList = selectedPins.map(pin => pin.postId);
		const postData = { updatedPostIdList };
		console.log(postData);
		
		const pinData = {
			pins: selectedPins.map((pin, index) => ({
				pinId: index + 1,
				createdAt: pin.date,
				postFrontUrl: pin.frontUrl,
				postBackUrl: pin.backUrl
			}))
		};
		try {
			const response = await Api.put(`/setting/pins`, postData);
			alert("핀 업데이트가 성공적으로 제출되었습니다.");
			if (response) {
				console.log(pinData);
				navigation.navigate("MyP", { pinRes: pinData }); // SendPost 페이지로 이동하면서 pinData를 전달
			}
		} catch (error) {
			console.error('Error posting pins', error);
			alert("핀을 제출하는 중 오류가 발생했습니다.");
		} finally {
			setIsSubmit(false);
		}
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
					imageBackUrl: specificDates[dateKey]?.back,
					date: dateKey,  // 날짜 정보 추가
					pinId: specificDates[dateKey]?.pinId, // pinId 추가
					postId: specificDates[dateKey]?.postId // postId 추가
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
									onPress={() => toggleImageVisibility(item.imageUrl, item.imageBackUrl, item.date, item.postId)}
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
	const ImageModal = ({ isVisible, postFront, postBack, onClose, onSelectPin }) => {
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
					<TouchableOpacity onPress={onSelectPin} style={styles.selectButton}>
						<Text style={styles.buttonText}>Pin 지정</Text>
					</TouchableOpacity>
				</View>
			</Modal>
		);
	};
	const toggleImageVisibility = (imageUrl, imageBackUrl, date, postId, pinId) => {
		setCurrentImageUrls({ front: imageUrl, back: imageBackUrl, date: date, pinId: pinId, postId: postId });
		setIsImageVisible(!isImageVisible);
	};
	const handleSelectPin = () => {
		// 중복된 날짜의 핀이 있는지 확인
		if (selectedPins.some(pin => pin.date === currentImageUrls.date)) {
			alert("이 날짜에 이미 핀이 지정되어 있습니다.");
			setIsImageVisible(false); // 모달 닫기
			return;
		}
		// 이미 5개의 핀이 선택되었는지 확인
		if (selectedPins.length >= 5) {
			alert("최대 5개의 핀을 선택할 수 있습니다.");
			setIsImageVisible(false); // 모달 닫기
			return;
		}
		// 새로운 핀 추가
		const newPin = {
			pinId: currentImageUrls.pinId,
			postId: currentImageUrls.postId,
			frontUrl: currentImageUrls.front,
			backUrl: currentImageUrls.back,
			date: currentImageUrls.date,
			isFrontShowing: false // 초기 전면 이미지 상태 설정
		};
		setSelectedPins(prevPins => [...prevPins, newPin].sort((a, b) => new Date(a.date) - new Date(b.date)));
		setIsImageVisible(false);
	};
	const togglePinImage = (index) => {
		const updatedPins = [...selectedPins];
		updatedPins[index].isFrontShowing = !updatedPins[index].isFrontShowing;
		setSelectedPins(updatedPins);
	};
	const SelectedPinsList = () => {
		const maxSlots = 5;
		const emptySlots = maxSlots - selectedPins.length;
		const allSlots = [...selectedPins];
		// 빈 칸을 채워넣기
		for (let i = 0; i < emptySlots; i++) {
			allSlots.push({ empty: true });
		}
		
		return (
			<View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
					{allSlots.map((pin, index) => (
						pin.empty ? (
							<View key={index} style={styles.selectedImageContainer}>
								<Text style={styles.emptyText}>핀을 선택하세요</Text>
							</View>
						) : (
							<View key={index} style={styles.selectedImageContainer}>
								<TouchableOpacity onPress={() => togglePinImage(index)}>
									<Image
										source={{ uri: pin.isFrontShowing ? pin.frontUrl : pin.backUrl }}
										style={styles.selectedImage} />
									<Text style={styles.pinDateText}>Date: {pin.date}</Text>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => removePin(index)} style={styles.removeButton}>
									<Text style={styles.removeButtonText}>삭제</Text>
								</TouchableOpacity>
							</View>
						)
					))}
				</View>
			</View>
		);
	};
	const removePin = (index) => {
		setSelectedPins(prevPins => prevPins.filter((_, i) => i !== index));
	};
	
	if (isLoading) {
		return <View style={styles.loader}><ActivityIndicator size="large" color="#0000ff"/></View>;
	}
	return (
		<SafeAreaView style={styles.bg}>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.monthLabel}>{currentMonth.getFullYear()}년 {months[currentMonth.getMonth()]}월</Text>
					<TouchableOpacity onPress={postPins} style={styles.submitButton}>
						<Text style={styles.submitButtonText}>핀 제출</Text>
					</TouchableOpacity>
				</View>
				{renderCalendar()}
				{isImageVisible && (
					<ImageModal
						isVisible={isImageVisible}
						postFront={currentImageUrls.front}
						postBack={currentImageUrls.back}
						onClose={() => setIsImageVisible(false)}
						onSelectPin={handleSelectPin}
					/>
				)}
			</View>
			<ScrollView style={{ flex: 1, backgroundColor: "white"}}>
				<SelectedPinsList />
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	bg: {
		backgroundColor: 'rgba(0,0,0,0.3)',
		flex: 1,
	},
	container: {
		width: windowWidth,
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
		marginBottom: "5%",
		borderColor: "black",
		borderWidth: 1,
	},
	row: {
		flexDirection: "row",
	},
	cell: {
		flex: 1,
		height: 45,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: "black",
		borderWidth: 1,
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
	selectedImageContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f0f0f0', // 배경색 변경
		padding: 10,
		borderRadius: 10, // 모서리 둥글게
		margin: 5,
	},
	selectedImage: {
		width: 90,
		height: 90,
		borderRadius: 10, // 이미지 모서리 둥글게
	},
	pinDateText: {
		fontSize: 12,
		color: '#333',
		marginTop: 5,
	},
	emptyText: {
		fontSize: 14,
		color: '#bbb',
	},
	removeButton: {
		marginTop: 5,
		backgroundColor: 'red',
		padding: 5,
		borderRadius: 5,
	},
	removeButtonText: {
		color: 'white',
		fontSize: 12,
		textAlign: 'center',
	},
	submitButton: {
		backgroundColor: '#4CAF50', // 버튼 색상: 녹색
		padding: 10,
		borderRadius: 5,
	},
	submitButtonText: {
		color: 'white',
		fontSize: 16,
		textAlign: 'center',
	},
});

export default Calendar;