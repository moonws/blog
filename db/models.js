/**
 * Created by Administrator on 2017/3/7.
 */
    //保存的是
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
module.exports = {
    User:{
        //设置User的数据模型
        username:{type:String,required:true},//用户名
        password:{type:String,required:true},//密码
        email:{type:String,required:true},//邮箱
        avatar:{type:String,required:true}//头像
        },
    Article:{
        //设置文章的数据模型
        user:{type:ObjectId,ref:'User'},// 用户,ref表示是一个外键
        title: {type:String,required:true}, //标题
        content: String, //内容
//        img:String, //增加了图片字段
        createAt:{type: Date, default: Date.now} //创建时间
        }
}