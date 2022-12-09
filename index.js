const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const logger = require("morgan");
const path = require("path");

const { pgPool } = require("./db");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

const corsOptions = {
	origin: process.env.SITEURL,
	credentials: true,
};

/* middleware */
app.use(cors(corsOptions));

app.use((req, res, next) => {
	res.setHeader(
		"Access-Control-Allow-Origin",
		process.env.SITEURL
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, OPTIONS, PUT, PATCH, DELETE"
	);
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin,X-Requested-With,content-type"
	);
	res.setHeader("Access-Control-Allow-Credentials", true);
	next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../client/public")));
app.use(
	session({
		secret: process.env.SESSION_SECRET_KEY,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			sameSite: 'none',
		},
		store: new pgSession({
			//TODO: when deleting session cookie in browser, cookie stays in store. idk what to do lol
			pool: pgPool,
			createTableIfMissing: true,
		}),
	})
);
app.use(passport.initialize());
app.use(passport.session());

/* routes */
const indexRouter = require("./routes/indexRoute");
const userRouter = require("./routes/userRoute");
const watchlistRouter = require("./routes/watchlistRoute");
const itemRouter = require("./routes/itemRoute");

const version = process.env.API_VERSION;
app.use(`/${version}/`, indexRouter);
app.use(`/${version}/users`, userRouter);
app.use(`/${version}/watchlists`, watchlistRouter);
app.use(`/${version}/items`, itemRouter);

app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});
