import $ from "jquery";
import { unsafeWindow} from '$';
import { showError } from "../ui/util";
import store from './store'
import {createSessionUrl} from '../api/aliyun'
import { ElMessageBox } from 'element-plus'

function copy (obj) {
    
    if(typeof obj !== 'object' || obj == null){
        return;
    }
    var newobj = obj.constructor === Array ? [] : {};

    for(var i in obj){
       newobj[i] = typeof obj[i] === 'object' ? copy(obj[i]) : obj[i];
    }
    return newobj
}

class User {

    constructor() {

        this.is_login = false
        this.vip_status = 0
        this.mid = ''
        this.uname = ''
        this.has_init = false
        // 页面信息
        this.page = {
            id: '',
            order: '',
            order_by: '',
            // 当前路径文件夹名称
            folderName: '',
            items: []
        }
        //视频信息
        this.video={
            id:'',
            // 时长
            duration:'',
            // 播放的时长
            play_cursor:'',
            // 视频名称
            name:'',
            thumbnail:'',
            // 0 首页自己的视频 1分享的视频
            type: -1,
            //当前视频所在的文件夹名称
            folderName:"",
            //跳转地址
            href:'',
            drive_id:''

        }

        this.sessionData = {
            authorization:'',
            deviceId:'',
            signature:'',
        }

    }

    getVideoPage(){
        return this.video;
    }

    /**
     * 获取自动签到设置
     * 
     */
    getSignInSet(){
        let config= store.getItem("signIn_config")
        return  config == '' ? {} :config
    }

    setSignInSet(signInInfo){
        return store.setItem("signIn_config",signInInfo)
    }

    //保存当前播放器设置
    saveVideoPlayerSet(art){

        let playerSet = {
            // 全屏
            fullscreen: art.fullscreen,
            //网页全屏
            fullscreenWeb: art.fullscreenWeb,
            // 播放速度
            playbackRate : art.playbackRate,
            // 清晰度
            qualityHtml : art.qualityHtml,
            //字幕大小
            subtitleSize:art.subtitleSize || 20,
            //字幕间距
            subtitleMargin:art.subtitleMargin || 0,
            //字幕偏移
            subtitleOffset:art.subtitleOffset || 0,
            //字幕颜色
            subtitleColor:art.subtitleColor || '#FFF'
        }

        store.setItem("playerSet",playerSet)
    }

    // 获取播放器设置页面
    getVideoPlayerSet(){
        let playerSet = store.getItem("playerSet");
        if (playerSet == "") {
            playerSet = {}
        }
        return playerSet;
    }

    // 查看用户是否已经同意 或者 配置了 获取session 所需要的浏览器名称
    isConfigSession(){
       let deviceName =  store.getItem("deviceName");
       let modelName =  store.getItem("modelName");
       return !( deviceName == '' || modelName == '')
    }

    // 保存视频信息
    saveVideoInfo(id,name,progress,folderName,href,share,play_cursor){
        let videoInfo = {
            "category": "video",
            "name": name,
            "progress": progress,
            "id": id,
            "folderName": folderName,
            "href": href,
            "share":share,
            "play_cursor":play_cursor

        }

        let list = store.getItem("historyVideo");
        if (list == "") {
            list = []
        }
        let newList = [videoInfo];
        list.forEach(function (item, index) {
            if (item.id !== id && newList.length <= 5) {
                newList.push(item);
            }
        })
        store.setItem("historyVideo", newList);
    }

    clearSession(){
        store.removeItem('LG_session')
        store.removeItem('LG_session_1')
        store.removeItem('LG_session_Ref')
        store.removeItem('x-device-id')
        store.removeItem('x-signature')
        store.removeItem('deviceName')
        store.removeItem('modelName')
        store.removeItem('signIn_config')
    }

    removeSession(){
        store.removeItem('LG_session')

    }

    clearAll(){
        user.clearSession()
        user.clearVideoHistory()
    }

    clearVideoHistory(){
        store.removeItem("historyVideo");
    }

    //获取视频历史列表
    getVideoLookList(){
        let historyVideo = store.getItem("historyVideo");
        if (historyVideo == "") {
            historyVideo = []
        }
        return historyVideo
    }

    getDeviceId(){
       return store.getItem("x-device-id")
    }

    getSignature(){
        return store.getItem("x-signature")
    }

    getPage() {
        var page =  this.page;
        if(!page.items){
            page.items = []
        }
        return page;
    }

    getAria2Set(){
        let aria2Set =  store.getItem("Aria2Set")
        if(aria2Set==''){
            aria2Set={
                link:'http://localhost:6800/jsonrpc',
                path: 'D:\/aliyundriveDownloads',
                token:'',
                dirCreate: false
            }
        }
       return aria2Set;
    }

    getVideoSet(){
        let videoSet =  store.getItem("VideoSet")
        if(videoSet==''){
            videoSet={
                quality:null,
            }
        }
        return videoSet;
    }

    setVideoSet(videoSet){
        store.setItem("VideoSet",videoSet);
    }


    setAria2Set(aria2Set){
        store.setItem("Aria2Set",aria2Set);
    }

    refSession(){
        let now =  new Date().getTime();
        let time = store.getItem('LG_session') || 0;
        let token = user.getToken()
        if(token == null){
            showError('获取当前凭证失败,请刷新或重新登录')
            return
        }else if(!user.isExpires(token)){
            showError('Token已失效,请刷新或重新登录')
            return
        }
        let d =  user.getDeviceId();
        let s =  user.getSignature();
        // 大于3分钟
        if((now - time > 180000 && token.user_id) || d=="" || s==""){
            store.setItem('LG_session',now)
            store.setItem('LG_session_Ref','true')
        }else {
            console.log("未到刷新时间或者时机")
            return;
        }
        user.session(token,function(a,b){
            store.setItem('LG_session',new Date().getTime())
            store.removeItem('LG_session_Ref')
        });
    }

    sessionSet( authorization,deviceId,signature){
        this.sessionData = {
            authorization:authorization,
            deviceId:deviceId,
            signature:signature,
        }
        store.setItem('LG_session_1',this.sessionData)
    }

    GetSesion(){
        let data=  this.sessionData;
        if(data.authorization == ''){
           let data1= store.getItem("LG_session_1")
           if(data1 == ''){
                return data
           }
           this.sessionData = data1;
           return data1;
        }
        return data;
    }

    session(token,callback){
        if(token == null){
            showError('刷新Session失败,token为空,请刷新或重新登录')
            return {}
        }

       return  new Promise((resolve, reject) => {
            let  deviceId = store.getAliyun("__ETAG__CNA__ID__")
            if(deviceId==''){
                deviceId=  token.user_id.split('').reverse().join("").substring(0,20);
            }
            let  userId = token.user_id;
            unsafeWindow.luoGenSession(function (key,pubStr,signature,nd){
                deviceId = nd;
                console.log('你好,罗根！')
                let deviceName = store.getItem("deviceName")
                let modelName = store.getItem("modelName")
            
                createSessionUrl({
                    "deviceName": deviceName,
                    "modelName" : modelName,
                    "refreshToken" : "71a164a40eb84a40b35c1a39d2023499",
                    "pubKey": pubStr
                },signature,deviceId).then((res)=>{
                    if(!res.data.result){
                        user.clearSession()
                        showError("设备超限,请下线其他设备,在刷新页面")
                        ElMessageBox.alert("请点击左下角退出登陆那个菜单，点击登陆设备管理，下线其他设备。然后刷新页面","设备超限", {
                            confirmButtonText: '好的',
                            callback: (action) => {
                            },
                        })
                        return
                    }
                    store.setItem('x-device-id',deviceId)
                    store.setItem('x-signature',signature)
                    resolve({
                        deviceId:deviceId,
                        signature:signature
                    });
                    callback && callback(pubStr,signature);
                }).catch((e)=>{
                    console.error("出现异常了...",e)
                    user.clearSession()

                    ElMessageBox.alert(e+"","刷新session失败", {
                        confirmButtonText: '刷新试一试',
                        callback: (action) => {
                            location.href = location.href
                        },
                    })
                    reject(e);
                })
            },window.atob('NWRkZTRlMWJkZjllNDk2NmIzODdiYTU4ZjRiM2ZkYzM='),deviceId,userId)
        });
     
    }



    /**
     * 是否在首页
     */
    home() {
        return location.href.indexOf('/drive/file') > 0
    }

    /**
     * 是否在资源库
     */
    resource() {
        return location.href.indexOf('/drive/file/resource') > 0
    }



    // 没过期返回true 过期 false
    isExpires(item) {
        if(item==null || !item.expire_time){
            return false;
        }
        let time = Date.parse(item.expire_time) - Date.now()
        return time > 0;
    }

    getShareToken(){
        return store.getAliyun("shareToken")
    }

    getToken () {
        let token = localStorage.getItem(`token`)
        if (token != null) {
            return JSON.parse(token)
        }
        return token
    }

    // 获取当前页面上所有的文件
    getAllFileList(){
       let   fileList = this.getPage().items
       
       if (fileList.length === 0) {
        console.error('获取文件列表失败')
        return []
        }
        return copy(fileList);
    }

    // 获取已选择的文件
    selectedFileList() {
        let jq = $;
        let selectedFileList = [], fileList = this.getAllFileList()
        if (fileList.length === 0) {
            console.error('获取文件列表失败')
            return []
        }
        let node = ''
        
        if (jq('.tbody--Na444  .tr--Ogi-3.tr--97U9T').length) {
            node = jq('.tbody--Na444  .tr--Ogi-3.tr--97U9T')
        } else if (jq('.outer-wrapper--JCodp').length) {
            node = jq('.outer-wrapper--JCodp')
        }
      
        node.each(function (index) {
            var $this = jq(node[index]);
            if ($this.attr('data-is-selected') === 'true') {
                let data_index = $this.closest('[data-index]').attr('data-index')
                data_index && selectedFileList.push(fileList[data_index])
            }
        })
        
        return copy(selectedFileList);
    }



}
const  user =  new User()
export default  user