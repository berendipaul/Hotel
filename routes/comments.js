const express = require("express");
const router = express.Router({mergeParams: true});
const Rooms = require("../models/room");
const Comment = require("../models/comment");
const middleware = require("../middleware");

//Comments new
router.get("/new", middleware.isLoggedIn, (req, res) => {
	//find room by id
	Rooms.findById(req.params.id, (err, room) => {
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {room: room});
		}
	});
});

//Comments Create
router.post("/", middleware.isLoggedIn, (req,res) => {
	//lookup room using ID
	Rooms.findById(req.params.id, (err, room) => {
		if(err){
			console.log(err);
			res.redirect("/rooms");
		} else {
			Comment.create(req.body.comment, (err,comment) => {
				if(err){
					req.flash("error", "Ceva a mers gresit!");
					console.log(err);
				} else {
					//add username and id to comments
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					room.comments.push(comment);
					room.save();
					req.flash("success", "Comentariul tau a fost adaugat cu succes!");
					res.redirect('/rooms/' + room._id);
				}
			});
		}
	});
});

// comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req,res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if(err){
			res.redirect("back");
		} else {
		    res.render("comments/edit", {room_id: req.params.id, comment: foundComment});
		}
	});

});

//comments update route
router.put("/:comment_id", middleware.checkCommentOwnership, (req,res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComemnt) => {
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/rooms/" + req.params.id);
		}
	});
});

//Comment destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, (req,res) => {
	//findByIdAndRemove
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if(err){
			res.redirect("back");
		} else {
			req.flash("success", "Comentariu sters");
			res.redirect("/rooms/" + req.params.id);
		}
	});
});

module.exports = router;