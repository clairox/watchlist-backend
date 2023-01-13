const passport = require("passport");
const bcrypt = require("bcrypt");
const init = require("./init");
const LocalStrategy = require("passport-local").Strategy;
const { pgPool } = require("../db");

passport.use(
	"local-signup",
	new LocalStrategy(
		{
			usernameField: "email",
			passReqToCallback: true,
			session: false,
		},
		(req, email, password, next) => {
			email = email.toLowerCase()
			pgPool.query(
				"SELECT * FROM user_account WHERE email = $1",
				[email],
				async (err, users) => {
					const user = users.rows[0];

					if (err) return next(err);

					if (user) {
						return next(null, false);
					} else {
						const hashedPassword = await bcrypt.hash(password, 10);
						const firstName = req.body.firstName;
						const lastName = req.body.lastName;

						pgPool.query(
							"INSERT INTO user_account (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING id, email, firstName, lastName",
							[firstName, lastName, email, hashedPassword],
							(err, newUsers) => {
								const newUser = newUsers.rows[0];
								if (err) return next(err);

								return next(null, {
									id: newUser.id,
									email: newUser.email,
									firstName: newUser.firstname,
									lastName: newUser.lastname,
								});
							}
						);
					}
				}
			);
		}
	)
);

passport.use(
	"local-login",
	new LocalStrategy(
		{
			usernameField: "email",
			passReqToCallback: true,
			session: false,
		},
		(req, email, password, next) => {
			email = email.toLowerCase()
			pgPool.query(
				"SELECT * FROM user_account WHERE email = $1",
				[email],
				(err, users) => {
					const user = users.rows[0];

					if (err) return next(err);
					if (!user) return next(null, false);

					bcrypt.compare(password, user.password, (err, isValid) => {
						if (err) return next(err);
						if (!isValid) return next(null, false);
						return next(null, {
							id: user.id,
							email: user.email,
							firstName: user.firstname,
							lastName: user.lastname,
						});
					});

					// if (!(user.password === password)) {
					//     return next(null, false)
					// }
					// else {
					//     return next(null, {
					//         id: user.id,
					//         email: user.email,
					//         firstName: user.firstname,
					//         lastName: user.lastname
					//     });
					// }
				}
			);
		}
	)
);

init();

module.exports = passport;
