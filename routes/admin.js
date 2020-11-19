const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {admin} = require('../helpers/admin')

router.get('/', admin, (req, res) => {res.render('admin/index')})

router.get('/posts', admin, (req, res) => {res.render('admin/posts')})

router.get('/categorias', admin, (req,res) => {
        Categoria.find().sort({date:'desc'}).then((categorias)=>{
            res.render('./admin/categorias', {categorias: categorias.map(categoria => {
                return categoria.toJSON()
            })
        })   
    }).catch((e)=>{req.flash('error_msg', 'Houve um erro ao listar as categorias'), res.redirect('/admin')})   

})

router.get('/categorias/add', admin, (req,res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', admin, (req,res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'})
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }

    if (req.body.slug < 3){
        erros.push({texto: 'Slug muito pequeno'})
    }

    if (erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }
    new Categoria(novaCategoria).save().then(()=>{req.flash('success_msg', 'Categoria criada com sucesso!'), res.redirect('/admin/categorias')}).catch((e)=>{console.log(`Ocorreu o erro ${e}`)})
    }
    
})
router.get('/categorias/edit:id', admin, (req, res)=>{
    Categoria.findOne({_id: req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategorias', {categoria: categoria}) 
  
    }).catch((e)=>{
        req.flash('error_msg', 'Categoria inexistente')
        res.render('admin/categorias')
    })
    
})
router.post('/categorias/edit', admin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => 
    {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

       
        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada')
            res.redirect('/admin/categorias')
        }).catch((e)=>{
            req.flash('error_msg', 'Erro ao editar a categoria')
            res.redirect('/admin/categorias')
        })
    }).catch((e)=>{
        req.flash('error_msg', 'Houve um erro ao editar a categoria')
    })
})
router.post('/categorias/deletar', admin, (req, res) => {
    Categoria.remove({_id: req.body.id}).lean().then(() =>{
        req.flash('success_msg', 'Categoria deletada')
        res.redirect('/admin/categorias')
    }).catch((e)=>{
        req.flash('error_msg', 'Erro ao deletar categoria')
        res.redirect('/admin/categorias')
    })
})
router.get('/postagens', (req, res) => {
    Postagem.find().lean().populate('categoria').sort({data:'desc'}).then((postagens) => {
     res.render('admin/postagens', {postagens: postagens})   
    }).catch((e) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
    

})
router.get('/postagens/add', admin, (req, res) => {
    Categoria.find().lean().then((categorias) =>{
        res.render('admin/addpostagem',{categorias: categorias})
    }).catch((e) =>{
        req.flash('error_msg', 'Erro ao carregar o formulario')
    })   
})
router.post('/postagens/nova', admin, (req, res) => {

    var erros = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: 'Titulo inválido'})
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: 'Descrição inválida'})
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: 'Conteúdo inválido'})
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }
    
    if (req.body.slug < 3){
        erros.push({texto: 'Slug com caracteres insuficientes'})
    } 
    
    if (req.body.titulo < 3){
        erros.push({texto: 'Titulo com caracteres insuficientes'})
    }

    if (req.body.descricao < 3){
        erros.push({texto: 'Descrição com caracteres insuficientes'})
    }
    
    if (req.body.conteudo < 3){
        erros.push({texto: 'Conteúdo com caracteres insuficientes'})
    }    

    if(req.body.categoria == "0"){
        erros.push({texto: 'Categoria inválida'})
    }
    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
            const novaPostagem = {
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
                slug: req.body.slug
            }
         
            new Postagem(novaPostagem).save().then(() => {
                req.flash('success_msg', 'Postagem criada com sucesso')
                res.redirect('/admin/postagens')
            }).catch((e) => {
                req.flash('error_msg', 'Houve um erro')
                res.redirect('/admin/postagens')
            })
    }

})
router.get('/postagens/edit:id', admin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((e) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias.')
            res.redirect('/admin/postagens')
        })

    }).catch((e) =>{
        req.flash('error_msg', 'Ocorreu um erro ao editar a postagem')
        res.redirect('/admin/postagens')
    })
})
router.post('/postagem/edit', admin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem atualizada com sucesso.')
            res.redirect('/admin/postagens')
        }).catch((e) => {
            req.flash('error_msg', 'Erro ao atualizar a postagem')
            res.redirect('/admin/postagens')
        })

    }).catch((e) => {
        req.flash('error_msg', 'Houve um erro ao editar a postagem.')
        res.redirect('/admin/postagens')
    })
})

router.get('/postagens/deletar:id', admin, (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso')
        res.redirect('/admin/postagens')
    }).catch((e) => {
        req.flash('error_msg', 'Erro ao deletar a postagem')
        res.redirect('/admin/postagens')
    })
})

module.exports = router