module.exports.authCheck = (req, res, next) => {
  if (!req.user) {
    req.flash("pass", "Please Login first");
    res.redirect("/login");
    return;
  } else {
    next();
  }
};
