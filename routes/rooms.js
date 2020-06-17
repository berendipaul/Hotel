const express = require("express");
const router = express.Router();
const Rooms = require("../models/room");
const middleware = require("../middleware");

//INDEX - show all rooms
router.get("/", (req, res) => {
let noMatch =null;
if(req.query.search){
	const regex = new RegExp(escapeRegex(req.query.search), 'gi');
	 // Get all rooms from DB
    Rooms.find({name:regex}, (err, allRooms) =>{
       if(err){
           console.log(err);
       } else {
          res.render("rooms/index",{rooms: alRooms, noMatch: noMatch, page: 'rooms'});
       }
    });
} else {
	// Get all rooms from DB
    Rooms.find({}, (err, allRooms) =>{
       if(err){
           console.log(err);
       } else {
		  if(allRooms.length <1){
			noMatch = "No rooms match that query, please try again.";
		  }
          res.render("rooms/index",{rooms: allRooms, noMatch:noMatch, page: 'rooms'});
       }
	});
    }
});
//CREATE - add new room to DB
router.post("/", middleware.isLoggedIn, (req, res) => {
    // get data from form and add to rooms array
    let name = req.body.name;
    let image = req.body.image;
	let cost = req.body.cost;
    let desc = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    }
    let newRoom = {name: name, image: image , cost: cost, description: desc, author:author}
    // Create a new room and save to DB
   Rooms.create(newRoom, (err, newlyCreated) => {
        if(err){
            console.log(err);
        } else {
            //redirect back to rooms page
            console.log(newlyCreated);
            res.redirect("/rooms");
        }
    });
});

// NEW- show form to create new room
router.get("/new", middleware.isLoggedIn, (req,res) => {
	res.render("rooms/new");
});

//SHOW- shows more info about one room
router.get("/:id", (req,res) => {
	//find the room with provided id
	Rooms.findById(req.params.id).populate("comments").populate({path: "reviews", options: {sort: {createdAt: -1}}}).exec((err, foundRoom) => {
		if(err){
			console.log(err);
		} else {
			console.log(foundRoom);
			//render show template with that room
	res.render("rooms/show", {room: foundRoom});
		}
	});
});

//EDIT room route
router.get("/:id/edit", middleware.checkRoomOwnership, (req,res) => {
		Rooms.findById(req.params.id, (err, foundRoom) => {
		res.render("rooms/edit", {room: foundRoom});
	 });
	});
	
// UPDATE room ROUTE
router.put("/:id", middleware.checkRoomOwnership, (req, res) => {
    // find and update the correct room
    Rooms.findByIdAndUpdate(req.params.id, req.body.room, (err, updatedRoom) => {
       if(err){
           res.redirect("/rooms");
       } else {
           //redirect somewhere(show page)
           res.redirect("/rooms/" + req.params.id);
       }
    });
});

//DESTROY ROOM ROUTE
router.delete("/:id", middleware.checkRoomOwnership, (req,res) => {
	Rooms.findByIdAndRemove(req.params.id, (err) => {
		if(err){
			res.redirect("/rooms");
		} else {
                    //  delete the room
                    req.flash("success", "Camera a fost stearsa cu succes!");
                    res.redirect("/rooms");
        }
    });
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;