<script setup>
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { monkeyWindow } from '$';
import { ElDialog, ElForm, ElInput, ElFormItem, ElButton,ElMessage,ElLink } from 'element-plus'
import store from '../util/store'
const dialogFormVisible = ref(true)

const form = reactive({
  deviceName: '',
  modelName: ''
})


onMounted(async () => {
  form.deviceName = getBrowserName() + "浏览器";
  form.modelName = getOperatingSystem() + "网页版";
})


function getOperatingSystem() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];

  if (windowsPlatforms.indexOf(platform) !== -1) {
    return 'Windows';
  } else {
    return 'Not Windows';
  }
}

function getBrowserName() {
  var ua = navigator.userAgent;
  var tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i);
  if(/trident/i.test(M[1])){
    return 'IE';       
  }   
  if(M[1]=== 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if(tem != null) return tem[1].replace('OPR', 'Opera');
  }
  return M[1];
}

function configAgree(){
  if(form.deviceName == '' || form.modelName == ''){
    ElMessage('浏览器名称 或 设备名称不能为空')
    return
  }
  store.setItem("deviceName",form.deviceName)
  store.setItem("modelName",form.modelName)
  monkeyWindow.location.href = window.location.href;
}

onUnmounted(() => {
  console.log("文件下载窗口关闭")
})


</script>

<template>
  
  <ElDialog :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false"	 v-model="dialogFormVisible" title="设备名额权限申请">
    <span>
        因权限问题，需要占用一个登录设备名额，请您放心，并不是真的登录，您的每一个操作都没有经过第三方服务器，本脚本不会非法登录您的账号，更不会擅自获取您的隐私。<br/>
        
        且本脚本已经开源所有代码，欢迎检查是否有后门程序，也欢迎您为本脚本提交更多有趣的功能。    
        <el-link href="https://github.com/wyndem/ali-video" target="_blank">👉查看开源地址</el-link>
        <br/><br/>
        
        如果您还不放心，请卸载本脚本。原因为：没有权限，无法正常使用该脚本。<br/><br/>
        脚本以下功能需要用到：  文件遍历、文件直链、视频解析、分享视频2分钟限制、后缀名称修改、最近在看功能 等。<br/><br/>

        下面是占用设备的浏览器名称和设备名称，如果对默认值不满意，可以现在修改它
    </span>
    <br/><br/>
    <ElForm :model="form">
      <ElFormItem label="浏览器名称" :label-width="formLabelWidth">
        <ElInput v-model="form.deviceName" />
      </ElFormItem>

      <ElFormItem label="设备名称" :label-width="formLabelWidth">
        <ElInput v-model="form.modelName"/>
      </ElFormItem>
    </ElForm>
  

    <template #footer>
      <span class="dialog-footer">
        <ElButton type="primary" @click="configAgree">
          同意
        </ElButton>
      </span>
    </template>

  </ElDialog>
</template>




<style scoped>
.notice {
  color: #6592F9;
  font-size: 10pt;
}

.notice1 {
  margin: 2px 0 0;
  color: #E6A23C;
  font-size: 8pt;
}

.notice2 {
  margin: 2px 0 0;
  color: red;
  font-size: 8pt;
}


.footer {
  height: 68px;
  background: var(--background_secondary_blur);
  -webkit-backdrop-filter: blur(30px);
  backdrop-filter: blur(30px);
  margin: -20px;
  padding: 0 20px;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: justify;
  justify-content: space-between;
  border-radius: 0 0 10px 10px;
}
</style>

