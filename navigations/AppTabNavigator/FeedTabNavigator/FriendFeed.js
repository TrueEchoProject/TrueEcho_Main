import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
// 페이지 뷰를 위한 라이브러리를 가져옵니다.
import PagerView from 'react-native-pager-view';
// 카드 컴포넌트를 가져옵니다. 이 컴포넌트는 피드를 보여주는 데 사용됩니다.
import CardComponent from '../../../components/CardComponent';
// 네비게이션 포커스 상태를 관리하기 위해 사용합니다.
import { useFocusEffect } from '@react-navigation/native';

// FriendFeed 컴포넌트를 정의합니다. 이 컴포넌트는 함수 컴포넌트로 정의되며, ref를 통해 부모 컴포넌트에서 직접 접근할 수 있습니다.
const FriendFeed = React.forwardRef((props, ref) => {
	// 상태 관리를 위해 useState 훅을 사용합니다. feeds는 피드 목록, refreshing은 새로고침 상태를 나타냅니다.
	const [feeds, setFeeds] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	// 페이지 뷰의 참조와 마지막 피드의 정보를 저장하기 위해 useRef를 사용합니다.
	const pagerViewRef = useRef(null);
	const lastFeed = useRef({}); // 마지막 피드 정보 저장용
	
	// 피드를 가져오는 함수입니다. 비동기로 동작하며, 외부 API에서 피드 목록을 가져옵니다.
	const fetchFeeds = async () => {
		setRefreshing(true); // 새로고침 상태를 true로 설정
		// API 요청을 위한 데이터 구조
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
			// API 요청을 수행
			const response = await fetch('https://api.steemit.com', {
				method: 'POST',
				body: JSON.stringify(data)
			});
			const json = await response.json(); // 응답을 JSON으로 변환
			setFeeds(json.result); // 피드 상태를 업데이트
			
			// 마지막 피드 정보 업데이트
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
			setRefreshing(false); // 새로고침 상태를 false로 설정
			pagerViewRef.current?.setPageWithoutAnimation(0); // 페이지 뷰의 페이지를 처음으로 설정
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
			fetchFeeds();
		}, [])
	);
	
	// 부모 컴포넌트가 ref를 통해 이 컴포넌트의 함수를 호출할 수 있게 합니다.
	React.useImperativeHandle(ref, () => ({
		refresh: fetchFeeds,
	}));
	
	return (
		<View style={style.container}>
			<ScrollView // ScrollView를 사용하여 내용이 화면을 초과할 경우 스크롤이 가능하게 합니다.
				contentContainerStyle={style.scrollViewContent}
				refreshControl={  // refreshControl 속성을 통해 새로고침 컨트롤을 추가합니다.
					<RefreshControl
						refreshing={refreshing}
						onRefresh={fetchFeeds}
					/>
				}
			>
				<PagerView  // PagerView 컴포넌트를 사용하여 피드를 페이지 별로 보여줍니다.
					style={style.pagerView}
					initialPage={0}
					ref={pagerViewRef}
					onPageSelected={e => {
						// 페이지가 변경될 때 실행할 함수
						const newIndex = e.nativeEvent.position;
						// 마지막 페이지에 도달하기 직전에 추가 데이터를 불러옵니다.
						if (newIndex === feeds.length - 2) {
							fetchMoreFeeds();
						}
					}}
				>
					{feeds.map((feed, index) => (	// feeds 배열을 매핑하여 각 피드를 CardComponent로 렌더링합니다.
						<View key={index} style={{ flex: 1 }}>
							<CardComponent
								data={feed}
							/>
						</View>
					))}
				</PagerView>
			</ScrollView>
		</View>
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
	},
});

export default FriendFeed;