

import { ElMessage } from 'element-plus'
import { listen, http } from './api/intercept'
import user from './util/user'
import ui from './ui/index'
import apiConfig from './api/config'
import session  from './util/session'

function start() {
  let token = user.getToken()
  if (token == null) {
    ElMessage('阿里云助手：末登录，请登陆后使用')
    user.clearAll()
    return
  }

  apiConfig()

  //https://element-plus.org/zh-CN/component/button.html
  //https://artplayer.org/document/advanced/property.html#destroy

  console.log(`${'\n'} %c ali.video.user.js v${import.meta.env.VITE_VERSION} 罗根大人 %c https://greasyfork.org/zh-CN/scripts/458626  ${'\n'}${'\n'}`, 'color: #fadfa3; background: #030307; padding:5px 0;', 'background: #fadfa3; padding:5px 0;')

  listen()
  session(function(){
    run()

  })
  // async function init() {
  //   ElMessage('脚本加载中')
  //   await loadScript("https://gitee.com/lord-logan/aliEccJs/releases/download/v0.4/main.js")
  //   // await loadScript("http://127.0.0.1/static/main.js")
  //   .then((val) => {
  //       run()
  //     })
  // }

  // init()

  function run(val) {
    setInterval(user.refSession, 300000);
    user.refSession()
    ui()
    ElMessage({
      message: '阿里云助手加载成功',
      type: 'success',
    })
  }
}

start()
