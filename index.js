const express = require("express");
const router = express.Router();
let RadioStation  = require("./models/Radiostation");
let User = require("./models/User");
let vStation = require("./models/vStation");
let Message = require("./models/Message");
const sequelize = require("./db/db");
sequelize.authenticate().then(async function(errors) {
User = sequelize.models.User;
vStation = sequelize.models.vStation;
RadioStation = sequelize.models.RadioStation;


sequelize.sync({force:false});
    
// await vStation.create({
//     StationName: 'Radio Station A',
//     StationDescription: 'Broadcasting top hits 24/7.',
//     currentListeners: 150,
//     isBusy: 1,
//     Songs: { "song1": "Title A", "song2": "Title B" },
//     topSongs: ["Song A", "Song B", "Song C"]
//   });
//   await vStation.create({
//     StationName: 'Chill Beats FM',
//     StationDescription: 'Relax and enjoy the smooth beats.',
//     currentListeners: 120,
//     isBusy: 1,
//     Songs: { "song1": "Title E", "song2": "Title F" },
//     topSongs: ["Song G", "Song H", "Song I"]
//   });
  
//   await vStation.create({
//     StationName: 'Rock n Roll Radio',
//     StationDescription: 'Bringing the best of rock music.',
//     currentListeners: 80,
//     isBusy: 0,
//     Songs: { "song1": "Title C", "song2": "Title D" },
//     topSongs: ["Song D", "Song E", "Song F"]
//   });
//     console.log(errors) });
})
const bcrypt = require("bcrypt");
const proxy = require("express-http-proxy");
const app = express();
const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(router);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }),
);
const server = app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
  });
  
router.get("/", (req, res) => {
  console.log("ok");
  res.sendFile(__dirname + "/ok.html");
});

app.use("/api", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized. Please sign in." });
    }

    const user = await User.findByPk(req.session.userId);

    if (!user || !user.tunedStationID) {
      return res
        .status(404)
        .json({ error: "User is not tuned to any radio station." });
    }

    const tunedRadioStation = await RadioStation.findByPk(user.tunedStationID);

    if (!tunedRadioStation || !tunedRadioStation.hostSource) {
      return res
        .status(404)
        .json({
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

  
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingUser = await User.findOne({ where: { email } }) || await User.findOne({ where: { username } });

    if (existingUser) {
      return res.status(400).json({ error: "Email or username is already in use." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    req.session={userId:0}
    req.session.userId = newUser.id;
    console.log(req.session.userId)
    return res.json({ message: "Signup successful", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Both email and password are required." });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    console.log(password,existingUser.hashedPassword)

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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getRadioStations",async (req,res)=>{
    realRadios=await RadioStation.findAll({where:{


    }})
    vRadios=await vStation.findAll({where:{
        
    }})
    res.send(realRadios.concat(vRadios))
})
router.use(async (req, res, next) => {
    console.log(req.session, req.path,req.body)
    if(!req.session){
        req.session={userId:0}
        res.send("No session found so far, so one has been created")
    }
    if (req.session.userId) {
      usr = await User.findByPk(req.session.userId);
      if (!usr) {
        res.redirect("/login");
      } else {
        next();
      }
    }
  });
router.get("/tuneIn", async (req, res) => {
  try {
    const { stationId, virtual } = req.query;

    if (!stationId || virtual === undefined) {
      return res
        .status(400)
        .json({ error: "Both stationId and virtual are required." });
    }

    let station;
    us = await User.findByPk(req.session.userId)

    if (virtual) {
      station = await vStation.findByPk(stationId);
        us.isTunedToVirtual=true

    } else {
      us.isTunedToVirtual=false
      station = await RadioStation.findByPk(stationId);
    }

    if (!station) {
      return res.status(404).json({ error: "Station not found." });
    }
    us.tunedStationID=station.id
    // Update the User's tunedStationID here

    return res.json({ message: "Tuned in successfully", station });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/changeTunedFreq", async (req, res) => {

  try {
    
    curUs=User.findByPk(req.session.userId)
    const { id, newFrequency } = req.query;
    if(!curUs.isTunedToVirtual){

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
  }} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }

});

router.post("/chatMessage", async (req, res) => {
  const { content } = req.body;
  usr = await User.findByPk(req.session.userId);
  RadioStationID = usr.tunedStationID;
  const newMessage = await Message.create({
    senderID: req.session.userId,
    messageContent: content,
    timestamp: new Date(),
    radioStationID,
  });
  return res.json({
    message: "Message sent successfully",
    message: newMessage,
  });
});

router.get("/chatMessages", async (req, res) => {
  try {
    let m = sequelize.models.User;
    const user = await m.findByPk(req.session.userId);

    if (!user || !user.tunedStationID) {
      return res
        .status(404)
        .json({ error: "User is not tuned to any radio station." });
    }

    const radioStationID = user.tunedStationID;

    const chatMessages = await Message.findAll({
      where: {
        radioStationID: Message.radioStationID,
      },
      order: [["timestamp", "DESC"]],
      limit: 100,
    });

    return res.json({ chatMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

  
 

router.post('/createVirtualRadio', async (req, res) => {
    try {
      const { youtubeLink, stationName, stationDescription } = req.body;
        if(!stationDescription){
            stationDescription="Just a radio :p"
        }
      if (!youtubeLink || !stationName) {
        return res.status(400).json({ error: 'YouTube link and station name are required.' });
      }
      
      const newVStation = await vStation.create({
        StationName: stationName,
        StationDescription: stationDescription,
        topSongs: topSongs,
        isBusy: true,
      });
  
      const childProcess = spawn('node', [process.env.YAPHPATH, youtubeLink, '-t', '10', '-f', 'audioonly', '-q', 'highest', '-o', `/home/nike/ebavkiyoutube/yaph/${newVStation.id}`]);
  
      // Listen for the 'exit' event of the child process
      childProcess.on('exit', (code) => {
        // Once the child process has finished, mark the station as not busy
        vStation.update({ isBusy: false }, { where: { id: newVStation.id } });
        console.log(`Child process exited with code ${code}`);
      });
  
      // Handle subprocess stdout, error, etc.
  
      return res.json({ message: 'Virtual radio created successfully', vStation: newVStation });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  


module.exports = router;
