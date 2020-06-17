const Rooms = require("../models/room");
const Comment = require("../models/comment");

// all the middleware goes here
let middlewareObj = {};


middlewareObj.checkRoomOwnership = (req, res, next) => {
	if(req.isAuthenticated()){
		Rooms.findById(req.params.id, (err, foundRoom) => {
		if(err || !foundRoom){
			req.flash("error", "Camera nu a fost gasita");
			res.redirect("back");
		} else if(foundRoom.author.id.equals(req.user._id) || req.user.isAdmin){
          req.rooms = foundRoom;
          next();
		} else {
			 // does user own the room?
			if(foundRoom.author.id.equals(req.user._id)) {
				next();
			} else {
				req.flash("error", "Nu ai permisiune sa faci asta!");
				res.redirect("back");
			}
		}
	 });
	} else {
		req.flash("error", "Trebuie sa te loghezi mai intai!");
		res.redirect("back");
	}
}


middlewareObj.checkCommentOwnership = (req, res, next) => {
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err, foundComment) => {
		if(err || !foundComment){
			req.flash('error', 'Imi pare rau, acel comentariu nu exista');
			res.redirect("back");
		} else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
		} else {
			 // does user own the comment?
			if(foundComment.author.id.equals(req.user._id)) {
				next();
			} else {
				req.flash("error", "Nu ai permisiunea sa faci asta!");
				res.redirect("back");
			}
		}
	 });
	} else {
		req.flash("error", "Trebuie sa te loghezi mai intai!");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Trebuie sa te loghezi mai intai");
	res.redirect("/login");
}


module.exports = middlewareObj;