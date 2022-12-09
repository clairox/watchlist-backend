const { pgPool } = require("../db");

const router = require("express").Router();

/*router.get("/ids", (req, res) => {
	if (!req.session.passport.user) {
		return res.status(401).json();
	}

	pgPool.query("SELECT id FROM item WHERE ")
})*/

module.exports = router;
