const express = require('express');
const app = express(); // express 实例
const bodyParser = require('body-parser') // 接收post接口中的body参数的中间件
// 跨域处理
var cors = require('cors');
app.use(cors({ origin: true, credentials: true }));

const axios = require('axios');

// body中间件转换
app.use(express.json()); // 专门处理json的中间件
app.use(express.urlencoded()) // 对url参数进行lencoded
app.use(bodyParser.urlencoded({ extended: true })) // 对过滤参数做lencoded


//1、查询任务列表
app.get('/list', async (req, res, next) => { // 1.状态 -> 1代办 2完成 3删除
  try {
    await axios.get('https://62301254f113bfceed4789d1.mockapi.io/todoList').then(response => list = response.data)
    res.json({
      list,
      message: '查询成功'
    })
  } catch (err) {
    next(err)
  }
})

// 2、 新增任务接口
app.post('/create', async (req, res, next) => {
  try {  // 防止有异常发生，因此要进行try catch
    // 必须需要中间件，来转换，否则拿不到，安装express的-> body-parser 中间件即可
    let { name, endTime, content } = req.body; // post请求的 参数都是放在body中的
    let status = '1'
    await axios.post('https://62301254f113bfceed4789d1.mockapi.io/todoList', { name, endTime, content, status })
    res.json({
      name,
      endTime,
      content,
      status
    })
  } catch (error) { // 有异常进来，就通过next把异常传递下去，会被全局的异常处理捕获到，然后全局的异常处理会去处理
    next(error)
  }
})
// 3、 修改任务接口 必须要有id接口, 演示而已，后期可以和新增公用，判断id即可
app.post('/update', async (req, res, next) => {
  try {
    let { name, endTime, content, id } = req.body; // post请求的 参数都是放在body中的
    await axios.get(`https://62301254f113bfceed4789d1.mockapi.io/todoList/${id}`).then(response => todo = response.data)
    if (todo) {
      await axios.put(`https://62301254f113bfceed4789d1.mockapi.io/todoList/${id}`, { name, endTime, content })
    }
    res.json({
      todo: todo
    })
  } catch (err) {
    next(err); // 下一步，交给异常处理去捕获操作。
  }
})

// 4、 修改状态按钮和删除共用一个接口即可
app.post('/update_status', async (req, res, next) => { // status 1代办 2完成 3删除
  try {
    let { id, status } = req.body;
    await axios.get(`https://62301254f113bfceed4789d1.mockapi.io/todoList/${id}`).then(response => todo = response.data)
    if (todo && todo.status !== status) {
      await axios.put(`https://62301254f113bfceed4789d1.mockapi.io/todoList/${id}`, { status })
    }
    res.json({
      todo: todo // 把修改后的去进行更新
    })
  } catch (error) {
    next(error)
  }
})


// 所有的错误，让我们的http的status=== 500, 方便进行异常处理统一抛出去
app.use((err, req, res, next) => {
  if (err) {
    res.status(500).json({
      message: err.message // 异常抛出
    })
  }
})

app.listen(3333, () => { console.log('服务启动成功') })