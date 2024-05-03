import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, Image, Animated, Easing, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
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
                const questionsResponse = await axios.get('http://192.168.0.27:3000/questions');
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
    
    const handleNextSlide = (event) => {
        const nextPage = event.nativeEvent.position; // 현재 페이지 인덱스를 가져옵니다.
        if (nextPage > currentPage) {
            setCurrentPage(nextPage); // 현재 페이지를 업데이트합니다.
            
            // 사용자 선택 정보를 서버로 전송
            if (selectedInfo) { // selectedInfo가 존재할 때만 전송
                axios.post('http://192.168.0.27:3000/submitVote', selectedInfo)
                  .then(response => {
                      console.log('Vote submitted successfully:', response.data);
                  })
                  .catch(error => {
                      console.error('Error submitting vote:', error);
                  });
            }
        }
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
                  <FontAwesome name="angle-double-down" size={70} color="black"/>
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
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: '100%', // 이미지 너비 전체 사용
        height: 200,  // 이미지 높이 설정
        resizeMode: 'contain', // 이미지 비율 유지
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
        height: height,
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

