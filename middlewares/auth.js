const authenticate = (req, res, next) => {
  const user = req.cookies.user;
  if (!user) {
    return res.redirect("/admin/login");
  }

  req.user = user;

  next();
};

module.exports = authenticate;
