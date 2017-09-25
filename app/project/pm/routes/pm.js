/**
 * Created by DengQian on 2017/8/17.
 */
/**
 *相关组件加载
 * @type {*}
 */
var express = require('express');
var router = express.Router();
var service = require('../services/pm_service.js');
var utils = require('gmdp').init_gmdp.core_app_utils;
//对上传的文件进行管理，故引入文件模块
var fs = require('fs');
//对ObjectID进行生成用于新增时候任务ID的方便返回，故在此引入mongoose模块，仅仅用于生成ObejctID
var mongoose=require('mongoose');

/**
 * 该路由用于首页数据的获取,点击某天。返回该天的所有任务情况。
 * 若没有传入日期数据，则使用当前日期数据进行查询。
 */

router.route('/').get(function (req, res) {
    var midden=req.query.pm_end_date;
    if(midden===undefined||midden===null||midden===''){
        var myDate = new Date();
        midden=new RegExp('');
    }else{
        //将类似2017-5-6的数据转为2017-05-06用于匹配数据库数据格式
    midden=midden.toString();
        midden2=midden.split('-');
        if( midden2[1].length!=2)
            midden2[1]="0"+midden2[1];
        if( midden2[2].length!=2)
            midden2[2]="0"+midden2[2];
        midden=midden2[0]+'-'+midden2[1]+'-'+midden2[2];
    }

    var condition ={current_id:req.session.current_user._id,pm_end_date:midden};

    service.getPmList(condition, function (result) {
        utils.respJsonData(res, result);
    })

    })

/**
 *作用: 所有新增方法的入口，增加任务信息 路由
 * url: post:/api/pm/pm/
 */
    .post(function (req, res) {

             //常规数据获取
            var pid=mongoose.Types.ObjectId();//手动生成主键,为保存附加文件信息做准备
            var pm_no = req.body.pm_no;
            var pm_name = req.body.pm_name;
            var pm_content = req.body.pm_content;
            var pm_responsibilityRoom = req.body.pm_responsibilityRoom;
            var pm_responsibilityPerson = req.body.pm_responsibilityPerson;
            var pm_begin_date = req.body.pm_begin_date;
            var pm_end_date = req.body.pm_end_date;
            var pm_remind_date = req.body.pm_remind_date;
            var pm_type = req.body.pm_type;
            var pm_status='0';//所有任务新建时状态均是待完成
            var pm_speed_of_progress = req.body.pm_speed_of_progress;
            var pm_urgent_degree = req.body.pm_urgent_degree;
            var pm_sendPerson=req.session.current_user.user_name;
             var pm_sendPersonID=req.session.current_user._id;
            var pm_remark = req.body.pm_remark;
            var pm_record='';//任务记录字段
             /**
              * 常规数据校验
              */

             if (!pm_no) {
                 utils.respMsg(res, false, '2001', '任务号不能为空。', null, null);
             }
             else if (!pm_name) {
                 utils.respMsg(res, false, '2002', '任务名不能为空。', null, null);
             }
             else if (!pm_content) {
                 utils.respMsg(res, false, '2003', '任务内容不能为空', null, null);
             }
             else if (!pm_responsibilityRoom) {
                 utils.respMsg(res, false, '2004', '责任室不能为空。', null, null);
             }
             else if (!pm_responsibilityPerson) {
                 utils.respMsg(res, false, '2005', '责任人不能为空。', null, null);
             }
             else if (!pm_begin_date) {
                 utils.respMsg(res, false, '2006', '开始时间不能为空。', null, null);
             }
             else if (!pm_end_date) {
                 utils.respMsg(res, false, '2006', '结束时间不能为空。', null, null);
             }
             else if (!pm_type) {
                 utils.respMsg(res, false, '2006', '任务类型不能为空。', null, null);
             }
             else if (!pm_speed_of_progress) {
                 utils.respMsg(res, false, '2006', '任务进度不能为空。', null, null);
             }
             else if (!pm_urgent_degree) {
                 utils.respMsg(res, false, '2006', '紧急程度不能为空。', null, null);
             }
             else if (!pm_remark) {
                pm_remark='无';
             }
             /**
              * 构造实体
              */
             else {
                 var PmEntity = {
                     _id:pid,
                     pm_no: pm_no,
                     pm_name: pm_name,
                     pm_content: pm_content,
                     pm_responsibilityRoom: pm_responsibilityRoom,
                     pm_responsibilityPerson: pm_responsibilityPerson,
                     pm_begin_date: pm_begin_date,
                     pm_end_date: pm_end_date,
                     pm_remind_date: pm_remind_date,
                     pm_type: pm_type,
                     pm_status: pm_status,
                     pm_speed_of_progress: pm_speed_of_progress,
                     pm_urgent_degree: pm_urgent_degree,
                     pm_sendPerson: pm_sendPerson,
                     pm_sendPersonID:pm_sendPersonID,
                     pmd_receivePerson: [{id:'',name:''}],
                     pm_remark: pm_remark,
                     pm_record:pm_record
                 };
                //保存到数据库、返回操作信息
                 service.savePm(PmEntity, function (result) {
                     utils.respJsonData(res, result);
                 });
             }
         });
                //上传附件文件保存的目录路径
    const dirPath = "./public/static/file/";
/**
 * 作用：文件上传路由、获取文件名称，判断文件是否存在，若存在则在
 * 数据该任务的附加文件字段添加该文件的文件名
 * URL:  /api/pm/pm/upload/+id
 * 该路由均被前台fileupload方法调用。而在对任务信息进行增加和修改
 * 的时候，页面都会先执行基础数据的更新，在成功的回调方法中再基础
 * 对上传的附件文件进行处理。
 */

router.route('/upload/:id').post(function (req, res) {
        var file = req.files.pmd_enclosure;
        //可以不上传文件、当无法检测文件的时候直接返回相关信息
        if(file===null||file===undefined||file==='')
            utils.respJsonData(res, utils.returnMsg(true, '0000', '未检测到有文件上传。', null, null));
        //附件文件对应的任务id、在确保文件成功上传后对数据库中附件文件名进行更改
        var pm_id=req.params.id;
        //只能上传压缩、文档、工作表类型的文件
        if (file.extension === 'rar' || file.extension === 'zip'||file.extension==='doc'||file.extension==='docx'||file.extension==='xls'||file.extension==='xlsx') {
            //文件最大限制在 20 MB
            if ((file.size / 1024) <= 20480) {
                if (file.name !== null && file.name !== '' && file.name !== undefined && fs.existsSync(dirPath + file.name)) {
                    //查看该任务下曾经是否有过附件、若存在附件、则删除掉。
                    service.getOnePm(pm_id,function (result) {
                            var old_enclosure=result.data[0].pmd_enclosure;
                            if(fs.existsSync(dirPath + old_enclosure))
                                deleteFile(old_enclosure);
                    });
                    //将当前上传的文件名更新进任务附件文件名
                    service.updatePm(pm_id,{pmd_enclosure:file.name},function (result) {
                        /**     因为是上传文件调用了service中修改文件的方法，从service中返回的修改成功作为提示就不合适了。
                         * 故使用上传文件成功的操作信息进行返回
                         */
                                     utils.respJsonData(res, utils.returnMsg(true, '0000', '上传文件成功。', null, null));
                        });
                    } else {
                    //上传出现异常的异常处理是若存在文件则删除、返回异常信息
                            if(fs.existsSync(dirPath + file.name))
                                     deleteFile(file.name);
                            utils.respJsonData(res, utils.returnMsg(false, '0000', '上传文件异常。', null, error));
                }
            } else {
                if(fs.existsSync(dirPath + file.name))
                deleteFile(file.name);
                utils.respJsonData(res, utils.returnMsg(false, '0000', '文件过大。', null, error));
            }
        } else {
            if(fs.existsSync(dirPath + file.name))
            deleteFile(file.name);
            utils.respJsonData(res, utils.returnMsg(false, '0000', '文件类型错误。', null, error));
        }
    });
/**
 * dataGird数据表格查询路由，其中涉及到根据列排序、获取不同
 * 任务状态数据、以及获取当前登录者相匹配的数据
 */
            router.route('/que').get(function (req, res) {
        //分页数据获取
    var page = req.query.page;                  //用于分页查询提供当前页数
    var length = req.query.rows;                //用于分页查询提供每页行数
        //业务逻辑数据获取
    var status = req.query.status;              //只获取某种任务状态的数据、故页面被分为三种任务状态所对应
    var name = req.query.name;                  //用于任务名模糊查询
    var sort= req.query.sort;                   //用于点击列头获取需要以哪一列数据作为排序依据
    var order=req.query.order;                  //用于表示升序排列或者降序排列，只有两个值 'asc' 或者 'desc
    var year=req.query.year;                    //在已完成和所有任务页面中、进行年份的为依据的模糊查询
    var sortItem={sort:sort,order:order};       //排序依据形成排序对象
    var current_id=req.session.current_user._id;//获取当前登录用户的id。用于只显示接收人或者发送者为当前用户的数据
        if (page == 0) {
            page = 1;
        }
      var  condition={status:status,name:name,current_id:current_id,year:year};
        console.log('分页参数：page=' + req.query.page + ',length=' + req.query.rows);

        service.getPmListForEui(page, length, condition,sortItem,function (result) {
            utils.respJsonData(res, result);
        });
    });


    /**
     * 获取用户以及用户所在部门数据用于转发用户列表，需要过滤当前用户、发送者、已接受该信息的用户
     */
            router.route('/getUserOrg/:id').get(function (req,res) {
                var id=req.params.id;
                service.getOnePm(id,function (resu) {
                    service.getUserOrgList(req.session.current_user._id,resu.data[0],function (result) {
                        utils.respJsonData(res,result);
                    });
                });

    });
/**
 * 获取未禁用的用户和组织机构,用于在新增和修改页面装载下拉列表
 */
router.route('/getAllUserOrg').get(function (req,res) {
                service.getUserList(function (resu) {
                    service.getOrgList(function (result) {
                        var allUserOrgList={user:resu.data,org:result.data};
                        result.data=allUserOrgList;
                        utils.respJsonData(res,result);
                    });
                });
            });
/**
 * 获取统计数据，所有的任务情况和某天的任务情况,按照任务状态进行分类
 */
router.route('/getCount').get(function (req,res) {
    var condition={current_id:req.session.current_user._id,year:req.query.year};
    if(condition.year!=undefined&&condition.year!=null&&condition.year!=''){
        var yy=condition.year.toString().split('-');
        if(yy[1].length!=2);
        yy[1]='0'+yy[1];
        if(yy[2].length!=2)
            yy[2]='0'+yy[2];
        condition.year=yy[0]+"-"+yy[1]+"-"+yy[2];
    }
    service.getPmCount(condition,function (result) {
        utils.respJsonData(res, result);
    });
}).post(function (req,res) {
    service.getAllPminf(function (result) {
        utils.respJsonData(res, result);
    });
    
});
    

    /**
    * 获取所有任务中，开始时间的年份信息。用于填充根据年份查询的组合框（下拉列表框）
    */
            router.route('/getYear').get(function (req, res){
                service.initCom(function (doc) {
                var noRepeat={};
                var yearArr=[];
                var result=doc.data;
                //字符串分割 将2017-5-5 分割为2017
                for(var i in result){
                        result[i]=result[i].pm_begin_date.toString().split('-')[0];
                }
                //去掉重复数据
                for(var i in result){
                    noRepeat[result[i]]=result[i];
                }
                //遍历去重后的数据
                for(var i in noRepeat){
                    yearArr.push({id:noRepeat[i],text:noRepeat[i]+'年'});
                }
                 //返回数据
                    doc.data=yearArr;
                utils.respJsonData(res,doc);
            });
        });

        /**
        * 转发任务,即将该任务的接受人改为转发者，在任务表中的recivePerson中增加相关人员信息，
        * 在用户任务状态表中增加相关信息字段：
        * 1.对于通知类任务，转发者和接受者转发后即完成任务。
        */
        router.route('/forWard/:id').post(function (req,res) {
            //获取任务id
            var pm_id=req.params.id;
            //获取当前用户id
            var current_user_id=req.session.current_user._id;
            //获取接收人信息
            for (var num in req.body)
                console.log(num);
            var obj = JSON.parse(num);
            //获取任务类型
            var type=obj[obj.length-1];
            //删除接收人数组中的任务类型元素，否则会影响接收人数组的数据库操作
            obj.splice(obj.length-1,1);

            service.updateReceivePerson(pm_id,obj,function (result) {
            //若当前任务是通知类任务
            if(type!=='0'){
                 var user_pm_status=[];
                 for(var n in obj){
                     if(pm_id!==''&&pm_id!==null||pm_id!==undefined)
                    user_pm_status.push({pm_id:pm_id,user_id:obj[n].id,status:'0'});
                    }
                        service.addUser_pm_status(user_pm_status,function (resu) {
                        service.updateUser_pm_status(pm_id,current_user_id,'2',function (resu2) {
                            utils.respJsonData(res,utils.returnMsg(true, '0005', '转发成功，加入已完成。', null, null));
                        });
                    });
             }
             //任务为管理类任务
             else if(type==='0'){
                 var user_pm_status=[];
                 for(var n in obj){
                     if(pm_id!==''&&pm_id!==null||pm_id!==undefined)
                         user_pm_status.push({pm_id:pm_id,user_id:obj[n].id,status:'0'});
                 }
                 service.addUser_pm_status(user_pm_status,function (resu3) {
                     utils.respJsonData(res,utils.returnMsg(true, '0005', '转发成功。', null, null));
                 });
             }else
                 utils.respJsonData(res,result);
         });
     });
/**
 * 查看后变更通知类任务状态。
 */
        router.route('/updatePmUserStatus/:id').get(function (req,res) {
            var pm_id=req.params.id;
            var current_user_id=req.session.current_user._id;
            var pm_type=req.query.pm_type;
            //通知类任务转为已完成、管理类任务转为未完成。
            var status='1';
            if(pm_type!=='0')
                status='2';
            service.updateUser_pm_status(pm_id,current_user_id,status,function (result) {
                utils.respJsonData(res,result);
            });

        });

           /**
            * 开始任务,即变更任务状态为未完成，可在未完成列表中找到该任务。
            * 现在该路由已废弃，改为查看后进入未完成。
            */
            router.route('/startPm/:id').get(function (req,res) {
                var pm_id=req.params.id;
                service.updatePm(pm_id,{pm_status:'1'},function (result) {
                utils.respJsonData(res,result);
                });
            });
            /**
             * 变更管理类任务状态为完成
             * 未做后端身份验证
             * 先变更pm_info的状态,再变更user_pm_status中所有该id的状态为已完成
             */
            router.route('/donePm/:id').get(function (req,res) {
                var pm_id=req.params.id;
                
                service.updatePm(pm_id,{pm_status:'2'},function (result) {
                    service.updateAllUser_pm_status(pm_id,{status:'2'},function (result2) {
                        utils.respJsonData(res,result2);
                    });
                    });
                });
           /**
            * 添加任务记录，并且返回任务记录
            */
            router.route('/updatePmRecord/:id').post(function (req,res) {
                var pm_id=req.params.id;
                var message=req.body.message;
                var senderName=req.body.senderName;
                var senderId=req.body.senderId;
                if (!pm_id||!message||!senderName||!senderId) {
                    utils.respMsg(res, false, '2006', '相关信息缺失，添加失败', null, null);
                }else{
                    service.updatePmRecord(pm_id,{message:message,senderName:senderName,senderId:senderId},function (result) {
                        service.getOnePm(pm_id,function (resu) {
                            utils.respJsonData(res,resu);
                        })

                    });
                }
            });
/**
 * 用户修改密码路由
 */
router.route('/updateUser').post(function (req,res) {
    var user_id=req.session.current_user._id;
    var pa=new RegExp(/^[\w\d]{24,24}$/);
    if(!pa.test(user_id)){
                    utils.respJsonData(res,utils.returnMsg(true, '1009', '数据格式异常', {flag:0}, null));
                }
                var fl='1c8062fed38ad48d0545da403a1e0d6e';
                //检查密码合法性，针对拦截修改做出防御
                pa=new RegExp(/^[\w\d]{32,32}$/);

                var oldpass=req.body.oldPass;
                if(!pa.test(oldpass)){
                    utils.respJsonData(res,utils.returnMsg(true, '1009', '数据格式异常', {flag:0}, null));
                }

                var newpass=req.body.newPass;
                if(!pa.test(newpass)){
                    utils.respJsonData(res,utils.returnMsg(false, '1009', '数据格式异常', {flag:0}, null));
                }
                service.updateUserPass({user_id:user_id,oldpass:oldpass,newpass:newpass},function (result) {
                    utils.respJsonData(res,result);
                });
            });



            /**
            * 修改一条任务数据。
            */
            router.route('/:id').put(function (req, res) {
            //id唯一标识获取
            var id = req.params.id;
            //将body中的数据进行转型，用对象的方式来获取它们
            //这样的方式可以解决同参的问题，出现同名参数时将会获取到数组
            for (var num in req.body)
                console.log(num);
            var obj = JSON.parse(num);


            //常规数据获取
            var pm_no = obj.pm_no;
            var pm_name = obj.pm_name;
            var pm_content = obj.pm_content;
            var pm_responsibilityRoom = obj.pm_responsibilityRoom;
            var pm_responsibilityPerson = obj.pm_responsibilityPerson;
            var pm_begin_date = obj.pm_begin_date;
            var pm_end_date = obj.pm_end_date;
            var pm_remind_date = obj.pm_remind_date;
            var pm_speed_of_progress = obj.pm_speed_of_progress;
            var pm_urgent_degree = obj.pm_urgent_degree;
            var pm_remark = obj.pm_remark;
            /**
             * 数据校验
             */
            if (!pm_no) {
                utils.respMsg(res, false, '2001', '任务号不能为空。', null, null);
            }
            else if (!pm_name) {
                utils.respMsg(res, false, '2002', '任务名不能为空。', null, null);
            }
            else if (!pm_content) {
                utils.respMsg(res, false, '2003', '任务内容不能为空', null, null);
            }
            else if (!pm_responsibilityRoom) {
                utils.respMsg(res, false, '2004', '责任室不能为空。', null, null);
            }
            else if (!pm_responsibilityPerson) {
                utils.respMsg(res, false, '2005', '责任人不能为空。', null, null);
            }
            else if (!pm_begin_date) {
                utils.respMsg(res, false, '2006', '开始时间不能为空。', null, null);
            }
            else if (!pm_end_date) {
                utils.respMsg(res, false, '2006', '结束时间不能为空。', null, null);
            }
            else if (!pm_speed_of_progress) {
                utils.respMsg(res, false, '2006', '任务进度不能为空。', null, null);
            }
            else if (!pm_urgent_degree) {
                utils.respMsg(res, false, '2006', '紧急程度不能为空。', null, null);
            }
            else if (!pm_remark) {
                utils.respMsg(res, false, '2006', '备注不能为空。', null, null);
            }
            /**
             * 通过输入验证进行数据更新
             */
            else {
                var PmEntity = {
                    pm_no: pm_no,
                    pm_name: pm_name,
                    pm_content: pm_content,
                    pm_responsibilityRoom: pm_responsibilityRoom,
                    pm_responsibilityPerson: pm_responsibilityPerson,
                    pm_begin_date: pm_begin_date,
                    pm_end_date: pm_end_date,
                    pm_remind_date: pm_remind_date,
                    pm_speed_of_progress: pm_speed_of_progress,
                    pm_urgent_degree: pm_urgent_degree,
                    pm_remark: pm_remark
                };

                service.updatePm(id, PmEntity, function (result) {
                    utils.respJsonData(res, result);
                });
            }
        })
        // 获取单个任务的信息、用于修改任务时将任务数据展现在窗口
        .get(function (req, res) {
            var id = req.params.id;
            if (!id) {
                utils.respMsg(res, false, '2000', 'id不能为空。', null, null);
            }
            else {
                service.getOnePm(id, function (result) {
                    utils.respJsonData(res, result);
                });
            }
        })
        // 删除一个任务信息
        .delete(function (req, res) {
            var id = req.params.id;

            if (!id) {
                utils.respMsg(res, false, '2000', 'id不能为空。', null, null);
            }
            else {
                //删除一个任务的时候、也将其上传的附件文件进行删除
                service.getOnePm(id,function (result) {
                    deleteFile(result.data[0].pmd_enclosure);
                    service.deletePm(id,function (result2) {
                        service.deleteUser_pm_status(id,function (result3) {
                            utils.respJsonData(res, result3);
                        });
                    });
                });

            }
        });
            


    /**
     * 删除没用的文件
     * @param fileName
     */
    function deleteFile(fileName) {
        fs.unlink(dirPath + fileName, function (err) {
            if (err){
                console.log(err);
            }
            console.log('成功删除');
        });
    }
    
    

module.exports = router;