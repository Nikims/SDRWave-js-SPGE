const express = require("express");
const router = express.Router();
let RadioStation = require("./models/Radiostation");
let User = require("./models/User");
let vStation = require("./models/vStation");
let Message = require("./models/Message");
let Song = require("./models/Song");
const DataTypes = require("sequelize/lib/data-types");

const sequelize = require("./db/db");
const { spawn ,exec} = require('node:child_process');
const fs=require("fs")
const axios = require('axios');
const dotenv = require("dotenv");
dotenv.config();
//todo, move routes to their appropriate folders and files
//todo add audd music recognition

const { Audd } = require('audd.io');
const audd = new Audd(process.env.APISHAZAM);  
console.log(audd,process.env.APISHAZAM)
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
          RadioStationDiscoveredOn: '00000000-0000-0000-0000-000000000000', // Example UUID
        });
      }
    } catch (error) {
      console.error('Error creating sample songs:', error);
    }
  })();
  Song.sync()
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
const bcrypt = require("bcrypt");
const proxy = require("express-http-proxy");
const app = express();
app.use(express.static(__dirname + "/public"));
app.use('/songs', express.static((__dirname +'songs')));

const session = require("express-session");

const bodyParser = require("body-parser");
const e = require("express");
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
  }),
);
const server = app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
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
app.get("/getSong",(req,res)=>{
  const {sampleId} = req.query
  res.sendFile(`${__dirname}/songs/${sampleId}/audio.mp3`)
})
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
router.post("/signup", async (req, res) => {
  try {
    const { username, password, repeatPassword } = req.body;
    console.log(req.body);
    if (password.length < 5) {
      return res
        .status(400)
        .json({
          error: `We don't collect sensitive data, but still, ${password.length} characters?`,
        });
    }
    if (password != repeatPassword) {
      return res.status(400).json({ error: "Passwords must match :P" });
    }
    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or username is already in use." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      hashedPassword,
    });
    req.session.userId = newUser.id;
    console.log(req.session.userId);
    return res.json({ message: "Signup successful", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Both email and password are required." });
    }

    const existingUser = await User.findOne({ where: { username } });

    if (!existingUser) {
      return res.status(401).json({ error: "No record of user found." });
    }
    console.log(existingUser);
    console.log(password, existingUser.hashedPassword);

    const passwordMatch = await bcrypt.compare(
      password,
      existingUser.hashedPassword,
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    req.session.userId = existingUser.id;
    return res.json({ message: "Sign-in successful", user: existingUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getRadioStations", async (req, res) => {
  realRadios = await RadioStation.findAll({ where: {} });
  vRadios = await vStation.findAll({ where: {} });
  result = realRadios.concat(vRadios);
  user = await User.findByPk(req.session.userId);

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
router.post("/likeSong",async(req,res)=>{
  console.log(req.body)
  const songToLike = await Song.findByPk(req.body)

  if(songToLike){
    if(req.session.userId){
    songToLike.likes.push({user:req.session.userId})
   songToLike.save();

  res.send(200)}else{
    res.send(400,"Must log in to commit this action.")
    }
  }
})
router.post("/unlikeSong", async (req, res) => {
  try {
    const songToUnlike = await Song.findByPk(req.body.songId); // Assuming req.body.songId contains the ID of the song to unlike

    if (songToUnlike) {
      if (req.session.userId) {
        // Remove the user ID from the likes array
        const updatedLikes = songToUnlike.likes.filter(like => like.user !== req.session.userId);
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

router.get("/topHits",async (req,res)=>{
  res.render("topHits",{likedOnly:false})
})
router.get("/likedSongs",async (req,res)=>{
  res.render("topHits",{likedOnly:true})
})
router.get("/getSongs", async (req, res) => {
  
  user = await User.findByPk(req.session.userId);
  try{
    usr
    console.log("usr found")
  result=await Song.findAll({where:{ RadioStationDiscoveredOn:usr.tunedStationID
  }})
  res.send(result)}catch{
    console.log("usr not foudn")
   result= await Song.findAll({})
   console.log(result)
   
   res.send(result)
  }
});
router.get("/getLikedSongs", async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);

    if (user) {
      console.log("User found");

      const likedSongs = await Song.findAll({
        where: {
          likes: {
            [Sequelize.Op.contains]: [user.id] 
          }
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
router.post("/getSongs", async (req, res) => {
  user = await User.findByPk(req.session.userId);

  console.log(req.body);
  const { filterby, radiosource, reversefilterbtn } =JSON.parse( req.body);
  let orderBy;
  if (filterby == 'date') {
    orderBy =[ ['discoveryDate', reversefilterbtn == '-1' ? 'DESC' : 'ASC']];
  } else if (filterby == 'name') {
    orderBy = [['name', reversefilterbtn == '-1' ? 'DESC' : 'ASC']]
  } else {
    // Default to likes, handled later in code due to complex sorting
    orderBy = [['likes', reversefilterbtn == '-1' ? 'DESC' : 'ASC']]
  }
  console.log(orderBy)
  let whereClause = {};
  if (radiosource === 'curr') {
    // Assuming user is defined and contains the necessary property
    if(user && user.tunedStationID){

    
    whereClause = { RadioStationDiscoveredOn: user.tunedStationID };
    }
  }

  try {
    let result = await Song.findAll({ 
      where: whereClause,
      order: orderBy
    });

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
router.get("/", (r, res) => {
  res.redirect("/home");
});
router.post("/logout", (req, res) => {
  req.session.destroy();

  res.redirect(303, "/register");
});
router.get("/login", (req, res) => {
  res.render("loginView", { newUser: 0 });
});
router.get("/register", (req, res) => {
  res.render("loginView", { newUser: 1 });
});
router.get("/player", async (req, res) => {
  let user = await User.findByPk(req.session.userId);
  if (user && user.tunedStationID) {
    let radioHostname = (await RadioStation.findByPk(user.tunedStationID))
      .hostSource;
    res.render("player", { host: radioHostname });
  } else {
    res.render("player", { host: 0 });
  }
});
router.get("/chat", async (req, res) => {
  res.sendFile(__dirname + "/views/chatbox.html");
});
router.get("/home", async (req, res) => {
  let user = await User.findByPk(req.session.userId);
  if (!user || !user.username) {
    console.log(req.session.userId);
    user = { username: "Guest" };
  }
  res.render("home", { username: user.username });
});
router.get("/stationsPage", (req, res) => {
  res.sendFile(__dirname + "/views/Stations.html");
});

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
  const { content } = req.body;
  usr = await User.findByPk(req.session.userId);
  if (usr && usr.tunedStationID) {
    radioStationID = usr.tunedStationID;

    const newMessage = await Message.create({
      senderID: req.session.userId,
      messageContent: content,
      timestamp: new Date(),
      radioStationID: radioStationID,
      senderUsername: usr.username,
    });

    return res.json({
      message: "Message sent successfully",
      message: newMessage,
    });
  }
});

router.get("/chatMessages", async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/discoverSong", async (req, res) => {
  try {
    usr = await User.findByPk(req.session.userId);
    if (usr && usr.tunedStationID) {
      radio = await RadioStation.findByPk(usr.tunedStationID);

      if (radio) {
        potentialId= DataTypes.UUIDV4
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
          setTimeout(async ()=>{


          
    
            commandtwo=`ffmpeg -i ./songs/${rnd}/audio.{flac,mp3} -threads 4`


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


            setTimeout(async ()=>{
              var data = {
                'api_token': process.env.APISHAZAM,
                'file': fs.createReadStream(__dirname+`/songs/${rnd}/audio.mp3`),
                'return': 'apple_music,spotify',
            };
            
            axios({
                method: 'post',
                url: 'https://api.audd.io/',
                data: data,
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then(async(response) => {
              
                console.log(response.data);
                if(response.data.result){
                res.send(response.data.result)
                const newSong = await Song.create({
                  sampleId:rnd,
                  name:response.data.result.title,
                  artist:response.data.result.artist,
                  discoveredLiveCount: 0,
                  frequencyDiscoveredOn: usr.tunedFrequency,
                  RadioStationDiscoveredOn: usr.tunedStationID
                });
              }else{
                res.send(404)
              }
            })
            .catch((error) =>  {
                console.log(error);
            });
          
          // Listen for the 'exit' event of the child process
          
         
        },1000)
        },12000);
      })
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500, e);
  }
});

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
