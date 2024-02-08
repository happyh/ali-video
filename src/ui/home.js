import $ from "jquery";
import { showDiv } from "./util";
import { createApp } from 'vue';
import DwoloadPage from '../page/DwoloadPage.vue'
import VideoHistoryPage from '../page/VideoHistoryPage.vue'
import { CLASS_NAMES } from './style'

let showDownloadHomePage = function () {
      let app =  createApp(DwoloadPage)
      showDiv("文件下载",app)
}



function initMenuButton  (menuName) {

    if ($('.button-download-aliyun').length !== 0) {
        return;
    }

    var css ='#root header:eq(0)'
    // if(menuName==='密码箱'){
    //     css ='.actions--2qvID:eq(0)'
    // }

    if ($(css).length > 0) {
        var html = ''
        html += `<div style="margin:1px 8px;"></div><div class="${CLASS_NAMES.button} small--e7LRt history-video"><span style="margin-right:2px" data-role="icon"data-render-as="svg"data-icon-type="PDSAddS"class="icon--D3kMk"><svg t="1676170067530"class="icon"viewBox="0 0 1024 1024"version="1.1"xmlns="http://www.w3.org/2000/svg"p-id="2764"width="200"height="200"><path d="M512 1024C229.248 1024 0 794.752 0 512S229.248 0 512 0s512 229.248 512 512-229.248 512-512 512z m42.666667-486.869333V298.538667C554.666667 275.328 535.552 256 512 256c-23.722667 0-42.666667 19.029333-42.666667 42.538667v256.256a41.984 41.984 0 0 0 12.202667 29.866666l121.258667 121.258667a42.368 42.368 0 0 0 60.032-0.298667 42.666667 42.666667 0 0 0 0.298666-60.032L554.666667 537.130667z"fill="#ffffff"p-id="2765"></path></svg></span><p class='${CLASS_NAMES.textPrimary}'>最近在看<p></div>`
        html += `<div style="margin:1px 8px;"></div><div class="${CLASS_NAMES.button} small--e7LRt button-download-aliyun"><p class='${CLASS_NAMES.textPrimary}'>显示链接<p></div>`
        $('.history-video').remove();
        $('.button-download-aliyun').remove();
        $(css).append(html)
        $('.button-download-aliyun').on('click',showDownloadHomePage)
        $('.history-video').on('click', ()=>{
            let app =  createApp(VideoHistoryPage)
            showDiv(`<div style="display:flex; justify-content:center;  align-items:center;" class='${CLASS_NAMES.textPrimary}'>
                    <span data-role="icon" data-render-as="svg" data-icon-type="PDSRecent" class="icon--d-ejA ">
                        <svg viewBox="0 0 1024 1024"><use xlink:href="#PDSRecent"></use></svg>
                        </span>最近在看</div>`,app)
        })

    } else {
        setTimeout(function(){
            initMenuButton(menuName)
        }, 1000)
    }
}



export default (menuName)=>{

    initMenuButton(menuName)
}