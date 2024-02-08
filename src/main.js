

import { ElMessage,ElMessageBox   } from 'element-plus'
import { listen } from './api/intercept'
import user from './util/user'
import ui from './ui/index'
import apiConfig from './api/config'
import session  from './util/session'
import { createApp } from 'vue';
import ConfigSessionDialog from './page/ConfigSessionDialog.vue'
import $ from "jquery"


function start() {
  let token = user.getToken()
  if (token == null) {
    ElMessage('阿里云盘助手：末登录，请登陆后使用')
    user.clearAll()
    return
  }

  apiConfig()

  //https://element-plus.org/zh-CN/component/button.html
  //https://artplayer.org/document/advanced/property.html#destroy

  console.log(`${'\n'} %c ali.video.user.js v${import.meta.env.VITE_VERSION} 罗根大人 %c https://greasyfork.org/zh-CN/scripts/458626  ${'\n'}${'\n'}`, 'color: #fadfa3; background: #030307; padding:5px 0;', 'background: #fadfa3; padding:5px 0;')

  if(user.isConfigSession()== false){
    let app =  createApp(ConfigSessionDialog)
    app.mount(
      (() => {
        const app = document.createElement('div');
        $('body').append(app);
        return app;
      })(),
    );
  }else{
    listen()
    session(function(){
      run()
    })
    ui()

  }




  function run(val) {

    $(function() {

      var versionRegex = /\/(\d+\.\d+\.\d+)/; 
      var scriptSrc = $('script[src*="bundle.js"]').attr('src');
      var match = scriptSrc.match(versionRegex);
      var version = match ? match[1] : null; // 提取匹配到的版本号
      console.log("UI版本: "+version)
      if(version == '4.6.0'){
        ElMessageBox.confirm('目前版本不兼容老版本UI,点击按钮安装兼容版本:v2.1.2?',"提示",{
          confirmButtonText: '确定',
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false
        })
        .then(() => {
          var url = 'https://greasyfork.org/zh-CN/scripts/458626?version=1219577';
          window.open(url, '_blank');
        })
        .catch(() => {
          
        })
      }
    });
  
    setInterval(user.refSession, 300000);
    user.refSession()
    ElMessage({
      message: '阿里云助手加载成功',
      type: 'success',
    })
  }
}

start()
