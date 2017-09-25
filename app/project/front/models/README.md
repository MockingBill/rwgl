## 存放业务相关的模型model
### 数据库使用mongodb
- 1.所有的collection定义存放在一个model文件中，命名方式：项目名_model.js；
- 2.按模块划分collection定义model文件，命名方式：模块名_model.js;
- 3.如果collection之间关联较多，建议使用第一种方式，反之使用第二种方式；
## 按模块划分model
- 命名方式：模块功能_model.js；
- 如：user_model.js；