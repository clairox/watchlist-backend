const { pgPool } = require(".");

const getWatchlists = async (userId) => {
	return await pgPool.query(
		'SELECT id, name, "default" FROM watchlist WHERE owner_id = $1',
		[userId]
	);
};
//, count(item) FROM watchlist LEFT JOIN item ON (item.watchlist_id = $2)
const getOneWatchlist = async (userId, watchlistId) => {
	return await pgPool.query(
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

const getDefaultWatchlist = async (userId) => {
	return await pgPool.query(
		`SELECT watchlist.id, watchlist.name, watchlist.default, count(item.watchlist_id) as item_count
		FROM watchlist
		LEFT JOIN item
		ON (watchlist.id = item.watchlist_id)
		WHERE watchlist.owner_id = $1
		GROUP BY watchlist.id;`,
		[userId]
	);
};

const createWatchlist = async (userId, name, isDefault) => {
	return await pgPool.query(
		'INSERT INTO watchlist (owner_id, name, "default") VALUES ($1, $2, $3) RETURNING *',
		[userId, name, isDefault]
	);
};

const getWatchlistItems = async (watchlistId, limit) => {
	limit = limit || 100;
	return await pgPool.query(
		'SELECT id, title, release_date, poster_url, watched, favorite FROM item WHERE watchlist_id = $1 ORDER BY "createdAt" DESC LIMIT $2',
		[watchlistId, limit]
	);
};

const setWatchlistName = async (userId, watchlistId, name) => {
	return await pgPool.query(
		"UPDATE watchlist SET name = $1 WHERE owner_id = $2 AND id = $3 RETURNING name",
		[name, userId, watchlistId]
	);
};

const deleteWatchlist = async (userId, watchlistId) => {
	return await pgPool.query(
		"DELETE FROM watchlist WHERE owner_id = $1 AND id = $2",
		[userId, watchlistId]
	);
};

const getItem = async (watchlistId, itemId) => {
	return await pgPool.query(
		"SELECT * FROM item WHERE watchlist_id = $1 AND id = $2",
		[watchlistId, itemId]
	);
};

const addItem = async (watchlistId, itemId, title, releaseDate, posterURL) => {
	return await pgPool.query(
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

const setItemWatched = async (watchlistId, itemId, watched) => {
	return await pgPool.query(
		"UPDATE item SET watched = $1 WHERE watchlist_id = $2 AND id = $3 RETURNING watched",
		[watched, watchlistId, itemId]
	);
};

const deleteItem = async (watchlistId, itemId) => {
	return await pgPool.query(
		"DELETE FROM item WHERE watchlist_id = $1 AND id = $2",
		[watchlistId, itemId]
	);
};

const getWatchlistCount = async (watchlistId) => {
	return await pgPool.query("SELECT count(*) FROM item WHERE watchlist_id = $1", [
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
