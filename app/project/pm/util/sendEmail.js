/**
 * Created by zlc on 2016/3/15.
 * 功能：发送邮件
 */

var nodemailer = require('nodemailer');
var utils = require('gmdp').init_gmdp.core_app_utils;


/**
 * 发送邮件
 * @param to   收件人信息 名字（可以不传）和地址 eg:[{ name:'王二小',address:'zhouliangchang@126.com'},{name:'王小二', address:'509721765@qq.com'}];
 * @param cc   抄送人信息 名字（可以不传）和地址 eg:[{ name:'王二小',address:'zhouliangchang@126.com'},{name:'王小二', address:'509721765@qq.com'}];
 * @param subject  邮件主题
 * @param text   文本内容
 * @param html   html内容
 * @param attachments  附件列表 eg: [{filename:'text3.txt',path:'/path/to/file.txt'},{path:'/path/to/file.txt'}]
 */
exports.sendMail = function (to, cc, subject, text, html, attachments){

    //发件人信息,有些邮箱需要邮箱的全名，有些只需要@之前的内容比如 126邮箱 xxx@126.com，只需要xxx
    var user = 'wgzx_system@139.com';
    //发件人 邮箱密码
    var pass = 'wgzx2016qwer';
    //发件人邮箱  一般提供一个系统邮箱，因为需要密码
    var from = 'wgzx_system@139.com';

    // create reusable transporter object using the default SMTP transport
    var smtpTransport = nodemailer.createTransport({
        host: 'smtp.139.com',          // 主机名
        secure:true,                // 是否开启ssl
        port: 465,                  // 端口号,不同的邮件系统的端口号不同,465是一般的ssl端口
        //port: 18314,                    // 服务器映射端口号
        auth: {
            user: user,          // 用户名和密码，大部分邮件系统用户名不用填写@xxxx.com的后缀
            pass: pass
        }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: from,  // 发件人邮箱
        to: to, // 收件人列表
        cc:cc, // 抄送列表
        subject:subject, // 邮件主题
        text: text, // plaintext body
        html: html, // html body
        attachments:attachments
    };

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, info){
        if(error){
            //return console.log(error);
            console.log("发送失败：==" + error);
            //utils.respMsg(res, false, '1000', '发送邮件失败。', null, error);

        }else {

            //console.log('Message sent: ' + info.response);
            console.log("发送成功：==" + info.response);
            //utils.respMsg4Paging(res, true, '0000', '发送成功。', info, info.length);
        }
    });
};