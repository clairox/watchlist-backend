const passport = require("passport");
const { pgPool } = require("../db");

module.exports = () => {
	passport.serializeUser((user, next) => {
		next(null, user.id);
	});

	passport.deserializeUser((id, next) => {
		pgPool.query(
			"SELECT * FROM user_account WHERE id = $1",
			[id],
			(err, user) => {
				if (err) {
					return next(err);
				}
				next(null, user);
			}
		);
	});
};
