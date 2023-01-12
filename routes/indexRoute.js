const router = require("express").Router();
const passport = require("../auth/passport");

router.post("/signup", passport.authenticate("local-signup"), (req, res) => {
	if (req.user) {
		return res.status(200).json(req.user);
	} else {
		return res.status(500).json();
	}
});

router.post("/login", passport.authenticate("local-login"), (req, res) => {
	if (req.user) {
		return res.status(200).json(req.user);
	} else {
		return res.status(500).json();
	}
});

router.get("/logout", (req, res) => {
	req.logout(() => {
		req.session.destroy(() => {
			return res
				.clearCookie("connect.sid", { path: "/" })
				.status(200)
				.json();
		});
	});
});

module.exports = router;
