require("dotenv").config({
	path: ".env",
});

const path = require("path");

const express = require("express");
const mongoose = require("mongoose");

// 1. Middlewares
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");

// 2. Importing routers
const userRouter = require("./routes/userRouter");
const errorHandler = require("./utils/errorHandler");

const app = express();

// 3. Connect to MongoDB
mongoose
	.connect(process.env.MONGO_SRV, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log("Connected to database!");
	})
	.catch((err) => {
		console.log("Cannot connect to database:", err);
	});

// *? 4. ATTACH MIDDLEWARES

// Morgan for request logging
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// Proxies with Heroku, ngnix etc
app.set("trust proxy", 1);

// Parse request body
app.use(express.json());

// For static files
app.use(express.static(path.join(__dirname, "public")));

// Parse cookies
app.use(cookieParser());

// Sanitize xss input
app.use(xss());

// Sanitize mongo NoSQL queries
app.use(mongoSanitize());

// General security headers
app.use(helmet());

// Compress request and response
app.use(compression());

// *? 5. MOUNT API ROUTERS
app.use("/api/v1/users", userRouter);

// *? 6. ERROR HANDLERS
app.use(errorHandler);

module.exports = app;
