import $ from "jquery";
import { showShareDiv,showError } from "./util";
import { createApp } from 'vue';
import DwoloadPage from '../page/DwoloadPage.vue'
import user from '../util/user';

let shareId = function () {
    var url = location.href
    var match = url.match(/aliyundrive\.com\/s\/([a-zA-Z\d]+)/)
    return match ? match[1] : null
}


let showDownloadSharePage = function () {

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
  }



function initShareButton  () {

    if ($('.button-download-aliyun').length !== 0) {
        $('.button-download-aliyun').remove();
    }


    if ($('#root [class^=banner] [class^=right]').length !== 0 && $('.button--fep7l').length == 0) {
        var html = ''
        html += '<div style="margin:1px 7px;"></div><button class="button--2Aa4u primary--3AJe5 small---B8mi button-download-aliyun">显示链接</button>'
        $('#root [class^=banner] [class^=right]').prepend(html)
        $('.button-download-aliyun').on('click', showDownloadSharePage)

    } else {
        setTimeout(initShareButton, 1000)
    }
}

export default ()=>{

    initShareButton()
}