const express = require("express")
//Arquivo para criar rotas em arquivo separados
const router = express.Router()
//Chamaando o BD
const mongoose = require("mongoose")
//Carregando as models
require("../models/Categoria")
const Categoria = mongoose.model("categoria")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")


router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, function (req, res) {
    res.send("Pagina de posts")
})

router.get('/categorias', eAdmin, (req, res) => {
    //Lista todas as categorias
    Categoria.find().sort({ date: "desc" }).lean().then((categorias) => {
        res.render("admin/categorias", { categorias: categorias })
    }).catch((erro => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("admin")
    }))


})

router.get('/categorias/add',eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})

router.post('/categorias/nova',eAdmin, (req, res) => {

    let erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome muito pequeno" })
    }

    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")

            // função para listar todas as categorias
            const listarCategorias = () => {
                Categoria.find().sort({ date: "desc" }).lean()
                    .then((categorias) => {
                        res.render("admin/categorias", { categorias: categorias })
                    }).catch((erro => {
                        req.flash("error_msg", "Houve um erro ao listar as categorias")
                        res.redirect("admin")
                    }))
            }

            listarCategorias()


        }).catch((erro) => {
            req.flash("error_msg", "Erro ao criar categoria" + erro)
            res.render("admin")
        })
    }




})

router.get('/categorias/edit/:id', eAdmin, function (req, res) {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render("admin/editcategorias", { categoria: categoria })
    }).catch((erro) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })


})

router.post('/categorias/edit',eAdmin, function (req, res) {

    Categoria.findOne({ _id: req.body.id }).then((categoria) => {


        let erros = []


        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({ texto: "Nome invalido" })
        }
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({ texto: "Slug invalido" })
        }
        if (req.body.nome.length < 2) {
            erros.push({ texto: "Nome muito pequeno" })
        }

        if (erros.length > 0) {
            Categoria.findOne({ _id: req.body.id }).lean().then((categoria) => {
                res.render("admin/editcategorias", { categoria: categoria, erros: erros })
            }).catch((erro) => {
                req.flash("error_msg", "Erro ao pegar os dados")
                res.redirect("admin/categorias")
            })



        } else {

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso !")
                res.redirect('/admin/categorias')
            }).catch((erro) => {
                req.flash("error_msg", "Houve erros internos ao editar a categoria")
                res.redirect('/admin/categorias')

            })
        }
    }).catch((erro) => {
        req.flash("error_msg", "Houve erros ao editar a categoria")
        res.redirect('/admin/categorias')
    })

})

router.get('/categorias/deletar/:id', eAdmin, (req, res) => {
    Categoria.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((erro) => {
        req.flash("error_msg", "Erro em deletar a categoria")
        res.redirect("/admin/categorias")
    })
})


router.get("/postagens", eAdmin, (req, res) => {
    //Passar nome do campo que esta em model no populate
    Postagem.find().lean().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens })
    }).catch((erro) => {
        req.flash("error_msg", 'Houve um erro ao listar postagens')
        res.redirect('/admin')
    })
})

router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagens', { categorias: categorias })
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao carregar formulario")
        res.redirect("admin")
    })

})

router.post('/postagens/nova', eAdmin, ((req, res) => {

    let erros = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: "Titulo invalido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({ texto: "Descrição invalida" })
    }
    if (req.body.conteudo.length < 2) {
        erros.push({ texto: "Conteudo muito pequeno" })
    }

    if (req.body.categoria == "0") {
        erros.push({
            texto: "Categoria inválida, registre uma categoria"
        })
    }

    if (erros.length > 0) {
        res.render("admin/addpostagens", { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem Criada com Sucesso")
            res.redirect("/admin/postagens")
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    }



}))

router.get('/postagens/edit/:id', eAdmin, (req, res) => {

    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", { categorias: categorias, postagem: postagem })
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao carregar o form de edicao")
        res.redirect('/admin/postagens')
    })

})

router.post('/postagens/edit', eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {


        let erros = []

        if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
            erros.push({ texto: "Titulo invalido" })
        }
    
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({ texto: "Slug invalido" })
        }
    
        if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
            erros.push({ texto: "Descrição invalida" })
        }
        if (req.body.conteudo.length < 2) {
            erros.push({ texto: "Conteudo muito pequeno" })
        }
    
        if (req.body.categoria == "0") {
            erros.push({
                texto: "Categoria inválida, registre uma categoria"
            })
        }
    
        if (erros.length > 0) {
            Postagem.findOne({_id: req.body.id}).lean().then((postagem) =>{
                Categoria.find().lean().then((categorias) => {
                    res.render("admin/addpostagens", { categorias: categorias, postagem: postagem, erros: erros})
                }).catch((erro) => {
                    req.flash("error_msg", "Houve um erro ao carregar as categorias em postagens")
                    res.redirect("/admin/postagens")
                })
            }).catch((erro =>{
                req.flash("error_msg", "Houve um erro ao carregar as postagens")
                res.redirect("/admin/postagens")
            }))

            
        } else {

            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso !")
                res.redirect('/admin/postagens')
            }).catch((erro) => {
                req.flash("error_msg", "Houve erros internos ao editar a postagens")
                res.redirect('/admin/postagens')

            })
        }
    }).catch((erro) => {
        req.flash("error_msg", "Houve erros ao editar a Postagm")
        res.redirect('/admin/postagens')
    })


})

router.post('/postagens/delete', eAdmin, (req,res) =>{
    Postagem.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((erro) => {
        req.flash("error_msg", "Erro em deletar a postagem")
        res.redirect("/admin/postagens")
    })
})
module.exports = router