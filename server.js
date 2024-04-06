const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

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

server.use(router);
server.listen(3000, () => {
	console.log('JSON Server is running');
});