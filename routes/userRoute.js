const { pgPool } = require("../db");
const bcrypt = require("bcrypt");


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
					lastName: user.lastname
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

router.patch("/sessionUser/name", async (req, res) => {
	const userId = req.session.passport?.user;
	
	if (!userId) {
		return res.status(401).json();
	}

	const { firstname, lastname } = req.body
	if (!firstname || !lastname) return res.status(400).json();

	pgPool.query("UPDATE user_account SET firstname = $1, lastname = $2 WHERE id = $3 RETURNING id, email, firstName, lastName", [firstname, lastname, userId])
	.then(users => {
		const user = users.rows[0]
		
		return res.status(200).json({
			id: user.id,
			email: user.email,
			firstName: user.firstname,
			lastName: user.lastname
		})
	})
	.catch(err => {
		console.log(err.code)
		return res.status(500).json();
	})
})

router.patch("/sessionUser/email", async (req, res) => {
	const userId = req.session.passport?.user;
	
	if (!userId) {
		return res.status(401).json();
	}

	const { email } = req.body
	if (!email) return res.status(400).json();

	pgPool.query("UPDATE user_account SET email = $1 WHERE id = $2 RETURNING id, email, firstName, lastName", [email, userId])
	.then(users => {
		const user = users.rows[0]
		
		return res.status(200).json({
			id: user.id,
			email: user.email,
			firstName: user.firstname,
			lastName: user.lastname
		})
	})
	.catch(err => {
		console.log(err)
		return res.status(500).json();
	})
})

router.patch("/sessionUser/password", async (req, res) => {
	const userId = req.session.passport?.user;
	
	if (!userId) {
		return res.status(401).json();
	}

	const { password } = req.body
	if (!password) return res.status(400).json();

	let hashedPassword = await bcrypt.hash(password, 10)

	pgPool.query("UPDATE user_account SET password = $1 WHERE id = $2 RETURNING id, email, firstName, lastName", [hashedPassword, userId])
	.then(users => {
		const user = users.rows[0]
		
		return res.status(200).json({
			id: user.id,
			email: user.email,
			firstName: user.firstname,
			lastName: user.lastname
		})
	})
	.catch(err => {
		console.log(err)
		return res.status(500).json();
	})
})



router.delete("/sessionUser", (req, res) => {
	const userId = req.session.passport?.user;
	
	if (!userId) {
		return res.status(401).json();
	}

	//TODO: delete watchlists associated with userId

	pgPool.query("DELETE FROM user_account WHERE id = $1", [userId])
	.then(() => {
		return res.status(204).json();
	})
	.catch(() => {
		return res.status(500).json();
	})
})

module.exports = router;
