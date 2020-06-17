const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Rooms = require("../models/room");
const middleware = require("../middleware");
// require sendgrid/mail
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// root route
router.get("/", (req,res) => {
	res.render("home");
});

// about route
router.get("/about", (req,res) => {
	res.render("about");
});

//daycare route
router.get("/daycare", (req,res) => {
	res.render("daycare");
});

// salon&spa route
router.get("/salon", (req,res) => {
	res.render("salon");
});

//training route
router.get("/training", (req,res) => {
	res.render("training");
});

// faq route
router.get("/faq", (req,res) => {
	res.render("faq");
});

//show register form

router.get("/register", (req, res) => {
   res.render("register", {page: 'register'}); 
});


//handle sign up logic
router.post("/register", (req, res) => {
    let newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
      });

	if(req.body.adminCode === process.env.SECRET_CODE){
		newUser.isAdmin = true;
	}
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            req.flash('error', err.message);
            return res.redirect("/register", {error: err.message});
        }
        passport.authenticate("local")(req, res, () => {
           req.flash("success", "Bine v-am gasit, " + req.body.username + "!");
           res.redirect("/"); 
        });
    });
});

// show login form
router.get("/login", (req, res) => {
   res.render("login", {page: 'login'}); 
});
//handling login logic
router.post("/login", passport.authenticate("local", 
{
	successRedirect: "/",
    failureRedirect: "/login"
}), (req, res) => {});

//logout route
router.get("/logout", (req,res) => {
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/");
});
	
//USER PROFILE
router.get("/users/_id", (req,res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if(err){
		   req.flash("error", "Oops, Ceva a mers gresit, ");
		   res.redirect("/");
		   } 
		Rooms.find().where('author.id').equals(foundUser._id).exec((err, rooms) => {
			if(err){
		   req.flash("error", "Oops, Ceva a mers gresit... ");
		   res.redirect("/");
		   } 
			res.render("users/show", {user: foundUser, rooms: rooms});
		});
	});
});

// GET/contact
router.get('/contact', middleware.isLoggedIn, (req,res) => {
	res.render('contact'); 
});

// POST/contact
router.post('/contact', async (req,res) => {
	let { name,email, message} = req.body;
	name = req.sanitize(name);
	email = req.sanitize(email);
	message = req.sanitize(message);
	const msg = {
  to: 'berendi_paul@yahoo.com',
  from: email,
  subject: `Hotel Contact Form Submission from ${name}`,
  text: message,
  html: message,
  };
 try {
    await sgMail.send(msg);
	req.flash('success', 'Multumim pentru email-ul trimis, va vom contacta in cel mai scurt timp posibil.');
	res.redirect('/contact');
  } catch (error) {
    console.error(error);
 
    if (error.response) {
      console.error(error.response.body)
    }
	  req.flash('error', 'Ne pare rau, ceva a mers gresit, te rugam sa contactezi admin@ourwebsite.com');
	  res.redirect('back');
  }
});

module.exports = router;