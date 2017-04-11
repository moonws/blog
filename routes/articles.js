/**
 * Created by Administrator on 2017/3/6.
 */
var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');

//var markdown=require("markdown");
//var multer=require('multer');
//var storage = multer.diskStorage({
//    destination: function (req, file, cb) {
//        cb(null, '../public/uploads')
//    },
//    filename: function (req, file, cb) {
//        cb(null, Date.now()+'.'+file.mimetype.slice(file.mimetype.indexOf('/')+1))
//    }
//})
//var upload = multer({ storage:storage});

/* 打开添加文章页面 */
router.get('/add', middleware.checkLogin,function(req, res,next) {
    console.log('打开添加文章页面');
    res.render("articles/addArticle",{title:"添加文章"});

});
//提交新博客的信息
router.post('/add', function(req, res, next) {
    console.log('提交新博客的信息');
    var article=req.body;
    article.user=req.session.user._id;



    new Model('Article')(article).save(function(err,art){
        if(err){
            //发表文章失败。转到发表页面
            return res.redirect("/articles/add");
        }else{
            //发表成功后转到首页
            return res.redirect("/")
        };
//        if(req.file){
//            req.body.img = path.join('/uploads',req.file.filename);
//        };
    })
});

router.get('/detail/:_id', function (req, res) {
    Model('Article').findOne({_id:req.params._id},function(err,article){
//        article.content = markdown.toHTML(article.content);
        res.render('articles/detail',{title:'查看文章',article:article});
    });
});



router.get('/edit/:_id', function (req, res) {
    Model('Article').findOne({_id:req.params._id},function(err,article){
        //路径权限判断，判断当前的登录人和文章发表人是否一致
        //如果不一样转回详情页面，并显示错误信息
        if (req.session.user && (req.session.user._id != article.user)) {
            req.flash('error', '您没有权限进行此操作');
            res.redirect('back');
        }
        res.render('articles/editArticle',{title:'编辑文章',article:article});
    });
});


//提交修改文章的内容
router.post("/edit/:_id",middleware.checkLogin,function (req,res,next) {
    console.log("修改博客的信息");
    var article = req.body;

    Model('Article').update({_id:req.params._id},
        article,
        function (err,art) {
            if(err)
            {
                console.log(err);
                req.flash("error","修改失败");
            }
            console.log(art);
            //发表文章失败,转到发表页面
            console.log("更新成功");
            req.flash("success","修改成功");
            return res.redirect("/articles/detail/"+req.params._id);
        })
});



router.get('/delete/:_id', function (req, res) {
    //路径参数中如果参数是id，那么名字必须是_id
    var articleId=req.params._id;
    Model('Article').remove({_id:articleId},function(err,result){
        if(err){
            req.flash('error',err);
            res.redirect('back');
        }
        req.flash('success', '删除文章成功!');
        res.redirect('/');//注册成功后返回主页
    });
});
//实现分页
//get:  /articles/list/3/2
//post:  /articles/list/1/2
router.all('/list/:pageNum/:pageSize',function(req, res, next) {
    //pageNum表示当前是第几页，默认值是第一页
    var pageNum = req.params.pageNum&&req.params.pageNum>0?parseInt(req.params.pageNum):1;
    //pageSize表示每一页有多少记录，默认2条
    var pageSize =req.params.pageSize&&req.params.pageSize>0?parseInt(req.params.pageSize):2;
    var query = {};
    var searchBtn = req.body.searchBtn;
    //这种情况是只有点了搜素按钮时才能获取到keyword
    var keyword = req.body.keyword;
    if(searchBtn){
        //当点击了searchBtn按钮时，把关键字保存到session中防止丢失
        req.session.keyword = keyword;
    }
    if(req.session.keyword){
        query['title'] = new RegExp(req.session.keyword,"i");
    }

    //首先要知道这个搜索结果一共有多少条记录，方便计算页数
    Model('Article').count(query,function(err,count){
        //查询符合条件的当前这一页的数据
        Model('Article').find(query)
            .sort({createTime:-1})//按时间倒叙排列
            .skip((pageNum-1)*pageSize)
            .limit(pageSize)
            .populate('user')
            .exec(function(err,articles){
                console.log(articles);
                res.render('index',{
                    title:'主页',
                    pageNum:pageNum,
                    pageSize:pageSize,
                    keyword:req.session.keyword,
                    count:count,
                    total:Math.ceil(count/pageSize),
                    articles:articles
                });
        });
    });
});
module.exports = router;
