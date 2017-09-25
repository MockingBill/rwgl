/**
 * Created by DengQian on 2017/7/17.
 */
var mongoose=require('mongoose');
var model = require('../models/pm_model');
var utils = require('gmdp').init_gmdp.core_app_utils;

/**
 * 没有任何查询条件的分页查询
 * @param condition
 * @param size
 * @param name
 * @param cb
 */
exports.getPmList = function(condition, cb) {
    var query=model.$user_pm_statusModel.find({user_id:condition.current_id});
    query.populate({
        path: 'pm_id',
        match:{pm_end_date:condition.pm_end_date}
    });
    //计算分页数据
    query.exec(function(err,rs) {
        if (err) {
            cb(utils.returnMsg(false, '1000', '根据完成时间查询出现异常。', null, err));
        } else {
            var rsArr = [];
            //数据清洗，联表后所有的任务数据都在pm_id中
            for (var i in rs) {
                if (rs[i].pm_id !== null) {

                    rs[i].pm_id.pm_status=rs[i].status;
                    rsArr.push(rs[i].pm_id);
                }
            }
            cb(utils.returnMsg4EasyuiPaging(true, '0000', '根据完成时间名查询成功。',rsArr, rs.length));
        }

    });
};

/**
 *   easyui分页查询，针对所有任务。主要依靠与用户任务状态表和任务表使用子文档模拟联表查询。
 *   其中模糊查询使用了子文档match，排序是自定义的方法。该方法主要分为数据部分的查询和数据
 *   长度的查询。数据长度的查询仅比数据的查询少limit()和skip()。
 * @param page 页数
 * @param size 分页大小
 * @param condition 条件(包括任务名称、年份等)
 * @param cb 回调函数，处理json数据以及服务器相应信息封装.
 * @param sortItem 排序参数
 *
 */
exports.getPmListForEui = function(page, size, condition,sortItem, cb) {
    var so={};
    so[sortItem.sort]=sortItem.order;
    if(condition.year==='选择开始时间年度')
        condition.year='';
    var query=model.$user_pm_statusModel.find({status:condition.status,user_id:condition.current_id});
        query.populate({
            path: 'pm_id',
            match:{pm_name:new RegExp(condition.name),pm_begin_date:new RegExp(condition.year)}
        });

    query.skip((parseInt(page) - 1) * size);
    query.limit(parseInt(size));
    query.exec(function(err,result){
        if(err){
            cb(utils.returnMsg(false, '1000', '根据姓名查询出现异常。', null, err));
        }else {
            var rsArr=[];
            //数据清洗，联表后所有的任务数据都在pm_id中
            for (var i in result) {
                if(result[i].pm_id!==null){
                    rsArr.push(result[i].pm_id);
                }
            }
            var queryForLength=model.$user_pm_statusModel.find({status:condition.status,user_id:condition.current_id});
            query.populate({
                path: 'pm_id',
                match:{pm_name:new RegExp(condition.name),pm_begin_date:new RegExp(condition.year)}
            });
            queryForLength.exec(function (err,resForLength) {
                if(err){
                    cb(utils.returnMsg(false, '1000', '根据姓名查询出现异常。', null, err));
                }
                else{
                    if(sortItem.order!=undefined&&sortItem.sort!=undefined)
                    rsArr=sortData(rsArr,sortItem);
                    cb(utils.returnMsg4EasyuiPaging(true, '0000', '根据姓名查询成功。',rsArr,resForLength.length ));
                }

            });
        }
    });

    };

exports.updateUserPass=function (data,cb){
    model.$userModel.findById(data.user_id,function (err,resu) {
        if(err){
            cb(utils.returnMsg(false, '1009', '修改密码出现异常。', {flag:0}, err));
        }else{
            if(data.oldpass===resu.login_password){
                        model.$userModel.update({_id:data.user_id},{$set:{login_password:data.newpass}},function (err,result) {
                            if(err){
                                cb(utils.returnMsg(false, '1009', '修改密码出现异常。', {flag:0}, err));
                            }else{
                                cb(utils.returnMsg(true, '0009', '修改密码成功',{flag:1},null));
                            }
                        });
            }else{
                cb(utils.returnMsg(false, '1009', '原密码错误', {flag:0}, null));
            }
        }
    });
};

/**
 * 用于对查询结果进行排序。使用的冒泡法。以后可做优化。
 * @param data
 * @param sortItem
 * @returns {*}
 */
function sortData(data, sortItem) {
    var obj = {};
    //从小到大
    if (sortItem.order === 'asc') {
        for (var i in data) {
            for (var j in data) {
                if (data[i][sortItem.sort] > data[j][sortItem.sort]) {
                    obj = data[i];
                    data[i] = data[j];
                    data[j] = obj;
                }
            }
        }
    }
    //从大到小
    else {
        for (var i in data) {
            for (var j in data) {
                if (data[i][sortItem.sort] < data[j][sortItem.sort]) {
                    obj = data[i];
                    data[i] = data[j];
                    data[j] = obj;
                }
            }
        }
    }
    return data;
}


/**
 * 保存一条新增的任务信息，并且在用户任务表中插入一条数据，状态为待完成:0。
 * @param PmEntity
 * @param cb
 */

exports.savePm = function(PmEntity, cb) {
    // 实例模型，调用保存方法
    model.$(PmEntity).save(function(error){
        if(error) {
            cb(utils.returnMsg(false, '1001', '添加信息时出现异常。', null, error));
        }
        else {
            model.$user_pm_statusModel({pm_id:PmEntity._id,user_id:PmEntity.pm_sendPersonID,status:'0'}).save(function (error) {
                    if(error){
                        cb(utils.returnMsg(false, '1001', '添加信息时出现异常。', null, error));
                    }
                    else{
                        cb(utils.returnMsg(true, '0001', '添加信息成功。',PmEntity._id, null));
                    }
                });
            }
        });
    };
/**
 * 修改项目用户状态表
 * @param pm_id
 * @param user_id
 * @param status
 * @param cb
 */
exports.updateUser_pm_status=function (pm_id,user_id,status,cb) {
    model.$user_pm_statusModel.update({pm_id:pm_id,user_id:user_id}, {status:status}, function (error) {
        if(error) {
            cb(utils.returnMsg(false, '1006', '任务状态修改出现异常', null, error));
        }
        else {
            cb(utils.returnMsg(true, '0006', '任务状态修改成功', null, null));
        }
    });
};





/**
 * 用户未完成中的完成任务业务。该业务需要将某一个任务下所有的用户任务状态对应修改为已完成。
 * 可重构
 * @param pm_id
 * @param dataEntey
 * @param cb
 */
exports.updateAllUser_pm_status=function (pm_id,dataEntey,cb) {

    var conditions = {pm_id:pm_id};
    var update = {$set:dataEntey};
    var options = {multi: true};
    model.$user_pm_statusModel.update(conditions,update,options,function (err) {
        if(err)
            cb(utils.returnMsg(false, '1006', '任务状态修改出现异常', null, error));
        else
            cb(utils.returnMsg(true, '0006', '任务状态修改成功',null, null));
    })
}
/**
 * 为用户状态表添加一条信息
 * @param dataEntity
 * @param cb
 */
exports.addUser_pm_status=function (dataEntity,cb) {
    model.$user_pm_statusModel.create(dataEntity,function (err) {
        if(err){cb(utils.returnMsg(false, '1000', '转发任务时出现异常。', null, error));}
        else{cb(utils.returnMsg(true, '0000', '转发任务成功。', null, null));}
    });
};

/**
 * 删除和该任务有关的所有任务用户状态记录
 * @param pm_id
 * @param cb
 */
exports.deleteUser_pm_status=function (pm_id,cb) {

    model.$user_pm_statusModel.remove({pm_id:pm_id},function (err) {
        if(err){
            cb(utils.returnMsg(false, '1000', '删除信息时出现异常。', null, error));
        }else{
            cb(utils.returnMsg(true, '0000', '删除信息成功。', null, null));
        }

    });
};
/**
 * 单独获取一条任务信息，用于修改前显示与查看详情,在查看详情时对任务类型、状态
 * 紧急程度进行数字转文字的处理，故在修改的时候，前台需要对返回的数据进行数字化。
 * @param id
 * @param cb
 */
exports.getOnePm = function(id,cb) {
    var criteria = {_id:id}; // 查询条件
    var fields = {}; // 待返回的字段
    var options = {};
    model.$.find(criteria, fields, options, function (error, result) {
        if(error) {
            cb(utils.returnMsg(false, '1002', '查询单个任务信息出现异常。', null, error));
        }
        else {
            switch(result[0].pm_type){
                case '0':{result[0].pm_type='项目管理';break;}
                case '1':{result[0].pm_type='日程安排';break;}
                case '2':{result[0].pm_type='工作计划';break;}
            }
            switch (result[0].pm_status){
                case '0':{result[0].pm_status='待完成';break;}
                case '1':{result[0].pm_status='未完成';break;}
                case '2':{result[0].pm_status='已完成';break;}
            }
            switch ( result[0].pm_urgent_degree){
                case '0':{result[0].pm_urgent_degree='一般';break;}
                case '1':{result[0].pm_urgent_degree='紧急';break;}
                case '2':{result[0].pm_urgent_degree='非常紧急';break;}
            }
            cb(utils.returnMsg(true, '0002', '查询单个任务信息成功。',result, null));
        }
    });
};

/**
 * 修改一条任务信息
 * @param id
 * @param studentEntity
 * @param cb
 */
exports.updatePm = function(id,PmEntity, cb) {
    var conditions = {_id:id};
    var update = {$set:PmEntity};
    var options = {};
    model.$.update(conditions, update, options, function (error) {
        if(error) {
            cb(utils.returnMsg(false, '1003', '修改信息时出现异常。', null, error));
        }
        else {
            cb(utils.returnMsg(true, '0003', '修改信息成功。', null, null));
        }
    });
};


/**
 * 修改一条任务信息的任务记录
 * @param id
 * @param id,PmRecordEntity, cb
 * @param cb
 */
exports.updatePmRecord = function(id,PmRecordEntity, cb) {
    var conditions = {_id:id};
    var update = {$push:{pm_record:PmRecordEntity}};
    var options = {};
    model.$.update(conditions, update, options, function (error) {
        if(error) {
            cb(utils.returnMsg(false, '1006', '添加任务记录出现异常。', null, error));
        }
        else {
            cb(utils.returnMsg(true, '0006', '添加任务记录成功。',null, null));
        }
    });
};
/**
 * 获取当前系统下所有用户和用户所在部门
 *
 * 先查询出本系统的所有用户common_user_info，
 * 再以所有用户的所处机构部门进行条件查询common_org_info,
 * 再将查询出的机构和部门进行封装成树结构json数据
 *
 * ps:这样的处理方式使得可以转发给自己或者转发给发送者，这个bug日后进行修改
 */
exports.getUserOrgList=function (current_id,pm,bcb) {
    (function (cb) {
        model.$userModel.find({user_sys:mongoose.Types.ObjectId('5975b0645f23fd1364a5ee4b'),user_status:1},{user_status:'1',
        user_name:'1',
        user_sys:'1',
        user_org:'1'},function (err,res) {
        if(err){
            cb(utils.returnMsg(false, '1004', '获取用户组织结构出现异常！', null, error));
        }

        else{
            //过滤当前用户、发送人、已转发的用户
            var pmArr=pm.pm_receivePerson;
            for(var j in pmArr){
                for(var k in res){
                    if(res[k]._id.toString()==pmArr[j].id){
                        res.splice(k,1);
                    }
                }
            }

            for(var i in res){
               if(res[i]._id.toString()===current_id||res[i]._id.toString()==pm.pm_sendPersonID)
                   res.splice(i,1);
            }
            cb(res);
        }


    });

}(function (result) {
        var OrgIdArray=[];
        for(var i in result){
            OrgIdArray.push({_id:mongoose.Types.ObjectId(result[i].user_org)});
        }
        model.$orgModel.find({$or:OrgIdArray},{org_name:"1",org_fullname:"1"},function (err,data) {
            if(err)
                bcb(utils.returnMsg(false, '1004', '获取用户组织结构出现异常！', null, err));
            else {
                var userOrgTreeJson=[];
                var n=0;
                for(var i in data){
                    userOrgTreeJson[n]={id:data[i]._id,text:data[i].org_fullname,state:"open",children:new Array()};
                    m=0;
                    for(var j in result){
                        if(String(userOrgTreeJson[n].id)==String(result[j].user_org)){
                            userOrgTreeJson[n].children[m] = {id: result[j]._id, text: result[j].user_name};
                            m++;
                        }
                    }
                    n++;
                }

               bcb(utils.returnMsg(true, '0004', '获取用户组织成功。', userOrgTreeJson, null));
            }
        });
    }));
};
exports.getUserList=function (cb) {
            model.$userModel.find({user_sys:mongoose.Types.ObjectId('5975b0645f23fd1364a5ee4b'),user_status:1},{user_status:'1',
                user_name:'1',
                user_sys:'1',
                user_org:'1'},function (err,result) {
                if(err){
                    cb(utils.returnMsg(false,'1006','获取用户异常。',null,null));
                }else{
                    cb(utils.returnMsg(true,'0006','获取用户成功。',result,null));
                }
            });
};
exports.getOrgList=function (cb) {
    model.$orgModel.find({org_status:1},{},{sort:{org_order:1,org_fullname:1}},function (err,result) {
        if(err){
            cb(utils.returnMsg(false,'1007','获取部门异常。',null,null));
        }else{
            cb(utils.returnMsg(true,'0007','获取部门成功。',result,null));
        }
    });
};



/**
 * 查询所有任务开始时间
 */

exports.initCom=function (cb) {
    model.$.find(null,{pm_begin_date:"1"},function (err,result) {
        if(err){
            cb(utils.returnMsg(false, '1000', '下拉列表获取失败。', null, err));
        }else {
            cb(utils.returnMsg(true, '1000', '成功。', result, null));
        }
    });

}



/**
 * 修改一条任务的接受人ID和接收人姓名，即为转发功能的service实现
 */

exports.updateReceivePerson=function (pm_id,obj,cb) {
    var conditions = {_id:pm_id};

    var update = { $push: { pm_receivePerson: { $each: obj } } };

   model.$.update(conditions,update,function (error,doc) {
        if(error) {
            cb(utils.returnMsg(false, '1000', '转发任务时出现异常。', null, error));
        }
        else {
            cb(utils.returnMsg(true, '0000', '转发任务成功。', doc, null));
        }
    });
};

/**
 * 删除一条任务信息
 * @param id
 * @param cb
 */

exports.deletePm = function(id, cb) {
    var conditions = {_id:id};
    model.$.remove(conditions, function (error) {
        if (error) {
            cb(utils.returnMsg(false, '1000', '删除信息时出现异常。', null, error));
        }
        else {
            cb(utils.returnMsg(true, '0000', '删除信息成功。', null, null));
        }
    });
};


/**
 * 统计某天或者所有的任务情况，按照任务状态进行分类
 * @param condition
 * @param cb
 */
exports.getPmCount=function (condition,cb) {
    var query=model.$user_pm_statusModel.find({user_id:condition.current_id});
    query.populate({
        path: 'pm_id',
        match:{pm_end_date:new RegExp(condition.year)}
    });
   query.exec(function (err,result) {
       if(err)
           cb(utils.returnMsg(true, '1009', '加载数据发生异常', null, null));
       else{



           var obj=[{name : '待完成',value :0,color:getColor()},
               {name : '未完成',value :0,color:getColor()},
               {name : '已完成',value :0,color:getColor()}];
           for(var i in result){
               if(result[i].pm_id!=null){
               switch (result[i].status){
                   case '0':{obj[0].value++;break}
                   case '1':{obj[1].value++;break}
                   case '2':{obj[2].value++;break}
               }
               }
           }
            var mouthDay=[];
           for(var j in result){
               if(result[j].pm_id!=null)
               mouthDay.push(result[j].pm_id.pm_end_date);
           }
           //多个任务在同一天时，去除重复数据。
           var arr=[];
           var cc={};
           for(var i in mouthDay){
               cc[mouthDay[i]]=mouthDay[i];
           }
         for(var i in cc){
               arr.push({date:cc[i],num:0});
         }
           for(var i in mouthDay){
               for(var j in arr){
                   if(arr[j].date==mouthDay[i]){
                       arr[j].num++;
                   }
               }
           }


           cb(utils.returnMsg(true, '0000', '获取统计数据成功',{chart:obj,resu:arr}, null));
       }

   });

};


function getColor() {
    var str="";
    for(var i=0;i<=5;i++){
        str=str+(Math.floor(Math.random()*16)).toString(16);
    }
    return ("#"+str);

}
/**
 *
 * 获取所有的任务，以结束时间和关系用户(与该任务有关系的用户，包括发送者)
 * @param cb
 */
exports.getAllPminf=function (cb) {
    var query=model.$user_pm_statusModel.find({user_id:condition.current_id});
    query.populate({
        path: 'pm_id'
    });
    query.exec(function (err,result) {
        if(err){
            cb(utils.returnMsg(false, '1000', '获取每日任务情况异常', null, null));
        }else{
            var resArr=[];
            for(var i in result){
                resArr.push(result[i].pm_id.pm_end_date);
            }
            cb(utils.returnMsg(true, '1000', '获取每日任务情况成功', resArr, null));

        }
    });
};


