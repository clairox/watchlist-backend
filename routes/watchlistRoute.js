const WL = require('../db/watchlist');

const router = require('express').Router();

// pg Errors
// 22P02: invalid syntax
// 23503: foreign key violation

//TODO: replace favicon.ico
router.get('/', (req, res) => {
	const userId = req.session.passport?.user;

	WL.getWatchlists(userId)
		.then(data => {
			return res.status(200).json(data.rows)
			if (!data.rows.length) {
				return res.status(404).json();
			} else {
				return res.status(200).json(data.rows);
			}
		})
		.catch(err => {
			switch (err.code) {
				case '23503':
					return res.status(401).json();
				default:
					return res.status(500).json();
			}
		});
});

router.post('/', (req, res) => {
	const userId = req.session.passport?.user;

	WL.createWatchlist(userId, 'New watchlist', false)
		.then(data => {
			return res.status(200).json(data.rows[0]);
		})
		.catch(err => {
			switch (err.code) {
				case '22P02':
					return res.status(400).json();
				case '23503':
					return res.status(401).json();
				default:
					return res.status(500).json();
			}
		});
});

router.get('/default', async (req, res) => {
	const userId = req.session.passport?.user;
	const { populated, limit } = req.query;

	const watchlist = await WL.getDefaultWatchlist(userId)
		.then(async data => {
			return data.rows[0];
		})
		.catch(err => {
			switch (err.code) {
				case '23503':
					return res.status(401).json();
				default:
					return res.status(500).json();
			}
		});

	if (!watchlist) {
		return res.status(404).json();
	}

	if (populated === 'true') {
		const items = await WL.getWatchlistItems(watchlist.id, limit)
			.then(data => {
				return data.rows;
			})
			.catch(err => {
				switch (err.code) {
					case '22P02':
						return res.status(400).json();
					default:
						return res.status(500).json();
				}
			});

		return res.status(200).json({
			...watchlist,
			items,
		});
	} else {
		return res.status(200).json({
			...watchlist,
		});
	}
});

router.get('/:watchlistId', async (req, res) => {
	const userId = req.session.passport?.user;
	const { watchlistId } = req.params;
	const { populated, limit } = req.query;

	const watchlist = await WL.getOneWatchlist(userId, watchlistId)
		.then(async data => {
			return data.rows[0];
		})
		.catch(err => {
			switch (err.code) {
				case '22P02':
					return res.status(400).json();
				case '23503':
					return res.status(401).json();
				default:
					return res.status(500).json();
			}
		});

	if (!watchlist) {
		return res.status(404).json();
	}

	if (populated === 'true') {
		const items = await WL.getWatchlistItems(watchlist.id, limit)
			.then(data => {
				return data.rows;
			})
			.catch(err => {
				switch (err.code) {
					case '22P02':
						return res.status(400).json();
					default:
						return res.status(500).json();
				}
			});

		return res.status(200).json({
			...watchlist,
			items,
		});
	} else {
		return res.status(200).json({
			...watchlist,
		});
	}
});

router.patch('/:watchlistId/name', (req, res) => {
	const userId = req.session.passport?.user;
	const { watchlistId } = req.params;
	const { name } = req.body;

	WL.setWatchlistName(userId, watchlistId, name)
		.then(data => {
			return res.status(200).json(data.rows[0].name);
		})
		.catch(err => {
			switch (err.code) {
				case '22P02':
					return res.status(400).json();
				case '23503':
					return res.status(401).json();
				default:
					return res.status(500).json();
			}
		});
});

router.delete('/:watchlistId', (req, res) => {
	const userId = req.session.passport?.user;
	const { watchlistId } = req.params;

	WL.deleteWatchlist(userId, watchlistId)
		.then(() => {
			return res.status(204).json();
		})
		.catch(err => {
			switch (err.code) {
				case '22P02':
					return res.status(400).json();
				case '23503':
					return res.status(401).json();
				default:
					return res.status(500).json();
			}
		});
});

router.get('/:watchlistId/items/:itemId', (req, res) => {
	if (!req.session.passport.user) {
		return res.status(401).json();
	}

	const { watchlistId, id } = req.params;

	WL.getItem(watchlistId, id)
		.then(data => {
			if (data.rows[0]) {
				return res.status(200).json(data.rows[0]);
			} else {
				return res.status(404).json();
			}
		})
		.catch(() => {
			return res.status(500).json();
		});
});

router.put('/:watchlistId/items', (req, res) => {
	if (!req.session.passport.user) {
		return res.status(401).json();
	}

	const { watchlistId } = req.params;
	const { id, title, releaseDate, posterURL } = req.body;

	WL.addItem(watchlistId, id, title, releaseDate, posterURL)
		.then(data => {
			return res.status(200).json(data.rows[0]);
		})
		.catch(err => {
			switch (err.code) {
				case '22P02':
					return res.status(400).json();
				case '23503':
					return res.status(400).json();
				case '23505':
					return res.status(409).json();
				default:
					return res.status(500).json();
			}
		});
});

router.patch('/:watchlistId/items/:itemId/watched', (req, res) => {
	if (!req.session.passport.user) {
		return res.status(401).json();
	}

	const { watchlistId, itemId } = req.params;
	const { watched } = req.body;

	WL.setItemWatched(watchlistId, itemId, watched)
		.then(data => {
			return res.status(200).json(data.rows[0].watched);
		})
		.catch(err => {
			switch (err.code) {
				case '22P02':
					return res.status(400).json();
				case '23503':
					return res.status(400).json();
				default:
					return res.status(500).json();
			}
		});
});

router.delete('/:watchlistId/items/:itemId', (req, res) => {
	if (!req.session.passport.user) {
		return res.status(401).json();
	}

	const { watchlistId, itemId } = req.params;

	WL.deleteItem(watchlistId, itemId)
		.then(() => {
			return res.status(204).json();
		})
		.catch(err => {
			switch (err.code) {
				case '22P02':
					return res.status(400).json();
				case '23503':
					return res.status(400).json();
				default:
					return res.status(500).json();
			}
		});
});

router.get('/:watchlistId/itemCount', (req, res) => {
	if (!req.session.passport.user) {
		return res.status(401).json();
	}

	const { watchlistId } = req.params;

	WL.getWatchlistCount(watchlistId)
		.then(data => {
			return res.status(200).json(data.rows[0].count);
		})
		.catch(err => {
			switch (err.code) {
				case '22P02':
					return res.status(400).json();
				default:
					return res.status(500).json();
			}
		});
});

module.exports = router;
