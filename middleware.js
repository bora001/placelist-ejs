module.exports.authCheck = (req, res, next) => {
  // console.log(req.originalUrl, "return to");
  // console.log(req.headers.referer, "return to");
  if (!req.user) {
    console.log("login first!");
    req.flash("pass", "Please Login first");
    res.redirect("/login");
    return;
  } else {
    next();
  }
};
