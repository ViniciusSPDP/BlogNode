//Autentificação de usuario, login

const localStrategy = require("passport-local").Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//Model dos Usuario
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

module.exports = function (passport) {

    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, senha, done) => {

        Usuario.findOne({ email: email }).then((usuario) => {
            if (!usuario) {
                return done(null, false, { message: "Esta conta não existe" })
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if (batem) {
                    return done(null, usuario)
                } else {
                    return done(null, false, { message: 'Senha invalida' })
                }
            })



        })
    }))



    //Salvar dados usuarios na sessão

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id).exec()
            .then(usuario => {
                done(null, usuario);
            })
            .catch(error => {
                done(error, null);
            });
    });

}
