const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser); // 요청 본문을 파싱하기 위해 추가
// DELETE /user_pin - 전체 user_pin 데이터를 삭제합니다.
// 모든 user_pin 데이터를 삭제하는 DELETE 라우트
server.delete('/user_pin', (req, res) => {
	// user_pin 배열을 빈 배열로 설정
	router.db.set('user_pin', []).write();
	res.sendStatus(200);
});
server.post('/blocked_users', (req, res) => {
	const newBlockedUsers = req.body; // 클라이언트에서 보낸 차단 사용자 정보
	console.log(newBlockedUsers); // 서버 측 콘솔에 데이터 출력
	
	// 데이터가 객체인지 배열인지 확인 후 배열로 통일
	const usersToBlock = Array.isArray(newBlockedUsers) ? newBlockedUsers : [newBlockedUsers];
	
	// 현재 차단된 사용자 목록 가져오기
	const currentBlockedUsers = router.db.get('blocked_users').value();
	
	// 중복 검사: 현재 차단된 사용자 목록에 이미 있는지 확인
	const filteredUsersToBlock = usersToBlock.filter(newUser =>
		!currentBlockedUsers.some(existingUser => existingUser.username === newUser.username));
	
	// 중복된 사용자가 없는 경우만 추가
	if (filteredUsersToBlock.length > 0) {
		// 각 사용자 객체에 id가 없으면 새 id 부여
		filteredUsersToBlock.forEach(user => {
			if (!user.id) {
				user.id = Date.now(); // 현재 시간을 기준으로 고유 ID 생성
			}
		});
		
		const updatedBlockedUsers = [...currentBlockedUsers, ...filteredUsersToBlock];
		router.db.set('blocked_users', updatedBlockedUsers).write();
		res.status(200).json(updatedBlockedUsers);
	} else {
		res.status(409).json({ message: "User is already blocked" });
	}
});

server.delete('/blocked_users', (req, res) => {
	// user_pin 배열을 빈 배열로 설정
	router.db.set('blocked_users', []).write();
	res.sendStatus(200);
});
server.delete('/user_me', (req, res) => {
	// user_pin 배열을 빈 배열로 설정
	router.db.set('user_me', []).write();
	res.sendStatus(200);
});
server.post('/user_pin', (req, res) => {
	const pins = req.body.pins;
	pins.forEach((pin, index) => {
		console.log("Receiving pin:", pin); // 로깅 추가
		router.db.get('user_pin').push({
			pin_id: index + 1,
			created_at: pin.created_at,
			post_front_url: pin.post_front_url,
			post_back_url: pin.post_back_url
		}).write();
	});
	
	res.send({ status: 'success', message: 'Pins added successfully' });
});
server.post('/comments/:commentId/under_comments', (req, res) => {
	const commentId = parseInt(req.params.commentId);
	const newUnderComment = {
		id: Date.now(),  // 답글의 고유 ID 생성
		...req.body      // 클라이언트로부터 받은 답글 내용
	};
	
	// 지정된 commentId를 찾아 해당하는 댓글의 under_comments 배열에 새로운 답글 추가
	const comment = router.db.get('comments').find({ id: commentId }).value();
	if (comment) {
		router.db.get('comments')
			.find({ id: commentId })
			.get('under_comments')
			.push(newUnderComment)
			.write();
		
		// reply_count 업데이트
		const updatedComment = router.db.get('comments')
			.find({ id: commentId })
			.assign({ reply_count: comment.under_comments.length + 1 }) // 기존 답글 수에 새 답글을 더함
			.write();
		
		res.status(201).jsonp(newUnderComment);
	} else {
		res.status(404).send({ error: 'Comment not found' });
	}
});

server.patch('/comments/:commentId/under_comments/:underCommentId', (req, res) => {
	const { commentId, underCommentId } = req.params;
	const comment = router.db.get('comments').find({ id: parseInt(commentId) }).value();
	if (comment) {
		const underComments = comment.under_comments;
		const underCommentIndex = underComments.findIndex(uc => uc.id === parseInt(underCommentId));
		if (underCommentIndex !== -1) {
			// 답글을 찾았으면, 요청 본문의 내용으로 업데이트
			underComments[underCommentIndex] = {...underComments[underCommentIndex], ...req.body};
			router.db.get('comments')
				.find({ id: parseInt(commentId) })
				.assign({ under_comments: underComments })
				.write();
			res.send(underComments[underCommentIndex]);
		} else {
			res.status(404).send({ error: 'Under comment not found' });
		}
	} else {
		res.status(404).send({ error: 'Comment not found' });
	}
});
server.delete('/comments/:commentId/under_comments/:underCommentId', (req, res) => {
	const commentId = parseInt(req.params.commentId);
	const underCommentId = parseInt(req.params.underCommentId);
	
	const comment = router.db.get('comments').find({ id: commentId }).value();
	if (comment) {
		const underComments = comment.under_comments.filter(uc => uc.id !== underCommentId);
		router.db.get('comments')
			.find({ id: commentId })
			.assign({ under_comments: underComments, reply_count: Math.max(0, underComments.length) }) // 답글 목록 업데이트 및 답글 수 감소
			.write();
		res.status(204).send();
	} else {
		res.status(404).send({ error: 'Comment not found' });
	}
});
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
// comments에 대한 특정 요청 처리
// 모든 요청을 처리하기 전에 필요한 필터링과 페이지네이션 로직 적용
server.use((req, res, next) => {
	// /comments 요청을 필터링하고 페이지네이션 처리
	if (req.path.includes('/comments') && req.method === 'GET') {
		const { post_id, _page, _limit } = req.query;
		
		// post_id가 있을 때만 필터링 진행
		if (post_id) {
			// db에서 comments 불러오기
			const comments = router.db.get('comments')
				.filter({ post_id: parseInt(post_id) })
				.value();
			// 페이지네이션 처리
			const page = parseInt(_page, 10) || 1;
			const limit = parseInt(_limit, 10) || comments.length; // limit가 없으면 모든 댓글 반환
			const start = (page - 1) * limit;
			const paginatedItems = comments.slice(start, start + limit);
			res.jsonp(paginatedItems);
			return; // 여기서 요청 종료
		}
	}
	next(); // 기타 모든 일반 요청은 json-server 기본 라우터로 넘어갑니다
});

server.use(router);
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

server.listen(3000, () => {
	console.log('JSON Server is running');
});