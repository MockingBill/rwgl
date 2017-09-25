var utils = require('gmdp').init_gmdp.core_app_utils;
var spawn = require('child_process').spawn;

// 转换编码工具
var iconv_lite = require('iconv-lite');


exports.sendMessage = function(phone,msg){
    // msg = "尊敬的用户，您找回密码的验证码为：";
    msg = iconv_lite.decode(new Buffer(msg), 'gbk');
    // msg = iconv_lite.encode(msg, 'GBK').toString();
    // jar 参数
    var args = [];
    args.push("-jar");                          //固定，不要改动
    args.push("cmcc-uip-client-node2.0.0.jar");    //jar 名称
    args.push("http://218.201.202.242:9013/uip/ws/uipWSServer");   //访问接口地址
    args.push('bap0001');   // 接口编码
    args.push('CTAgKoX6IklKf12OF9AKFw==');   // 秘钥串
    args.push("\"{'phone':'"+ phone +"', 'msg':'"+ msg +"'}\"");   //具体组装参数

    //\"{'phone':'15885095210','msg':'fgfgg'}\"

    //改参数为新增参数
    args.push("MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAKM/QGXXfRdHbpYWCusIgH43YOwl5XkSSmEHTozrldc4O7GQvTZEcG+QGv7J19te/rdKYl8dDHoKmAuB5cVg68Zz4AYYu/t/BBTiI8C8aouUpxZzW7ehDiWehZmhaSDhQZCdlCGAhCRZxy3ci0g8A5vPS4UJ9wZ6pdwWmSLPSM8PAgMBAAECgYBasHDeIvBjVlOhHW3DVF3NwIYfqo3ozLh1XtHMh7QedCb1Zis3Up4D3FKi6Q7517Q5ryEnJcQgqHH/MpKrLETOf7CFwfzC3Z7oQxU7HgYciRdv7VZmOPlVoVuFIQKv5iXkxI5pcN2ZkcyLkTjUPR4vKn+8gzVF36pZbYTiTHsRwQJBANDY1ZDe5IsCa+diK3vLNs15HYAXXmoQlFZRh27fQ/exbilcjg+fYPiGa202r2O8HHzQcxySiVUg5oHwz2NhUwMCQQDIGshysgXy0A+uNzeglB6ARmDehaGdXwE0DqywJi3aKmlepoSKGdjtq24+Bfm5YVfFzcQ5NPLm913ti+uSZhAFAkBhSXELIFm0S7d6POfmrf5kbxQH9Frd68U+BJKjWkvuGXAowl3G90aT3wIyCPRg8GMQ3YWR/M0Oo9ndFBF3yQGDAkBdVWC5Xp+3qaQmtkqT84Jmgm0cXWgMZwvApDeX0bcBU1bidvjLEVNFR/ibpV3dQbIW6OrlY/UIFckRy3mNR12hAkEAttUVTsmBlJwPoM6QYJsnzFrpx/UWdEOwR9v5CAgtl77cJNWHh83IPgIThd8NXa47i+/LzN2agAq3QF4a7zZsIg==");  //privateStr : 私钥, 新增RSA加密私钥， 本次只新增该参数

    // 命令参数
    var option = {
        cwd: __dirname +'./'
    };

    // 调用
    var callJar = spawn("java", args, option);
    console.log(callJar)
    // 调用错误
    var e = null;
    callJar.on('error', function (error) {
        e = error;
    });

    // 标准错误输出
    var error = [];
    callJar.stderr.on('error', function (data) {
        error.push(data);
    });

    // 标准正常输出
    var stdout = [];
    callJar.stdout.on('data', function (data) {
        stdout.push(data);
    });

    // 关闭
    callJar.on('close', function (code) {

        if(e){
            console.error("发送失败"+e)
            //utils.respMsg(res, false, '2000', '发送验证码出错', null, e);
            return;
        }

        // 这里是调用jar控制台的所有打印消息
        // var data = iconv_lite.decode(Buffer.concat(stdout), 'utf-8');
        var data = iconv_lite.decode(Buffer.concat(stdout), 'GBK');
        // var data = Buffer.concat(stdout).toString();
        console.log(data);
        // 截取UIP返回值
        var start = "=====start=====";
        var end = "=====end=====";
        if(data.indexOf(start) != -1 && data.indexOf(end) != -1){
            data = data.substring(data.indexOf(start) + start.length, data.indexOf(end));
        }
        // 转换JSON
        data = JSON.parse(data);
        // 发送失败
        if(!data.success){
            //utils.respMsg(res, false, '2000', '发送失败', null, null);
            console.error("发送失败")
            return;
        }


    });
}