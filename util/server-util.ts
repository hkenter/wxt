import express from 'express';
import type {Express} from "express";
import * as swig from 'swig'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const app: Express = express();
// 不限制监听数量
process.setMaxListeners(0)
console.log(path.join(dirname(fileURLToPath(import.meta.url)), './../page/static'))
app.use(express.static(path.join(dirname(fileURLToPath(import.meta.url)), './../page/static')));
//设置渲染文件的目录
app.set('views','./../page');
//设置html模板渲染引擎
app.engine('html',swig.renderFile);
//设置渲染引擎为html
app.set('view engine','html')

app.listen(9527);

//调用路由，进行页面渲染
app.get('/overview',function(request,response){
  //调用渲染模板npm
  response.render('index',{
    //传参
    ticker: request.query['ticker']
  })
})

app.get('/static/d3.layout.cloud.js',function(_request,response){
  //调用渲染模板
  response.sendFile(path.join(dirname(fileURLToPath(import.meta.url)), './../page/static/d3.layout.cloud.js'));
})
