module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.adm == 1){
            return next()
        }

        req.flash("error_msg", "Você deve estar logado como administrador para entrar aqui")
        res.redirect("/")
    }
}