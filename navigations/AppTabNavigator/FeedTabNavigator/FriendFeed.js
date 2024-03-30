import React, { useState, useRef, useCallback, Profiler } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import PagerView from 'react-native-pager-view';
import CardComponent from '../../../components/CardComponent';
import { useFocusEffect } from '@react-navigation/native';

// CardComponent를 메모이징하여 리렌더링 최적화를 수행합니다. 데이터의 id가 변경되지 않는 한, 리렌더링을 방지합니다.
const MemoizedCardComponent = React.memo(CardComponent, (prevProps, nextProps) => {
	return prevProps.data.id === nextProps.data.id;
});

// FriendFeed 컴포넌트를 정의합니다. 외부에서 ref를 통해 컨트롤할 수 있도록 forwardRef를 사용합니다.
const FriendFeed = React.forwardRef((props, ref) => {
	const [feeds, setFeeds] = useState(null); // 피드 데이터를 상태로 관리합니다.
	const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리합니다.
	const pagerViewRef = useRef(null); // PagerView 컴포넌트를 참조하기 위한 ref입니다.
	const lastFeed = useRef({}); // 추가 데이터 요청을 위한 마지막 피드 정보를 저장합니다.
	
	// 피드 데이터를 서버로부터 불러오는 함수입니다.
	const fetchFeeds = async () => {
		setRefreshing(true); // 새로고침 상태를 true로 설정합니다.
		// 요청할 데이터를 정의합니다.
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
		
		// 서버 요청을 시도합니다.
		try {
			const response = await fetch('https://api.steemit.com', {
				method: 'POST',
				body: JSON.stringify(data)
			});
			const json = await response.json(); // 응답을 JSON 형태로 변환합니다.
			// 피드 데이터에서 이미지 정보만 추출하여 새로운 피드 배열을 생성합니다.
			const feedsWithImages = json.result.map(feed => ({
				...feed,
				images: feed.json_metadata && JSON.parse(feed.json_metadata).image ? JSON.parse(feed.json_metadata).image.slice(0, 2) : []
			}));
			setFeeds(feedsWithImages); // 새로운 피드 데이터를 상태로 설정합니다.
			
			// 추가 데이터 요청을 위한 마지막 피드 정보를 업데이트합니다.
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
			setRefreshing(false); // 새로고침 상태를 false로 설정합니다.
			pagerViewRef.current?.setPageWithoutAnimation(0);
		}
	};
	
	// 추가 피드 데이터를 불러오는 함수입니다.
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
					start_author,
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
			const newFeedsWithImages = json.result.map(feed => ({
				...feed,
				images: feed.json_metadata && JSON.parse(feed.json_metadata).image ? JSON.parse(feed.json_metadata).image.slice(0, 2) : []
			}));
			
			if (newFeedsWithImages.length > 0 && newFeedsWithImages[0].author === start_author && newFeedsWithImages[0].permlink === start_permlink) {
				newFeedsWithImages.shift(); // 첫 번째 요소가 중복되면 제거
			}
			
			setFeeds(prevFeeds => [...prevFeeds, ...newFeedsWithImages]);
			
			if (newFeedsWithImages.length > 0) {
				const lastElement = newFeedsWithImages[newFeedsWithImages.length - 1];
				lastFeed.current = {
					start_author: lastElement.author,
					start_permlink: lastElement.permlink,
				};
			}
		} catch (error) {
			console.error(error);
		}
	};
	
	// 컴포넌트가 포커스될 때 피드 데이터를 불러오도록 설정합니다.
	useFocusEffect(
		useCallback(() => {
			if (!feeds) fetchFeeds(); // feeds가 비어있다면 피드를 불러옵니다.
		}, [])
	);
	
	// 외부에서 컴포넌트를 제어할 수 있도록 메서드를 제공합니다.
	React.useImperativeHandle(ref, () => ({
		refresh: fetchFeeds,
	}));
	
	// 피드 데이터가 없을 경우 로딩 상태를 표시합니다.
	if (!feeds) {
		return <View style={style.container}><Text>Loading...</Text></View>;
	}
	
	function onRenderCallback(
		id, // 프로파일러 트리의 id
		phase, // "mount" 또는 "update"
		actualDuration, // 컴포넌트 렌더링에 걸린 실제 시간
		baseDuration, // 메모이제이션하지 않았을 때 예상되는 기본 렌더링 시간
		startTime, // 렌더링이 시작된 시간
		commitTime, // 렌더링이 커밋된 시간
		interactions // 이 렌더링에 연관된 상호작용들의 집합
	) {
		console.log('Profiler ID:', id);
		console.log('Actual duration:', actualDuration);
		console.log('Base duration:', baseDuration);
	}
	
	return (
		<ScrollView
			contentContainerStyle={style.scrollViewContent}
			refreshControl={
				// RefreshControl 컴포넌트를 사용하여 새로고침 기능을 구현합니다.
				// refreshing prop에 따라 새로고침 인디케이터의 표시 여부가 결정됩니다.
				// onRefresh prop으로 새로고침 시 실행할 함수를 지정합니다.
				<RefreshControl refreshing={refreshing} onRefresh={fetchFeeds} />
			}
		>
			<PagerView
				style={style.pagerView}
				initialPage={0}
				ref={pagerViewRef}
				onPageSelected={e => {
					// 페이지가 선택될 때 실행할 함수
					// 사용자가 마지막 피드에 근접했을 때 추가 피드를 불러오는 로직을 실행합니다.
					const newIndex = e.nativeEvent.position;
					if (newIndex === feeds.length - 6) {
						fetchMoreFeeds();
					}
				}}
			>
				{feeds.map((feed, index) => (
					// Profiler 컴포넌트를 사용하여 렌더링 성능을 측정합니다.
					<Profiler id={`Feed-${index}`} onRender={onRenderCallback} key={index}>
						<View style={{ flex: 1 }}>
							<MemoizedCardComponent data={feed} />
						</View>
					</Profiler>
				))}
			</PagerView>
		</ScrollView>
	);
});

const style = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
	},
	scrollViewContent: {
		flexGrow: 1,
	},
	pagerView: {
		flex: 1,
		backgroundColor: 'white',
	},
});

export default FriendFeed;