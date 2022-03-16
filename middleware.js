module.exports.authCheck = (req, res, next) => {
  console.log("authcheck!", req.user);
  if (!req.user) {
    console.log("login first!");
    req.flash("txt", "Please login");
    // return res.redirect("/login");
    // return ;
    return false;
  }
  //   return true;
  next();
};
