const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser); // 요청 본문을 파싱하기 위해 추가

server.use((req, res, next) => {
	const { location_contains, scope, _start, _limit } = req.query;
	
	if (location_contains || scope) {
		let posts = router.db.get('posts').value();
		
		if (location_contains) {
			const locationQuery = location_contains.toLowerCase();
			posts = posts.filter(post => post.location.toLowerCase().includes(locationQuery));
		}
		
		if (scope) {
			posts = posts.filter(post => post.scope === scope);
		}
		
		const start = parseInt(_start, 10) || 0;
		const limit = parseInt(_limit, 10) || posts.length;
		posts = posts.slice(start, start + limit);
		
		res.json(posts);
	} else {
		next();
	}
});

// post_id를 사용하여 PATCH 요청을 처리하는 미들웨어
server.use('/posts/:post_id', (req, res, next) => {
	if (req.method === 'PATCH') {
		const post_id = req.params.post_id; // URL에서 post_id 추출
		const updates = req.body; // 요청 본문에서 업데이트할 내용 추출
		
		// db.json에서 해당 post_id를 가진 게시물을 찾아 업데이트
		let post = router.db.get('posts')
			.find({ post_id: post_id }) // post_id를 사용하여 게시물 찾기
			.assign(updates) // 업데이트 내용 적용
			.write(); // 변경사항 저장
		
		if (post) {
			res.json(post); // 업데이트된 게시물 반환
		} else {
			res.sendStatus(404); // 게시물을 찾지 못했을 경우 404 에러 반환
		}
	} else {
		next(); // PATCH 요청이 아닌 경우, 다음 미들웨어로 넘김
	}
});

server.use(router);
server.listen(3000, () => {
	console.log('JSON Server is running');
});