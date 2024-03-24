import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import PagerView from 'react-native-pager-view';
import CardComponent from '../../../components/CardComponent';
import { useFocusEffect } from '@react-navigation/native';

const FriendFeed = React.forwardRef((props, ref) => {
	const [feeds, setFeeds] = useState(null);
	const [refreshing, setRefreshing] = useState(false);
	const pagerViewRef = useRef(null);
	const lastFeed = useRef({});
	
	const fetchFeeds = async () => {
		setRefreshing(true);
		const data = {
			id: 1,
			jsonrpc: "2.0",
			method: "call",
			params: [
				"database_api",
				"get_discussions_by_created",
				[{ tag: "kr", limit: 10 }]
			]
		};
		
		try {
			const response = await fetch('https://api.steemit.com', {
				method: 'POST',
				body: JSON.stringify(data)
			});
			const json = await response.json();
			setFeeds(json.result);
			
			if (json.result.length > 0) {
				const lastElement = json.result[json.result.length - 1];
				lastFeed.current = {
					start_author: lastElement.author,
					start_permlink: lastElement.permlink,
				};
			}
		} catch (error) {
			console.error(error);
		} finally {
			setRefreshing(false);
		}
	};
	
	// 더 많은 피드를 가져오는 함수입니다. 마지막 피드를 시작점으로 추가 피드를 요청합니다.
	const fetchMoreFeeds = async () => {
		const { start_author, start_permlink } = lastFeed.current;
		const data = {
			id: 1,
			jsonrpc: "2.0",
			method: "call",
			params: [
				"database_api",
				"get_discussions_by_created",
				[{
					tag: "kr",
					limit: 10,
					start_author, // 이전 요청의 마지막 피드를 시작점으로 설정
					start_permlink,
				}]
			]
		};
		try {
			const response = await fetch('https://api.steemit.com', {
				method: 'POST',
				body: JSON.stringify(data)
			});
			const json = await response.json();
			const newFeeds = json.result;
			
			// 중복 제거: 새로운 피드 목록에서 첫 번째 항목이 이전 마지막 피드와 동일하다면 제외
			if (newFeeds.length > 0 && newFeeds[0].author === start_author && newFeeds[0].permlink === start_permlink) {
				newFeeds.shift(); // 첫 번째 항목 제거
			}
			
			setFeeds(prevFeeds => [...prevFeeds, ...newFeeds]);
			
			// 마지막 피드 정보 업데이트
			if (newFeeds.length > 0) {
				const lastElement = newFeeds[newFeeds.length - 1];
				lastFeed.current = {
					start_author: lastElement.author,
					start_permlink: lastElement.permlink,
				};
			}
		} catch (error) {
			console.error(error);
		}
	};
	
	// 컴포넌트가 포커스를 받을 때 마다 피드를 새로 불러오는 효과를 사용합니다.
	useFocusEffect(
		useCallback(() => {
			if (!feeds) fetchFeeds(); // feeds가 비어있다면 피드를 불러옵니다.
		}, [])
	);
	
	// feeds 상태가 비어있는 경우, 로딩 인디케이터 또는 플레이스홀더를 보여주기
	if (!feeds) {
		return <View style={style.container}><Text>Loading...</Text></View>;
	}
	
	// 부모 컴포넌트가 ref를 통해 이 컴포넌트의 함수를 호출할 수 있게 합니다.
	React.useImperativeHandle(ref, () => ({
		refresh: fetchFeeds,
	}));
	
	return (
		<ScrollView
			contentContainerStyle={style.scrollViewContent}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={fetchFeeds} />
			}
			style={style.container}
		>
			<PagerView
				style={style.pagerView} initialPage={0}
				ref={pagerViewRef} onPageSelected={e => {
				const newIndex = e.nativeEvent.position;
				if (newIndex === feeds.length - 2) {
					fetchMoreFeeds();
				}
			}}
			>
				{feeds.map((feed, index) => (
					<View key={index} style={{ flex: 1 }}>
						<CardComponent data={feed} />
					</View>
				))}
			</PagerView>
		</ScrollView>
	);
});

const style = StyleSheet.create({
	container: {
		flex: 1, // Flexbox를 사용하여 화면 전체를 차지하게 설정
		backgroundColor: 'white', // 배경색을 흰색으로 설정
	},
	scrollViewContent: {
		flexGrow: 1, // 내용이 화면보다 작을 경우 중앙에 위치하도록 설정
	},
	pagerView: {
		flex: 1, // 화면 전체를 차지하게 설정
		backgroundColor: 'white', // 배경색을 흰색으로 설정
	},
});

export default FriendFeed;