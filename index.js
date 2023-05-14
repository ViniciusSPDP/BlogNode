//Trazendo as dependencias ao projeto
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express();
const admin = require("./routes/admin")
const path = require('path');
const session = require('express-session')
const flash = require('connect-flash')


//Autentificador
const passport = require('passport')
require("./config/auth")(passport)


//Importando rota usuario
const usuarios = require('./routes/usuarios');
const { error } = require('console');

//Chamando as model
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categoria")

//Configurações

//Sessão
app.use(session({
    secret: "testesessao",
    resave: true,
    saveUninitialized: true
}))

//Colocando o passport na sessao
app.use(passport.initialize())
app.use(passport.session())





app.use(flash())

//Middlewares
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next()
})

//Body Parse config
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Handlebars config
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

//Mongoose config 
mongoose.connect('mongodb://127.0.0.1/bd_blog').then(() => {
    console.log("Conectado ao mongo com Sucesso !")
}).catch((erro) => {
    console.log("Erro ao se conectar " + erro)
})




//Public
app.use(express.static(path.join(__dirname, "public")))


//Rotas Importando rotas de outros arquivos
app.get('/', (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) =>{
        res.render("index", {postagens: postagens})
    }).catch((error) =>{
        req.flash("error_msg", "Houve um erro interno ao listar as postagens")
        res.redirect('/404')
    })
    
})

app.get('/postagem/:slug', (req, res) =>{
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) =>{
        if(postagem){
            res.render("postagem/index", {postagem:postagem})
        }else{
            req.flash('error_msg', "Este post não existe")
            res.redirect("/")
        }
    }).catch((erro) =>{
        req.flash('error_msg', "Houve um erro interno listar a postagem")
        res.redirect("/")
    })
})


app.get("/categorias", (req,res) =>{
    Categoria.find().lean().then((categorias) =>{
        res.render("categorias/index", {categorias: categorias})
    }).catch((erro) =>{
        req.flash("error_msg", "Houve um erro interno para a listagem das categorias")
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req,res) =>{
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) =>{
        if(categoria){

            Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{

            res.render('categorias/postagem', {postagens: postagens, categoria: categoria})

            }).catch((erro) =>{
                req.flash('error_msg', 'Houve um erro ao listar as postagens')
                res.redirect('/')
            })


        }else{
            req.flash('error_msg', 'Esta categoria não existe')
            res.redirect('/')
        }

    }).catch((erro) =>{
        req.flash('error_msg', 'Houve um erro interno ao carregar a pagina desta categoria')
        res.redirect('/')
    })
})

app.get("/404", (req,res) =>{
    res.send("Erro 404")
})


//Rotas importadas
app.use("/usuarios", usuarios)
app.use("/admin", admin)



//Outros
const Port = 9021
app.listen(Port, function () {
    console.log("Servidor Rodando ! https://localhost:9021")
})