const { pgPool } = require("../db");

const router = require("express").Router();

router.get("/sessionUser", (req, res) => {
	const userId = req.session.passport?.user;

	if (!userId) {
		return res.status(401).json();
	}

	pgPool
		.query(
			"SELECT id, email, firstName, lastName FROM user_account WHERE id = $1",
			[userId]
		)
		.then((users) => {
			const user = users.rows[0];

			if (user) {
				return res.status(200).json({
					id: user.id,
					email: user.email,
					firstName: user.firstname,
					lastName: user.lastname,
					time: new Date()
				});
			} else {
				return res.status(404).json();
			}
		})
		.catch((err) => {
			return res.status(404).json(err);
		});
});

router.get("/exists/by", (req, res) => {
	const { id, email } = req.query;

	pgPool
		.query("SELECT * FROM user_account WHERE id = $1 OR email = $2", [
			id,
			email,
		])
		.then((users) => {
			const user = users.rows[0];

			if (user) {
				return res.status(200).json(user);
			} else {
				return res.status(404).json();
			}
		})
		.catch(() => {
			return res.status(500).json();
		});
});

router.delete("/sessionUser", (req, res) => {
	const userId = req.session.passport?.user;
	
	if (!userId) {
		return res.status(401).json();
	}


	pgPool.query("DELETE FROM user_account WHERE id = $1", [userId])
	.then(() => {
		return res.status(204).json();
	})
	.catch(() => {
		return res.status(500).json();
	})
})

module.exports = router;
