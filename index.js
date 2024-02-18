const express = require("express");
const router = express.Router();
let RadioStation = require("./models/Radiostation");
let User = require("./models/User");
let vStation = require("./models/vStation");
let Message = require("./models/Message");
let Song = require("./models/Song");
let Friendship = require("./models/Friendship");
let Playlist = require("./models/Playlist");
let Thread = require("./models/Thread");
let privateMessage = require("./models/privateMessage");

const DataTypes = require("sequelize/lib/data-types");
const { Op, json } = require("sequelize");
const sequelize = require("./db/db");
const { spawn, exec } = require("node:child_process");
const fs = require("fs");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const GoogleApiKey = process.env.APIGOOGLE;
const multer = require("multer");
const ytdl = require('ytdl-core'); 
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const path = require("path");
const { Server } = require("socket.io");
const { createServer } = require('node:http');

//todo, move routes to their appropriate folders and files
//todo add audd music recognition

const { Audd } = require("audd.io");
const audd = new Audd(process.env.APISHAZAM);
console.log(audd, process.env.APISHAZAM);
sequelize.authenticate().then(async function (errors) {
  User = sequelize.models.User;
  vStation = sequelize.models.vStation;
  RadioStation = sequelize.models.RadioStation;
  Message = sequelize.models.Message;
  Song = sequelize.models.Song;

  sequelize.sync({ force: false });

  await RadioStation.create({
    StationName: "SDR RADIO",
    StationDescription: "LISTEN LIVE.",
    currentListeners: 80,
    hostSource: "http://localhost:8080",
    tunedFrequency: 100.5,
    allowFreeTuning: true,
    tunableRangeMin: 86,
    tunableRangeMax: 105,
    topSongs: ["Song D", "Song E", "Song F"],
  });
  (async () => {
    await sequelize.sync();
    try {
      for (let i = 0; i < 10; i++) {
        await Song.create({
          name: `Sample Song ${i + 1}`,
          likes: [],
          artist: `Sample Artist ${i + 1}`,
          discoveredLiveCount: Math.floor(Math.random() * 10),
          frequencyDiscoveredOn: Math.floor(Math.random() * 200),
          RadioStationDiscoveredOn: "00000000-0000-0000-0000-000000000000", // Example UUID
        });
      }
    } catch (error) {
      console.error("Error creating sample songs:", error);
    }
  })();
  Song.sync();
  // //TEST DATA
  // await vStation.create({
  //   StationName: "Radio Station A",
  //   StationDescription: "Broadcasting top hits 24/7.",
  //   currentListeners: 150,
  //   isBusy: 1,
  //   Songs: { song1: "Title A", song2: "Title B" },
  //   topSongs: ["Song A", "Song B", "Song C"],
  // });
  // await vStation.create({
  //   StationName: "Chill Beats FM",
  //   StationDescription: "Relax and enjoy the smooth beats.",
  //   currentListeners: 120,
  //   isBusy: 1,
  //   Songs: { song1: "Title E", song2: "Title F" },
  //   topSongs: ["Song G", "Song H", "Song I"],
  // });

  // await vStation.create({
  //   StationName: "Rock n Roll Radio",
  //   StationDescription: "Bringing the best of rock music.",
  //   currentListeners: 80,
  //   isBusy: 0,
  //   Songs: { song1: "Title C", song2: "Title D" },
  //   topSongs: ["Song D", "Song E", "Song F"],
  // });

  // console.log(errors) });
});


const proxy = require("express-http-proxy");
const app = express();
app.use(express.static(__dirname + "/public"));
app.use("/songs", express.static(__dirname + "songs"));
const secondServerForSomeGodForesakenReasonIHateSocketIo = createServer(app);
const session = require("express-session");
privateMessage.sync()
const bodyParser = require("body-parser");
const e = require("express");
const { send } = require("node:process");
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views"); // Assuming your EJS files are in the 'views' directory
router.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: false,
      secure: false,
    },
  })
);
const server = secondServerForSomeGodForesakenReasonIHateSocketIo.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
});






async function fetchYouTubePlaylist(playlistId) {
  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=id&part=snippet&playlistId=${playlistId}&key=${GoogleApiKey}&maxResults=100`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.items);
    songs = [];
    for (let i of data.items) {
      lol = await Song.create({
        name: i.snippet.title,
        likes: [],
        artist: i.snippet.videoOwnerChannelTitle,
        discoveredLiveCount: 0,
        frequencyDiscoveredOn: null,
        RadioStationDiscoveredOn: null, // Example UUID
        youtubeId: i.snippet.resourceId.videoId,
      });

      songs.push(lol.id);

      Song.sync();
    }
    cnt=await Playlist.findAll({where:{
      ownerId:user.id
    }})

    newone = await Playlist.create({
      ownerId: user.id,
      songs: songs,
      name: "Playlist #"+cnt.length,
    });
    await newone.save();
    return newone.id;
  } catch (error) {
    console.error("Error:", error.message);
  }
}

app.get('/streamAudio', (req, res) => {
  try{
  const url = req.query.url; // The YouTube video URL
    ytdl(url, { filter: 'audioonly' }).pipe(res);
  }catch(e){
    res.send(400)
    //handle this better lol
  }
});


router.post("/addPlaylist", async (req, res) => {
  resp = await fetchYouTubePlaylist(req.body)
  
  res.send(resp);
});
app.post("/uploadPFP", upload.single("file"), (req, res) => {
  try {
    const userId = req.session.userId; // Replace with how you retrieve user ID from the request

    // Create a folder with user ID if it doesn't exist
    const userFolderPath = path.join(__dirname, "public", userId.toString());
    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath);
    }

    // Write the file to the user's folder as pfp.png
    const filePath = path.join(userFolderPath, "pfp.png");
    fs.writeFileSync(filePath, req.file.buffer);

    res.json({ success: true, message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.use("/api", async (req, res, next) => {
  try {
    
    // if (!req.session.userId) {
    //   return res.status(401).json({ error: "Unauthorized. Please sign in." });
    // }

    const user = await User.findByPk(req.session.userId);
    console.warn(user);
    if (!user || !user.tunedStationID) {
      return res
        .status(404)
        .json({ error: "User is not tuned to any radio station." });
    }

    const tunedRadioStation = await RadioStation.findByPk(user.tunedStationID);

    if (!tunedRadioStation || !tunedRadioStation.hostSource) {
      return res.status(404).json({
        error:
          "Tuned radio station not found or missing host source information.",
      });
    }

    const hostSource = tunedRadioStation.hostSource;

    proxy(hostSource, {
      proxyReqPathResolver: function (req) {
        return "/api" + req.url;
      },
    })(req, res, next);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/getSong", (req, res) => {
  const { sampleId } = req.query;
  res.sendFile(`${__dirname}/songs/${sampleId}/audio.mp3`);
});
router.use(async (req, res, next) => {
  if (req.method == "GET") {
    console.log("---" + req.session, req.path, req.body);

    if (!req.session) {
      req.session = { userId: 0 };
    }
    let usr;
    if (req.session.userId != 0) {
      usr = await User.findByPk(req.session.userId);

      if (usr) {
        if (req.path != "/login") {
          return next();
        } else {
          return res.redirect("/");
        }
      }
    }
  }
  return next();
});
require('./authroutes.js')(router); 

router.get("/", (r, res) => {
  res.redirect("/home");
});
router.get("/stationsPage", (req, res) => {
  res.sendFile(__dirname + "/views/Stations.html");
});
router.get("/home", async (req, res) => {
  let user = await User.findByPk(req.session.userId)
  if (!user || !user.username) {
    console.log(req.session.userId);
    user = { username: "Guest" };
  }
  res.render("home", { username: user.username });
});

router.get("/player", async (req, res) => {
  let user = res.locals.user

  if (user && user.tunedStationID) {
    let radioHostname = await RadioStation.findByPk(user.tunedStationID)
     radioHostname = radioHostname.hostSource;
    res.render("player", { host: radioHostname });
  } else {
    res.render("player", { host: 0 });
  }
});
router.get("/getRadioStations", async (req, res) => {
  realRadios = await RadioStation.findAll({ where: {} });
  vRadios = await vStation.findAll({ where: {} });
  result = realRadios.concat(vRadios);
  user =  await User.findByPk(req.session.userId)

  if (!user) {
    for (i of result) {
      if (i.isSDR) {
        i.dataValues.loginRequired = true;
        console.log(i);
      }
    }
  }
  res.send(result);
});

router.use(async (req, res, next) => {
  user =  await User.findByPk(req.session.userId)
  if (!user) return res.send(403);
  res.locals.user = user;
  next();
});



router.get("/chat", async (req, res) => {
  let user = res.locals.user
 friends=await Friendship.findAll({where:{[Op.or]:[{user1:user.id},{user2:user.id}]}})
 friendUsernames=[]
 for(i of friends){
  if(i.user1!=user.id){
    us=await User.findByPk(i.user1)
    friendUsernames.push(us.username)
  }else{
    us=await User.findByPk(i.user2)
    friendUsernames.push(us.username)

  }
 }
 console.log(friendUsernames)
  res.render("chatbox",{friends,myId:user.id,friendUsernames})
});


router.get("/listenTo", async (req,res)=>{
  s=await Song.findByPk(req.query.songid)
  console.log(s)
  res.render("song", {song:s})
})
router.post("/likeSong", async (req, res) => {
  const songToLike = await Song.findByPk(req.body);
  console.log("\n\n\n\n\n", songToLike);
  if (songToLike) {
    if (req.session.userId) {
      if (!songToLike.likes.includes(req.session.userId)) {
        songToLike.likes = songToLike.likes.concat(req.session.userId);
        console.log("\n\n\n\n\n\n\n\n", songToLike.likes);
        await songToLike.save();
      }
      res.send(200);
    } else {
      res.send(400, "Must log in to commit this action.");
    }
  }
});
router.post("/unlikeSong", async (req, res) => {
  try {
    const songToUnlike = await Song.findByPk(req.body); // Assuming req.body.songId contains the ID of the song to unlike

    if (songToUnlike) {
      if (req.session.userId) {
        // Remove the user ID from the likes array
        const updatedLikes = songToUnlike.likes.filter(
          (like) => like !== req.session.userId
        );
        songToUnlike.likes = updatedLikes;

        // Save the changes
        await songToUnlike.save();

        res.sendStatus(200);
      } else {
        res.status(400).send("Must log in to commit this action.");
      }
    } else {
      res.status(404).send("Song not found.");
    }
  } catch (error) {
    console.error("Error unliking song:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/changeBio", async (req, res) => {
  user = await User.findByPk(req.session.userId);
  if (user) {
    user.bio = req.body;
    user.save();
  }
});
router.get("/user", async (req, res) => {
  selfUser = await User.findByPk(req.session.userId);

  user = await User.findOne({
    where: {
      username: req.query.username,
    },
  });

  if(!user){
    userthreads = await Thread.findAll({ where: { postedOn: selfUser.id } })
    friends=await Friendship.findAll({where:{[Op.or]:[{user1:user.id},{user2:user.id}]}})
    return res.render("profile", {

    user: selfUser,
    selfUser: selfUser,
    threads: userthreads,
    friends
  });
}
  console.log(user + "\n\n\n\n\n");
  userthreads = await Thread.findAll({ where: { postedOn: user.id } });
  res.render("profile", {
    user: user,
    selfUser: selfUser,
    threads: userthreads,
  });
});
app.post("/sendFriendRequest", async (req, res) => {
  const username = JSON.parse(req.body).username;
  console.warn(username);
  const currentUser = res.locals.user;

  const friend = await User.findOne({ where: { username: username } });
  if (!friend) {
    return res.status(404).json({ error: "User not found" });
  }

  console.log(friend.friendRequests);
  if (!!friend.friendRequests.indexOf(currentUser.id)) {friend.friendRequests = friend.friendRequests.concat([currentUser.id]);}
  await friend.save()
  console.log(friend.friendRequests);

  res.status(200).json({ message: "Friend request sent" });
});


app.post("/acceptFriendRequest", async (req, res) => {
  try {
    const currentUser = res.locals.user;
    const friendUsername = JSON.parse(req.body).username;
    const friend = await User.findOne({ where: { username: friendUsername } });

    if (!friend) {
      return res.status(404).json({ error: "User not found" });
    }
    try {
      await Friendship.create({ user1: currentUser.id, user2: friend.id });
    } catch (e) {
      res.status(400);
    }
    await Friendship.sync();
    const frReq =  currentUser.friendRequests
    console.log(currentUser.friendRequests)
    currentUser.friendRequests=((frReq)).filter(e => e != friend.id)
    console.log(currentUser.friendRequests)

   await currentUser.save();
    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});
app.post("/unfriend", async (req, res) => {
  try {
    const currentUser = res.locals.user;
    const friendUsername = JSON.parse(req.body).username;
    const friend = await User.findOne({ where: { username: friendUsername } });

    if (!friend) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if there is an existing friendship between currentUser and friend
    const existingFriendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { user1: currentUser.id, user2: friend.id },
          { user1: friend.id, user2: currentUser.id },
        ],
      },
    });

    if (!existingFriendship) {
      return res.status(400).json({ error: "No existing friendship found" });
    }

    // Delete the friendship record
    await existingFriendship.destroy();

    res.status(200).json({ message: "Unfriended successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/denyFriendRequest", async (req, res) => {
  try {
    const currentUser = res.locals.user;
    const friendUsername = JSON.parse(req.body).username;
    const fiend = await User.findOne({ where: { username: friendUsername } });

    if (!fiend) {
      return res.status(404).json({ error: "User not found" });
    }
    const frReq =  currentUser.friendRequests
    console.log(currentUser.friendRequests)
    currentUser.friendRequests=((frReq)).filter(e => e != fiend.id)
    console.log(currentUser.friendRequests)

   await currentUser.save();
    res.status(200).json({ message: "Friend request denied" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/unfriend", async (req, res) => {
  try {
    const username = req.body.username;
    const currentUser = res.locals.user;

    // Check if the user to be removed as a friend exists
    const friend = await User.findOne({ where: { username: username } });
    if (!friend) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { user1: currentUser.id, user2: friend.id },
          { user1: friend.id, user2: currentUser.id },
        ],
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    await friendship.destroy();

    res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/myFriends", async (req, res) => {
  const userId = res.locals.user.dataValues.id;
  console.log(userId);
  const friendships = await Friendship.findAll({
    where: {
      [Op.or]: [{ user1: userId }, { user2: userId }],
    },
  });

  // Extract the friend's userIds
  const friendUserIds = friendships.map((friendship) =>
    friendship.user1 === userId ? friendship.user2 : friendship.user1
  );

  // Fetch the user's friends
  const friends = await User.findAll({ where: { id: friendUserIds } });
  let result = [];
  for (i of res.locals.user.friendRequests) {
    usrn = await User.findByPk(i);
    result.push({ id: i, username: usrn.username });
  }
  const myFriendRequests = JSON.stringify(result);
  console.log("\n\n\n\n\n\n\n\n\n\n\n\n" + myFriendRequests);
  // Send a success response with the friends
  res.render("friends", {
    friends: JSON.stringify(friends),
    friendRequests: myFriendRequests,
  });
});

router.get("/topHits", async (req, res) => {
  user = await User.findOne({ where: { id: req.session.userId } });
  playlists=user.addedPlaylists
  playlistsSerialized=[{name:"hello"}]
  console.log(playlists)
  for(i of playlists){
    cur=await Playlist.findByPk(i)
    playlistsSerialized.push(cur)
  }
  //likedOnly
  res.render("topHits", { mode: "all", user: user, playlists:playlistsSerialized ,playlistId:""});
});
router.get("/likedSongs", async (req, res) => { playlists=user.addedPlaylists

  res.render("topHits", { mode: "likedOnly", user: res.locals.user, playlists ,playlistId:"" });
});
router.get("/getSongs", async (req, res) => {
  usr = res.locals.user
 
  try {
    usr;
    console.log("usr found");
    result = await Song.findAll({
      where: { RadioStationDiscoveredOn: usr.tunedStationID },
    });
    res.send(result);
  } catch {
    console.log("usr not foudn");
    result = await Song.findAll({});
    console.log(result);

    res.send(result);
  }
});
router.post("/getLikedSongs", async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);

    if (user) {
      console.log("User found");

      const likedSongs = await Song.findAll({
        where: {
          likes: {
            [Op.substring]: String(user.id),
          },
        },
      });
      res.send(likedSongs);
    } else {
      console.log("User not found");
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/playlist", async (req, res) => {
  if(req.query.id){
    let pl = await Playlist.findByPk(req.query.id);

    if(pl){
      res.render("topHits", { mode: "playlist", user: res.locals.user, playlistId: req.query.id });
    }
  }
});

router.post("/getSongs", async (req, res) => {
  
  user = res.locals.user
  if(req.query.playlistId){
    console.log("\n\n\n\n\n\n\n\n"+JSON.stringify(req.query))
    let pl = await Playlist.findByPk(req.query.playlistId.slice(1,req.query.playlistId.length-1));
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n"+(req.query.playlistId)+"\n\n\n!!!!!!!!!!!!!!!!!!")
    if(pl){
      let songs = []
    console.log(pl.songs)
    for(i of pl.songs){
      m=await Song.findByPk(i)
      songs.push(m)
    }
    return res.send(songs)
  }
  return res.send(500)
  }
  console.log(req.body);
  const { filterby, radiosource, reversefilterbtn } = JSON.parse(req.body);
  let orderBy;
  if (filterby == "date") {
    orderBy = [["discoveryDate", reversefilterbtn == "-1" ? "DESC" : "ASC"]];
  } else if (filterby == "name") {
    orderBy = [["name", reversefilterbtn == "-1" ? "DESC" : "ASC"]];
  } else {
    // Default to likes, handled later in code due to complex sorting
    orderBy = [["likes", reversefilterbtn == "-1" ? "DESC" : "ASC"]];
  }
  console.log(orderBy);
  let whereClause = {};
  if (radiosource === "curr") {
    // Assuming user is defined and contains the necessary property
    if (user && user.tunedStationID) {
      whereClause = { RadioStationDiscoveredOn: user.tunedStationID };
    }
  }

  try {
    let result = await Song.findAll({
      where: whereClause,
      order: orderBy,
    });
    console.log("orderBy:", orderBy);

    // Handle complex sorting by likes separately

    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching songs.");
  }
});

// router.get("/", (req, res) => {
//   res.sendFile(__dirname + "/ok.html");
// });

router.get("/tuneIn", async (req, res) => {
  try {
    const { stationId } = req.query;
    console.log(req.query);

    if (!stationId === undefined) {
      return res
        .status(400)
        .json({ error: "Both stationId and virtual are required." });
    }

    let station;
    us = await User.findByPk(req.session.userId);

    station = await vStation.findByPk(stationId);
    if (!station) {
      station = await RadioStation.findByPk(stationId);
    }

    if (!station) {
      return res.status(404).json({ error: "Station not found." });
    }
    console.log(station);
    us.tunedStationID = station.id;
    us.save();
    us = await User.findByPk(req.session.userId);

    console.log(us.tunedStationID);
    // Update the User's tunedStationID here

    return res.json({ message: "Tuned in successfully", station });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/changeTunedFreq", async (req, res) => {
  try {
    curUs = User.findByPk(req.session.userId);
    const { id, newFrequency } = req.query;
    if (!curUs.isTunedToVirtual) {
      if (!id || !newFrequency) {
        return res
          .status(400)
          .json({ error: "Both ID and newFrequency are required." });
      }

      const radioStation = await RadioStation.findByPk(id);

      if (!radioStation) {
        return res.status(404).json({ error: "Radio station not found." });
      }

      radioStation.tunedFrequency = parseFloat(newFrequency);
      await radioStation.save();

      return res.json({ message: "Tuned frequency updated successfully." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// router.patch("/changeSetting",async (req, res) => {
//   const { name, value } = req.body;
//   usr = await User.findByPk(req.session.userId);
//   if (usr) {
//     req.session.settings.name=value
//   }
// });
router.post("/chatMessage", async (req, res) => {
  const { content, sendTo, source } = req.body;
  
  const user = await User.findByPk(req.session.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (source === "friends") {
    const friend = await User.findOne({where:{username:sendTo}});
    if (!friend) {
      return res.status(404).json({ error: "Friend not found." });
    }

    const newPrivateMessage = await privateMessage.create({
      user1: req.session.userId,
      user2: friend.id,
      sentBy:1,
      messageContent: content,
      timestamp: new Date(),
    });

    return res.json({
      message: "Private message sent successfully",
      message: newPrivateMessage,
    });
  } else {
    if (!user.tunedStationID) {
      return res.status(404).json({ error: "User is not tuned to any radio station." });
    }

    const newPublicMessage = await Message.create({
      senderID: req.session.userId,
      messageContent: content,
      timestamp: new Date(),
      radioStationID: user.tunedStationID,
      senderUsername: user.username,
    });

    return res.json({
      message: "Public message sent successfully",
      message: newPublicMessage,
    });
  }
});


router.get("/chatMessages", async (req, res) => {
  try {
    const user=res.locals.user
    const sourcequery=req.query.source
    console.log(sourcequery)
    if(!sourcequery){
      return res.send(400)
    }
    if (sourcequery == "friends") {
      if (req.query.friendId) {
        frId = req.query.friendId;
       let friend= await User.findOne({where:{username:frId}})
        const chatMessages = await privateMessage.findAll({
          where: {
            [Op.or]: [
              { user1: friend.id, user2: user.id },
              { user2: user.id, user2: friend.id },
            ],
          },
         order: [["timestamp", "DESC"]],
         limit: 100,
       });
        return res.json({ chatMessages });

      }
    }else{
    if (!user || !user.tunedStationID) {
      return res
        .status(404)
        .json({ error: "User is not tuned to any radio station." });
    } else {
      const radioStationID = user.tunedStationID;

      const chatMessages = await Message.findAll({
        where: {
          radioStationID: user.tunedStationID,
        },
        order: [["timestamp", "DESC"]],
        limit: 100,
      });

      return res.json({ chatMessages });
    }
  }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
  
});

const moment = require('moment');
const cron = require('node-cron');
cron.schedule('0 0 * * *', async () => {
  const twentyFourHoursAgo = moment().subtract(24, 'hours').toDate();

  try {
    await Message.destroy({
      where: {
        timestamp: {
          [Op.lt]: twentyFourHoursAgo,
        },
      },
    });

    console.log('Successfully deleted messages older than 24 hours.');
  } catch (error) {
    console.error('Failed to delete messages:', error);
  }
});


router.get("/myPlaylists",async (req,res )=>{
  user = res.locals.user
  playlists=user.addedPlaylists
  result=[]
  for(i of playlists){
    temp = await Playlist.findByPk(i)
    if(temp) result.push(temp)
  }
  console.log(playlists)
  res.render("playlistBrowser",{playlists:result})
})
router.post("/addToPlaylist", async (req, res) => {
  try {
    const user = res.locals.user;
    const parsedBody = JSON.parse(req.body)
    const playlistName = parsedBody.playlistName;
    console.log(parsedBody)
    const songId = parsedBody.songId;

    let playlist = await Playlist.findOne({ where: { name: playlistName, ownerId: user.id } });

    if (!playlist) {
      let playlistc = await Playlist.create({
        ownerId: user.id,
        songs: [songId],
        name: playlistName
      });
     await playlistc.save()
      user.addedPlaylists = [...user.addedPlaylists, playlistc.id];
      playlistc.songs = [songId];
      await playlistc.save()


    } else {
      playlist.songs = [...playlist.songs, songId];
    }

    // Save changes
    await user.save();

    // Send success status
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.post("/thread", async (req, res) => {
  newthread = await Thread.create({
    postedOn: req.body.username,
    postedBy: res.locals.user.id,
    content: req.body.content,
  });
  newthread.save();
  res.send(200);
  console.log("\n\n\n\n\n" + JSON.stringify(newthread));
});
router.get("/threads", async (req, res) => {
  const user = await User.findByPk(req.session.userId);
  if (user) {
    threads = await Thread.findAll({
      where: { postedOn: req.query.username },
      order: [["postDate", "ASC"]],
    });
    res.send(JSON.stringify(threads));
  }
});

router.get("/discoverSong", async (req, res) => {
  try {
    usr = await User.findByPk(req.session.userId);
    if (usr && usr.tunedStationID) {
      radio = await RadioStation.findByPk(usr.tunedStationID);

      if (radio) {
        potentialId = DataTypes.UUIDV4;
        rnd = Math.round(Math.random() * 1000000);
        // rnd=potentialId
        const childProcess = spawn("mkdir", [`./songs/${rnd}`]);

        // Listen for the 'exit' event of the child process
        childProcess.on("exit", async (code) => {
          // Once the child process has finished, mark the station as not busy

          command = `curl -m 10 ${radio.hostSource}/api/radio/audio.flac -o ./songs/${rnd}/audio.flac`;

          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`stderr: ${stderr}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
          });
          // Listen for data from the child process
          setTimeout(async () => {
            commandtwo = `ffmpeg -i ./songs/${rnd}/audio.{flac,mp3} -threads 4`;

            exec(commandtwo, (error, stdout, stderr) => {
              if (error) {
                console.error(`Error: ${error.message}`);
                return;
              }
              if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
              }
              console.log(`stdout: ${stdout}`);
            });

            setTimeout(async () => {
              var data = {
                api_token: process.env.APISHAZAM,
                file: fs.createReadStream(
                  __dirname + `/songs/${rnd}/audio.mp3`
                ),
                return: "apple_music,spotify",
              };


                //  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=id&part=snippet&playlistId=${playlistId}&key=${GoogleApiKey}&maxResults=100`;
   // const response = await fetch(apiUrl);




              axios({
                method: "post",
                url: "https://api.audd.io/",
                data: data,
                headers: { "Content-Type": "multipart/form-data" },
              })
                .then(async (response) => {
                  console.log(response.data);
                  if (response.data.result) {
                    resultAud=response.data.result


                    res.send(resultAud);

                    axios({
                      method: "get",
                      url:`https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURI(resultAud.title+" "+resultAud.artist)}&key=${GoogleApiKey}`,
                    }).then(async (secondRes)=>{
                      console.log(secondRes)
                      const newSong = await Song.create({
                        sampleId: rnd,
                        name: resultAud.title,
                        artist: resultAud.artist,
                        discoveredLiveCount: 0,
                        frequencyDiscoveredOn: usr.tunedFrequency,
                        RadioStationDiscoveredOn: usr.tunedStationID,
                        youtubeId:secondRes.data.items[0].id.videoId
  
                      });
                      await newSong.save()
                    })


                  } else {
                    res.send(404);
                  }
                })
                .catch((error) => {
                  console.log(error);
                });

              // Listen for the 'exit' event of the child process
            }, 1000);
          }, 12000);
        });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500, e);
  }
});
router.post("/createStation",async (req,res)=>{
  try {
    const { host, stationName, stationDescription } = JSON.parse(req.body);
    if (!stationDescription) {
      stationDescription = "Just a radio :p";
    }
    if (!host || !stationName) {
      return res
        .status(400)
        .json({ error: "YouTube link and station name are required." });
    }

    const newStation = await RadioStation.create({
      StationName: stationName,
      StationDescription: stationDescription,
      hostSource: host,
      isBusy: true,
    });
    await newStation.save()
    res.status(200)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
})
router.post("/createVirtualRadio", async (req, res) => {
  try {
    const { youtubeLink, stationName, stationDescription } = req.body;
    if (!stationDescription) {
      stationDescription = "Just a radio :p";
    }
    if (!youtubeLink || !stationName) {
      return res
        .status(400)
        .json({ error: "YouTube link and station name are required." });
    }

    const newVStation = await vStation.create({
      StationName: stationName,
      StationDescription: stationDescription,
      topSongs: topSongs,
      isBusy: true,
    });

    const childProcess = spawn("node", [
      process.env.YAPHPATH,
      youtubeLink,
      "-t",
      "10",
      "-f",
      "audioonly",
      "-q",
      "highest",
      "-o",
      `/home/nike/ebavkiyoutube/yaph/${newVStation.id}`,
    ]);

    // Listen for the 'exit' event of the child process
    childProcess.on("exit", (code) => {
      // Once the child process has finished, mark the station as not busy
      vStation.update({ isBusy: false }, { where: { id: newVStation.id } });
      console.log(`Child process exited with code ${code}`);
    });

    // Handle subprocess stdout, error, etc.

    return res.json({
      message: "Virtual radio created successfully",
      vStation: newVStation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
