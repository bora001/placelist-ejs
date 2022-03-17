module.exports.authCheck = (req, res, next) => {
  console.log(req.originalUrl, "return to");
  console.log(req.url, "url.req.");
  if (!req.user) {
    console.log("login first!");
    req.flash("pass", "Please Login first");
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
    return;
  } else {
    next();
  }
};
