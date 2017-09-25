

/**
 * Created by ShiHukui on 2016/2/22.
 *
 *
 **/
var project_url_prefix = "/project";
var config = {
    project:{
        appid:'rwgl',
        appname: '贵州移动网络部任务管理系统', // App名字
        apptitle: '贵州移动网络部任务管理系统', // 网页title
        appdescription: 'rwgl', // App的描述
        copyright:'©中国移动贵州公司 版权所有',
        keywords: 'cmcc,rwgl',
        version: '0.0.1',
        theme:'themes/beyond/',// 默认主题，优先显示common_system_info中的sys_theme_layout
        url:'',
        appurl:project_url_prefix,
        appviewurl:'app/',
        password_suffix:'@cmcc',
        captcha_login_enable:false,// 是否开启登陆验证码
        captcha_session_key:'captcha_session_key'
    },
    datas:{
        tree_org:{
            root_node_name:'组织架构'// 机构根节点名称
        },
        tree_menu:{
            root_node_name:'ROOT'// 菜单根节点名称
        },
        tree_param:{
            root_node_name:'全部'// 菜单根节点名称
        }
    },
    session:{
        secret:'exam_secret',
        key: 'exam_id',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
        cookie_maxAge:1800000,  //单位ms，即10分钟后session和相应的cookie失效过期
        resave: false,
        saveUninitialized: false,
        rolling:true,
        mongodb_url:'mongodb://127.0.0.1:27017/rwgl_test',
        mongodb_collection:'common_user_session'
       // 'mongodb://10.201.253.152:27017/rwgl_test'
    },
    routes:{
        mount_path:'*/routes/*',// 路由挂载路径
        is_debug:true,// 是否开启调试模式
        mappings: {
            '/project/demo/routes/': project_url_prefix + '/api/demo/',//demo路由匹配路径,
            '/project/pm/routes/': project_url_prefix + '/api/pm/',//pm路由匹配路径
            '/project/front/routes/': project_url_prefix + '/api/front/'// 项目前台路由匹配路径

        },
        welcome_path:project_url_prefix + '/home',
        // 不做权限检查url（支持通配符*，尽量少用）
        exclude_auth_check_urls:[project_url_prefix + '/login',project_url_prefix + '/captcha',project_url_prefix + '/test/*', project_url_prefix +'/static/*'],
        // 登陆后就能访问的url（无需授权）（支持通配符*，尽量少用）,如：修改个人信息、注销等操作
        logged_can_access_urls:[project_url_prefix + '/public/*', project_url_prefix + '/switchRole/*', project_url_prefix + '/logout', project_url_prefix + '/portal', project_url_prefix + '/api/demo/*']
    },
    mongdb:{
        url: 'mongodb://127.0.0.1:27017/rwgl_test',
        //url: 'mongodb://10.201.253.152:27017/rwgl_test',

        poolsize:20
    },
    memcached:{
        //server_locations:['10.201.253.152:11211','10.201.253.152:11212','10.201.253.152:11213'],
        server_locations:['127.0.0.1:11211'],
        options:{debug: true}
    },
    mysql:{
        host: '10.201.253.114',
        /*host: '192.168.1.115',*/
        port:31006,
        user: 'root',
        password: 'repLcmc0613',
        database: 'rwgl',
        insecureAuth: true
    },
    auth:{
        auth_type:'local',// local：本地认证；cas：单点登录认证
        //cas_server_url             : 'http://117.135.196.139:65080/cas',
        cas_server_url             : 'http://10.196.11.231/cas',
        cas_server_version         : '2.0',
        //cas_client_service_url     : 'http://117.135.196.139:30000',
        cas_client_service_url     : 'http://localhost:3000',
        cas_client_session_name    : 'cas_sso_user',
        password:{
            key_1:'ea5456ffa698a9d7b469bcdd768bc104',
            key_2:'180831b7e2e6daba6ee89dbdf7846293',
            key_3_prefix:'cmcc_gz_'
        },
        password_daily_err_count:5// 密码每日允许错误次数
    },
    sms:{
        debug:false,                                                      //是否开启调试模式
        url:'http://10.195.175.117:8091/newSmsWebService/services/SMSService?wsdl',
        username:'zhongyixitong',                                         // 分配的用户名
        password:'Zhongyixitong#123',                                    // 分配的密码
        licence:'e3a5e2d8bf09619ddb2c106e02949609566b009170476ab4',       // 分配的序列号
        systeminfo:'zhongyixitong'                                        // 所属系统
    }
}
module.exports = config;
