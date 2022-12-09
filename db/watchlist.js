const { pgPool } = require(".");

const getWatchlists = (userId) => {
	return pgPool.query(
		'SELECT id, name, "default" FROM watchlist WHERE owner_id = $1',
		[userId]
	);
};
//, count(item) FROM watchlist LEFT JOIN item ON (item.watchlist_id = $2)
const getOneWatchlist = (userId, watchlistId) => {
	return pgPool.query(
		`SELECT watchlist.id, watchlist.name, watchlist.default, count(item.watchlist_id) as item_count
		FROM watchlist
		LEFT JOIN item
		ON (watchlist.id = item.watchlist_id)
		WHERE watchlist.owner_id = $1
		AND watchlist.id = $2
		GROUP BY watchlist.id;`,
		[userId, watchlistId]
	);
};

const getDefaultWatchlist = (userId) => {
	return pgPool.query(
		`SELECT watchlist.id, watchlist.name, watchlist.default, count(item.watchlist_id) as item_count
		FROM watchlist
		LEFT JOIN item
		ON (watchlist.id = item.watchlist_id)
		WHERE watchlist.owner_id = $1
		GROUP BY watchlist.id;`,
		[userId]
	);
};

const createWatchlist = (userId, name, isDefault) => {
	return pgPool.query(
		'INSERT INTO watchlist (owner_id, name, "default") VALUES ($1, $2, $3) RETURNING *',
		[userId, name, isDefault]
	);
};

const getWatchlistItems = (watchlistId, limit) => {
	limit = limit || 100;
	return pgPool.query(
		'SELECT id, title, release_date, poster_url, watched, favorite FROM item WHERE watchlist_id = $1 ORDER BY "createdAt" DESC LIMIT $2',
		[watchlistId, limit]
	);
};

const setWatchlistName = (userId, watchlistId, name) => {
	return pgPool.query(
		"UPDATE watchlist SET name = $1 WHERE owner_id = $2 AND id = $3 RETURNING name",
		[name, userId, watchlistId]
	);
};

const deleteWatchlist = (userId, watchlistId) => {
	return pgPool.query(
		"DELETE FROM watchlist WHERE owner_id = $1 AND id = $2",
		[userId, watchlistId]
	);
};

const getItem = (watchlistId, itemId) => {
	return pgPool.query(
		"SELECT * FROM item WHERE watchlist_id = $1 AND id = $2",
		[watchlistId, itemId]
	);
};

const addItem = (watchlistId, itemId, title, releaseDate, posterURL) => {
	return pgPool.query(
		`INSERT INTO item (id, title, release_date, poster_url, watchlist_id)
		VALUES ($1, $2, $3, $4, $5) 
		ON CONFLICT (id, watchlist_id) DO UPDATE
			set title = EXCLUDED.title,
				release_date = EXCLUDED.release_date,
				poster_url = EXCLUDED.poster_url
		RETURNING *`,
		[itemId, title, releaseDate, posterURL, watchlistId]
	);
};

const setItemWatched = (watchlistId, itemId, watched) => {
	return pgPool.query(
		"UPDATE item SET watched = $1 WHERE watchlist_id = $2 AND id = $3 RETURNING watched",
		[watched, watchlistId, itemId]
	);
};

const deleteItem = (watchlistId, itemId) => {
	return pgPool.query(
		"DELETE FROM item WHERE watchlist_id = $1 AND id = $2",
		[watchlistId, itemId]
	);
};

const getWatchlistCount = (watchlistId) => {
	return pgPool.query("SELECT count(*) FROM item WHERE watchlist_id = $1", [
		watchlistId,
	]);
};

module.exports = {
	getWatchlists,
	getOneWatchlist,
	getDefaultWatchlist,
	createWatchlist,
	getWatchlistItems,
	setWatchlistName,
	deleteWatchlist,
	getItem,
	addItem,
	setItemWatched,
	deleteItem,
	getWatchlistCount,
};
