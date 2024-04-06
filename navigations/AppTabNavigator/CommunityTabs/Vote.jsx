import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import VotePage from './VotePage';

const fetchData = async () => { // 서버로 부터 한번에 데이터를 받아옴. => 질문지 / 유저 / 이미지url
    try {
        const questionsResponse = await axios.get('http://192.168.123.121:3000/questions'); // 질문지 엔드포인트

        return { questions: questionsResponse.data || []}; // 데이터가 없다면 빈배열 리턴.
    } catch (error) {
        console.error('Error fetching data: ', error); // 에러처리. => 이미지를 제대로 받아오지 못했다면?
        return { questions: []};
    }
};

const Vote = () => {
    const [questions, setQuestions] = useState([]); // 서버로부터 받아온 질문이 저장됨.
    const [userSelections, setUserSelections] = useState([]); // 투표에 선택된 유저들이 저장. 
    
    const [currentPageIndex, setCurrentPageIndex] = useState(0); // 현재 페이지 체크. (마지막에 서버 전송을 위함.)

    useEffect(() => { // 컴포넌트가 마운트되면 유저와 / 질문을 받아옴. 
        const initFetch = async () => {
            const { questions, users } = await fetchData();
            setQuestions(questions);

        };

        initFetch();
    }, []);

    const handleUserSelection = useCallback((questionId, selectedUser) => { //자식 컴포넌트에 콜백을 프롭스로 전달할 때 사용. 
        setUserSelections(prevSelections => {
            const index = prevSelections.findIndex(selection => selection.questionId === questionId);
            const newSelection = { questionId, selectedUser };
            if (index >= 0) { // 이미 존재할때, 새로운걸로 대체.
                return prevSelections.map(selection => selection.questionId === questionId ? newSelection : selection);
            } else {
                return [...prevSelections, newSelection];
            }
        });
    }, []);

    useEffect(() => { // 마지막 페이지에 도달했을때, 서버로부터 현재까지 저장된 사진 전송. 
        if (currentPageIndex === questions.length + 2 && userSelections.length > 0) {
            console.log('Sending user selections to server:', userSelections);
            axios.post('YOUR_SERVER_ENDPOINT', { selections: userSelections })
                .then(response => console.log('Server response:', response))
                .catch(error => console.error('Error sending data to server:', error));
        }
    }, [currentPageIndex, questions.length, userSelections]);

    return (
        <View style={{ flex: 1 }}>
            <PagerView
                style={styles.pagerView}
                initialPage={0}
                orientation="vertical"
                onPageSelected={(e) => setCurrentPageIndex(e.nativeEvent.position)}
            >
                <View style={[styles.pageContainer, styles.start]} key="start">
                    <Text style={{ fontSize: hp(5), fontWeight: "bold" }}>투표를 시작해보세요.</Text>
                    <Text style={{ fontSize: hp(3), marginVertical: hp(2) }}>투표를 통해 친구들과 소통해요.</Text>
                    <Image style={styles.logo} source={require('../../../assets/voteImg.png')} />
                </View>
                {questions.map((question, index) => (
                    <VotePage
                        key={question.id.toString()}
                        question={question}
                        onUserSelect={handleUserSelection}
                    />
                ))}
                <View style={[styles.pageContainer, styles.end]} key="">
                    <Text style={{ fontSize: hp(5), fontWeight: "bold" }}>투표를 모두 마치셨어요.</Text>
                </View>
                <View style={[styles.pageContainer, styles.end]} key="end">
                    <Text style={{ fontSize: hp(5), fontWeight: "bold" }}>이때 서버에 전송됨.</Text>
                </View>
            </PagerView>
        </View>
    );
};

const styles = StyleSheet.create({
    pagerView: {
        width: wp(100),
        height: hp(100),
    },
    pageContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    start: {
        backgroundColor: "#aaa",
    },
    vote: {
        backgroundColor: "#bbb",
    },
    end: {
        backgroundColor: "#ccc",
    },
    logo: {
        width: wp(30),
        height: hp(20),
    },
});

export default Vote;
