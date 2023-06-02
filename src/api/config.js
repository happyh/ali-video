import axios from 'axios'
import user  from '../util/user'
import {showError} from '../ui/util'
import store from '../util/store'
import { ElMessageBox } from 'element-plus'

var sessionLoadding = false;

var listenArray=new Array()


// 添加请求拦截器
let interceptRequest = function(){
    axios.interceptors.request.use(async function (config) {
        let token = user.getToken()
        if(token==null){
            showError("当前登录凭证获取为空，请刷新或重新登录");
            throw "token 为空了" 
        }else if(!user.isExpires(token)){
            showError('Token已失效,请刷新或重新登录')
            throw "Token已失效,请刷新或重新登录" 
        }

        let isToken = config.headers._token;
        config.headers["authorization"] =  ''.concat(token.token_type || '', ' ').concat(token.access_token || '');
        config.headers["fileId"] = token.user_id
        if(isToken!=null && isToken==false){
           delete config.headers._token
           return config;
        }
        // 查看定时任务是否已经开始执行了
        let session_ref =  store.getItem("LG_session_Ref")
        if(session_ref!='' && session_ref=='true'){
            await new Promise((resolve, reject) => {
                function check(){
                    if(store.getItem("LG_session_Ref")==''){
                        resolve()
                    }else{
                        setTimeout(check,200)
                    }
                }
                check()
            })
        }

        if(sessionLoadding){
            await new Promise((resolve, reject) => {
                listenArray.push(function(){
                    resolve()
                })
            })
        }


        let d =user.getDeviceId();
        let s =user.getSignature();

        if( d== '' || s == ''){
           sessionLoadding=true;
           let rest = await user.session(token,function(){})
           if(rest.deviceId){
            d = rest.deviceId;
           }
           if(rest.signature){
            s = rest.signature;
           }
        }
        sessionLoadding=false;
        if(listenArray.length > 0){
            listenArray.forEach(i=>{
                i && i()
              })
              
              listenArray=new Array()
        }
    
        config.headers["x-device-id"] = d;
        config.headers["x-signature"] = s;
        // console.log(config)
        return config;
      }, function (error) {
        // 对请求错误做些什么
        console.log("出现异常",error)
        return Promise.reject(error);
    });


    axios.interceptors.response.use(function (response) {

        return response;
      }, function (error) {
        let repsonse = error.response

        if(repsonse && repsonse.status==401 && repsonse.data.code == "UserDeviceOffline"){
            user.clearSession()
            showError("当前设备已失效，请刷新重试")
            ElMessageBox.alert("请确认是否有下线设备操作，当前设备已失效","刷新session失败", {
                confirmButtonText: '刷新试一试',
                callback: (action) => {
                    location.href = location.href
                },
            })
        }

        if(repsonse && repsonse.status==400 && repsonse.data.message == "not found device info"){
            user.clearSession()
            showError("当前设备已失效，请刷新重试")
            ElMessageBox.alert("请确认是否有下线设备操作，当前设备已失效","设备失效", {
                confirmButtonText: '刷新试一试',
                callback: (action) => {
                    location.href = location.href
                },
            })
        }
        console.error("错误信息：",repsonse.data.message)
        return Promise.reject(error);
      });
    

}






export default ()=>{
    axios.defaults.baseURL = 'https://api.aliyundrive.com';

    interceptRequest()
}
