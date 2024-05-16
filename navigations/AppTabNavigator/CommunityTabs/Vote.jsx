import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, Image, Animated, Easing, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import SecureApi from '../../../SecureApi';
import VotePage from './VotePage';


const { height } = Dimensions.get('window');

const Vote = ({ navigation }) => {
    const [questions, setQuestions] = useState([]);
    const [arrowAnimation] = useState(new Animated.Value(0));
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태를 관리합니다.


    useEffect(() => {
        const fetchData = async () => {
            try {
                const questionsResponse = await SecureApi.get('/questions');
                setQuestions(questionsResponse.data);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const animate = Animated.loop(
            Animated.sequence([
                Animated.timing(arrowAnimation, {
                    toValue: 20,
                    duration: 600,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(arrowAnimation, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        );
        animate.start();
        return () => animate.stop();
    }, [arrowAnimation]);

    const handleUserSelect = (questionId, userId) => {
        setSelectedInfo({ questionId, userId });
        console.log('Selected info:', { questionId, userId });
    };

    const handleNextSlide = async (event) => {
        const nextPage = event.nativeEvent.position;
        if (nextPage !== currentPage) {
            if (nextPage > currentPage && selectedInfo) {
                try {
                    const response = await SecureApi.post('/submitVote', selectedInfo);
                    console.log('Vote submitted successfully:', response.data);
                    updateQuestions(selectedInfo.questionId); // 성공적으로 투표를 제출한 후에만 질문을 삭제
                    setSelectedInfo(null);
                } catch (error) {
                    console.error('Error submitting vote:', error);
                    // updateQuestions(selectedInfo.questionId); // 캐치 부분에 넣을경우 오류 발생.
                    setSelectedInfo(null);
                } finally {
                    setCurrentPage(nextPage); // API 호출이 끝난 후 페이지 상태 업데이트
                }
            } else {
                setCurrentPage(nextPage);
            }
        }
    };

    const updateQuestions = (excludeQuestionId = null) => { // 삭제 로직.
        setQuestions(prevQuestions => {
            console.log(`Updating questions, excluding ID: ${excludeQuestionId}`);
            if (!excludeQuestionId) return prevQuestions;
            return prevQuestions.filter(question => question.id !== excludeQuestionId);
        });
    };


    return (
        <PagerView
            style={{ flex: 1 }}
            initialPage={0}
            orientation="vertical"
            onPageSelected={handleNextSlide}
        >
            <View style={styles.container}>
                <Text style={styles.title}>투표를 시작해 보세요!</Text>
                <Text style={styles.description}>투표를 통해 친구들과 소통해요!</Text>
                <Image
                    style={styles.voteImage}
                    source={require('../../../assets/voteImg.png')}
                />
                <Animated.View style={[styles.animatedContainer, { transform: [{ translateY: arrowAnimation }] }]}>
                    <Text style={styles.goText}>GO!</Text>
                    <FontAwesome name="angle-double-down" size={70} color="black" />
                </Animated.View>
            </View>

            {questions.map((question, index) => (
                <View key={question.id.toString()} style={{ flex: 1 }}>
                    {<VotePage question={question} onUserSelect={handleUserSelect} />}
                </View>
            ))}

            <View key="end" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.endTitle}>투표를 모두 마치셨어요!</Text>
                <Animated.View style={{ transform: [{ translateY: arrowAnimation }] }} />
                <TouchableOpacity onPress={() => navigation.navigate('결과')} style={styles.resultButton}>
                    <Text style={styles.resultButtonText}>랭킹 보러 가기</Text>
                </TouchableOpacity>
            </View>
        </PagerView>
    );
};

export default Vote;

const styles = StyleSheet.create({
    container: {
        flex: 1, // flex를 사용하여 화면 전체를 채웁니다.
        justifyContent: 'center', // 수직 방향에서 중앙 정렬
        alignItems: 'center', // 수평 방향에서 중앙 정렬
        backgroundColor: '#fff',  // 밝은 회색 배경
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10, // 제목 아래에 마진 추가
    },
    description: {
        fontSize: 16,
        color: '#333',  // 어두운 글자 색
        textAlign: 'center', // 텍스트 중앙 정렬
        marginBottom: 20, // 설명글 아래에 마진 추가
    },
    voteImage: {
        width: '50%', // 이미지 너비 전체 사용
        height: undefined,  // 이미지 높이를 비율에 맞춰 조절
        aspectRatio: 1, // 이미지 비율 유지
        marginBottom: 20, // 이미지 아래에 마진 추가
    },
    animatedContainer: {
        position: 'absolute', // 절대 위치 설정
        bottom: 20, // 화면 하단으로부터 20만큼 위에 배치
        left: 0, // 왼쪽 정렬
        right: 0, // 오른쪽 정렬
        alignItems: 'center', // 수평 가운데 정렬
        marginBottom: 20, // 애니메이션 컨테이너 아래에 마진 추가
    },
    goText: {
        fontSize: 40, // 텍스트 크기를 40으로 설정
        fontWeight: 'bold', // 굵은 글자
        textAlign: 'center', // 텍스트 가운데 정렬
    },
    endContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',  // 흰색 배경
        paddingVertical: 40,
    },
    endTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4a90e2',  // 진한 파란색
        marginBottom: 30,  // 더 큰 여백 제공
    },
    resultButton: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#4a90e2',  // 버튼 배경색
        borderRadius: 5,
    },
    resultButtonText: {
        fontSize: 18,
        color: '#fff',  // 흰색 텍스트
        textAlign: 'center',
    }
});

