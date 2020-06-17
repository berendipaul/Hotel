require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const Rooms = require("./models/room");
const Comment = require("./models/comment");
const User = require("./models/user");
const expressSanitizer = require('express-sanitizer');

//requring routes
const commentRoutes = require("./routes/comments");
const roomsRoutes = require("./routes/rooms");
const indexRoutes = require("./routes/index");
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.connect("mongodb://localhost:27017/hotel_v1", {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.locals.moment = require('moment');
app.use(expressSanitizer());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: process.env.PASSPORT_SECRET,
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/rooms", roomsRoutes);
app.use("/rooms/:id/comments", commentRoutes);

app.listen(3000, () => {
	console.log("Serverul a pornit!");
});