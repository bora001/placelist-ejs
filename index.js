// server
require("dotenv").config();
const express = require("express");
const path = require("path");
const placeRouter = require("./routes/place");
const app = express();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { User } = require("./models/User");
const { Place } = require("./models/Place");
const cookieParser = require("cookie-parser");
const mbxGeo = require("@mapbox/mapbox-sdk/services/geocoding");
const mbxToken = process.env.mapToken;
const geocoder = mbxGeo({ accessToken: mbxToken });
const { encode } = require("html-entities");
const mongoStore = require("connect-mongo");

// multer
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const req = require("express/lib/request");
const session = require("express-session");

//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "placelist-img",
    allowedFormats: ["jpeg", "jpg", "png"],
  },
});
const upload = multer({ storage });

//---------------------------------------------------------------------------------------//
//mongodb
mongoose
  .connect(process.env.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoDB is connected..."))
  .catch((err) => console.log(err));

//---------------------------------------------------------------------------------------//

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/client"));
app.use(cookieParser());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.localUrl + ":5500");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  session({
    secret: "typethesecret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
    store: new mongoStore({
      mongoUrl: process.env.mongoUrl,
      touchAfter: 24 * 60 * 60,
    }),
  })
);

//---------------------------------------------------------------------------------------//

app.post("/auth", (req, res) => {
  if (!req.session.user_id) {
    return res.json({ login: false });
  }
  return res.json({ login: true });
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  return res.json({ login: false });
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, passwordConfirm } = req.body;
    if (password == passwordConfirm) {
      const userCheck = await User.findOne({ username });
      if (userCheck) {
        return res.send(
          "<script>alert('The name is already exist');location.href='/register';</script>"
        );
      } else {
        const user = new User({ username, password: hash });
        await user.save();
        return res.redirect("/");
      }
    } else {
      return res.send(
        "<script>alert('Passwords do not match');location.href='/register';</script>"
      );
    }
  } catch (e) {
    console.log(e);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      const validPw = await bcrypt.compare(password, user.password);
      if (validPw) {
        req.session.user_id = user._id;
        return res.redirect("/");
      } else {
        return res.send(
          "<script>alert('Incorrect password');location.href='/login';</script>"
        );
      }
    }
    return res.send(
      "<script>alert('Check your username');location.href='/login';</script>"
    );
  } catch (e) {
    console.log(e, "login");
  }
});

app.post("/create", upload.single("img"), (req, res) => {
  let data = {
    name: encode(req.body.name),
    rate: req.body.rate,
    address: encode(req.body.location),
    img: req.file.path,
    imgName: req.file.filename,
    writer: "",
  };
  if (!req.session.user_id) {
    return res.status(200).json({
      success: false,
    });
  }

  User.findById(req.session.user_id, (err, user) => {
    data.writer = user._id;
  });

  const geoData = geocoder
    .forwardGeocode({
      query: req.body.location,
      limit: 1,
    })
    .send()
    .then((geo) => {
      data.geometry = geo.body.features[0].geometry;
      const newPlace = new Place(data);
      newPlace.save();
      return res.status(200).json({
        success: true,
      });
    });
});

//multer
app.post("/", (req, res) => {
  let mapToken = process.env.mapToken;
  Place.find((err, data) => {
    return res.json({
      success: true,
      data,
      mapToken,
    });
  });
});

//router
app.use("/place", placeRouter);
app.set("views", path.join(__dirname, "/client/pages"));
app.get("/", (req, res) => {
  return res.render("index");
});

app.get("/place/:id", (req, res) => {
  return res.render("place.ejs");
});
app.get("/list", (req, res) => {
  Place.find((err, data) => {
    if (err) console.log(err);
    return res.render("list.ejs", { data });
  });
});

app.get("*", (req, res) => {
  const link = req.path.split("/");
  if (link.length < 3 && link[1] !== "favicon.ico") {
    return res.render(`${link[1]}`);
  }
});

const port = process.env.PORT || 3000;

app.listen(port, (req, res) => {
  console.log("server is connected...");
});
