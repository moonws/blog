var express = require('express');
//router就是路由模块。
var router = express.Router();
var markdown = require('markdown').markdown;
/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: '我的博客' });
//});
router.get('/', function(req, res, next) {
    res.redirect('/articles/list/1/2');
    Model('Article').find({}).populate('user').exec(function(err,articles){
        articles.forEach(function (article) {
            article.content = markdown.toHTML(article.content);
        });
        res.render('index', {title: '主页',articles:articles});
    });
});

//router.get('/', function(req, res, next) {
//    //当点完searchBtn按钮时就清空关键字
//    req.session.keyword=null;
//    res.redirect('/articles/list/1/2');
//});
module.exports = router;
