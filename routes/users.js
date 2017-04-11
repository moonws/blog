var express = require('express');
var router = express.Router();
var middleware = require('../middleware/index');



/* 访问登录页面 */
router.get('/login', function(req, res, next) {
    console.log('get方式打开登录页面');
    res.render("users/login",{title:"登录"});
});


//使用post方式提交登录信息
router.post('/login', function(req, res, next) {
//    console.log('post方式提交登录信息');
    var user = req.body;
    user.password = md5(user.password);
    //查询数据库，找到是否有匹配的记录
    Model('User').findOne(user,function(err,user){
//        if(err){
//            req.flash('error',"登录失败，用户名或密码错误");
//            return res.redirect('/users/login');
//        }
        if(user){
//            用户登录成功。将用户的登录信息保存到session中
            req.flash("success","登录成功")
            req.session.user = user;//用户信息存入 session
            res.redirect('/');//注册成功后返回主页

        }else{
            req.flash('error',"登录失败，用户名或密码错误");
            res.redirect('/users/login');
        }

    });
});

//提交用户信息。打开注册页面
router.get('/reg',middleware.checkNotLogin, function(req, res, next) {
    console.log('get方式打开注册页面');
    res.render("users/reg",{title:"注册"});

});


//使用post方式提交注册信息
router.post('/reg',function(req, res) {
    //获取用户提交的表单数据
    //就是 POST 请求信息解析过后的对象，例如我们要访问 POST 来的表单内的 name="username"
    // 域的值，只需访问 req.body['username'] 或 req.body.username 即可。
    var user=req.body;
    if(user.password != user.pwd){
        //密码和确认密码不一致
        req.flash('error','注册失败，两次输入的密码不一致');
        //重新定向到注册页面
        return res.redirect('/users/reg');
    }
    //删除确认密码属性
    delete user.pwd; //由于pwd不需要保存，所以可以删除
    //把密码用md5加密
    user.password = md5(user.password); //对密码进行md5加密
    //根据邮箱生成头像地址
    user.avatar ="https://s.gravatar.com/avatar/"+md5(user.email)+"?s=80";// 得到用户的头像
    //将user对象保存到数据库中
    new Model('User')(user).save(function(err,user) {
        if (err) {
            req.flash('error', "注册失败");
            res.redirect('/users/reg');
        }
        req.flash('success', "注册成功");
        //在session中保存用户的登录信息
        req.session.user = user;//用户信息存入 session
        res.redirect('/');//注册成功后返回主页

    })
//    console.log('使用post方式提交注册信息');

});



//注销用户登录，只需点击一个超链接，不需要提交表单数据，所以是get方式
router.get('/logout', function(req, res, next) {
//    console.log('退出用户登录');
    req.flash("success","用户登录已注销");
    req.session.user=null;
    res.redirect('/');
});

function md5(val){
    return require('crypto').createHash('md5').update(val).digest('hex');
};

module.exports = router;




