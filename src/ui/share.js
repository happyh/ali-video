import $ from "jquery";
import { showShareDiv,showError } from "./util";
import { createApp } from 'vue';
import DwoloadPage from '../page/DwoloadPage.vue'
import user from '../util/user';
import { CLASS_NAMES } from './style'
import { ElMessageBox } from 'element-plus'


let shareId = function () {
    var url = location.href
    var match = url.match(/(aliyundrive|alipan)\.com\/s\/([a-zA-Z\d]+)/)
    return match ? match[2] : null
}


let showDownloadSharePage = function () {

    ElMessageBox.alert("很抱歉，当前官方暂时已下线该功能，如需下载，请先保存后在自己的网盘中获取直链。", {
        confirmButtonText: '确定'
    })

    /**
     * 
        let shareToken = user.getShareToken();
        if (!user.isExpires(shareToken)) {
            showError("当前页面已过期，请刷新重试")
            return
        }else if(shareId() != shareToken.share_id){
            location.reload();
            return
        }
        let app =  createApp(DwoloadPage)
        showShareDiv("文件下载",app)
      */
  }



function initShareButton  () {

    if ($('.button-download-aliyun').length !== 0) {
        $('.button-download-aliyun').remove();
    }


    if ($('#root [class^=banner] [class^=right]').length !== 0 && $('.button--fep7l').length == 0) {
        var html = ''
        html += `<div style="margin:1px 7px;"></div><button class="${CLASS_NAMES.button}  medium--Pt0UL button-download-aliyun"><p style="color: white;">显示链接<p></button>`
        $('#root [class^=banner] [class^=right]').prepend(html)
        $('.button-download-aliyun').on('click', showDownloadSharePage)

    } else {
        setTimeout(initShareButton, 1000)
    }
}

export default ()=>{

    initShareButton()
}