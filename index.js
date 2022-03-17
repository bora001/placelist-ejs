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

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { authCheck } = require("./middleware");
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

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
passport.use(
  new LocalStrategy(async (username, password, done) => {
    User.findOne({ username: username }, async (err, user) => {
      const validPw = await bcrypt.compare(password, user.password);
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { txt: "Incorrect name!" });
      }
      if (!validPw) {
        return done(null, false, { txt: "Passwords do not match" });
      }
      return done(null, user);
    });
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.header("Access-Control-Allow-Origin", process.env.localUrl + ":5500");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

//---------------------------------------------------------------------------------------//

app.get("/logout", (req, res) => {
  req.logout();
  req.session.save(() => {
    console.log("logout/returnTo", req.session.returnTo);
    res.redirect("/");
  });
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, passwordConfirm } = req.body;
    if (password == passwordConfirm) {
      const userCheck = await User.findOne({ username });
      if (userCheck) {
        req.flash("txt", "The name is already exist");
        return res.redirect("/register");
      } else {
        const user = new User({ username, password });
        await user.save();
        req.flash("txt", `Welcome! ${username}, Please Login again!`);
        return res.redirect("/login");
      }
    } else {
      req.flash("txt", "Passwords do not match");
      return res.redirect("/register");
    }
  } catch (e) {
    console.log(e);
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.session.save(function () {
      console.log("returnTo:login-", req.session.returnTo);
      res.redirect("/");
    });
  }
);

app.post("/create", authCheck, upload.single("img"), (req, res) => {
  let data = {
    name: encode(req.body.name),
    rate: req.body.rate,
    address: encode(req.body.location),
    img: req.file.path,
    imgName: req.file.filename,
    writer: "",
  };
  User.findById(req.user, (err, user) => {
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
      req.flash("txt", "Thank you, We got the new place!");
      return res.redirect("/list");
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
  return res.render("index", {
    message: req.flash("txt"),
  });
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
    return res.render(`${link[1]}`, {
      message: req.flash("txt"),
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, (req, res) => {
  console.log("server is connected...");
});
