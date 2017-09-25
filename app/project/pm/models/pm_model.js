/**
 * Created by DengQian on 2017/8/17.
 */
/**
 * 相关模块组件加载
 */
var mongoUtils  = require('gmdp').init_gmdp.core_mongoose_utils;
var mongoose = mongoUtils.init();
var Schema    = mongoose.Schema;
/*
该图表用于任务数据结构
 */
var pmSchema = new Schema(
    {
        pm_no:String,                           //任务编号
        pm_name:String,                         //任务名称
        pm_content:String,                      //任务内容
        pm_responsibilityRoom:String,           //任务负责室
        pm_responsibilityPerson:String,         //任务负责人
        pm_begin_date:String,                   //任务开始时间
        pm_end_date:String,                     //任务结束时间
        pm_remind_date:String,                  //任务提醒时间
        pm_type:String,                         //任务类型 （0项目管理为管理类项目、1日程安排、2工作计划为通知类项目）
        pm_status:String,                       //任务状态(0待完成、1未完成、2已完成)
        pm_speed_of_progress:Number,            //任务进度
        pm_urgent_degree:String,                //任务紧急程度(0一般、1紧急、2非常紧急)
        pm_sendPerson:String,                   //任务发送者人
        pm_sendPersonID:Schema.Types.ObjectId,  //任务的发送者ID
        pm_receivePerson:[{id:Schema.Types.ObjectId,name:String}],              //任务接受者
        pmd_enclosure:String,                   //任务附件文件名
        pm_remark:String,                       //任务备注信息
        pm_record:[{message:String,senderName:String,senderId:Schema.Types.ObjectId}]  //任务记录
    },
    {collection: "pm_info"}                     //mongodb数据库中任务对应的集合名
);
/**
 * 用户model，用于当前系统下用户的获取。
 * @type {*|Schema}
 */
var userSchema=new Schema({
    _id:Schema.Types.ObjectId,                   //用户ID
    user_status:Number,                          //用户状态(1、启用 2、禁用)
    user_name:String,                            //用户名称
    user_sys:Schema.Types.ObjectId,              //用户系统ID
    user_org:Schema.Types.ObjectId,              //用户所在部门的组织机构ID
    login_password:String,                       //用户登录密码
    user_photo:String                            //用户照片
},{
        collection:"common_user_info"            //用户对应的集合名
});

/**
 * 组织机构部门对应model
 * @type {*|Schema}
 */
var user_orgSchema=new Schema({
    _id:Schema.Types.ObjectId,                   //组织机构主键
    org_name:String,                             //组织机构名称
    org_fullname:String                          //组织机构全名

},{
        collection:"common_org_info"             //组织机构对应集合名称
});

/**
 * 用户任务状态信息表。分别存储用户id和任务id和对应任务状态
 * @type {*|Schema}
 */
var user_pm_status=new Schema({
        pm_id:{type:Schema.Types.ObjectId, ref: 'pmModel'},//项目id对应pm_info中的_id
        user_id:{type:Schema.Types.ObjectId},//用户id
        status:String//针对不同用户的状态
    },

    
    {collection:"user_pm_status"});
//导出任务模型为 $ 用于对于任务的增删改查操作
exports.$ = mongoose.model('pmModel', pmSchema);
//导出组织机构模型为 $orgModel用于对组织机构用于增删改查
exports.$orgModel=mongoose.model('orgModel', user_orgSchema);
//导出组织机构模型为 $userModel用于对组织机构用于增删改查
exports.$userModel=mongoose.model('userModel',userSchema);
//导出通知类任务对应用户状态
exports.$user_pm_statusModel=mongoose.model('user_pm_statusModel',user_pm_status);
