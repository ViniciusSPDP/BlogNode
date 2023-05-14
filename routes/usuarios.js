const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

//Importando bcrypt para criptografia impossivel de descriptrogafar
const bcrypt = require("bcryptjs")

//Carregando passport
const passport = require('passport')


router.get("/registro", (req,res) =>{
    res.render("usuarios/registro")
})

router.post("/registro", (req,res) =>{
    let erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Invalido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Emal Invalido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha Invalida"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: "Seha muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas não são iguais, tente novamente"})
    }

    if(erros.length > 0){
        
        res.render('usuarios/registro', {erros: erros})


    }else{

        //Verificando se o Usuario que esta tentando cadastrar o email já esta registrado no banco de dados
        Usuario.findOne({email: req.body.email}).then((usuario) =>{
            if(usuario){
                req.flash("error_msg", "Já existe uma conta, com esse email em nosso sistema, registre outro email valido")
                res.redirect("/usuarios/registro")
            }else{

                const novoUsuario = new Usuario({

                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha

                })

                //Salt deixa mais dificil de descobrir a senha
                bcrypt.genSalt(10, (erro, salt) =>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) =>{
                       if(erro){
                        req.flash("error_msg", "Houve um erro no salvamento do usuario")
                        res.redirect('/')
                       } 

                       novoUsuario.senha = hash

                       novoUsuario.save().then(()=>{
                        req.flash('success_msg', "Usuario criado com Sucesso !")
                        res.redirect('/')

                       }).catch((erro) =>{
                        req.flash('error_msg', 'Houve um erro ao criar o úsuario, tente novamente')
                        res.redirect('/usuarios/registro')
                       })

                    })
                })


            }
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno ao cadastrar")
            req.redirect('/')
        })

    }


})

router.get('/login', (req,res) =>{
    res.render('usuarios/login')
})

//Tudo que for de Autentificacao vai ter 3 parametro
router.post('/login', (req,res,next) =>{

    passport.authenticate("local",{
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req,res,next)

})

router.get('/logout', (req,res) =>{

    req.logout((err) =>{
        if(err){
            console.log(err)
            return next(err)
        }
    })
    req.flash('success_msg', "Deslogado com sucesso")
    res.redirect("/")
})


module.exports = router