<script setup>
import { ref, onMounted, onUnmounted, createApp } from "vue";
import { homeWidgets } from '../api/aliyun'
import user from '../util/user';
import $ from "jquery"
import VideoPage from './VideoPage.vue'
import { CLASS_NAMES } from '../ui/style'


let locList = ref(user.getVideoLookList())
let clodList = ref([])

let listData = ref([
    {
        key:"本地历史",
        list:locList
    },
    {
        key:"云端历史",
        list:clodList
    }
])

onMounted(() => {

    videoHistoryList(listFuction)
})


/** 列表处理 */
function listFuction(data) {

    if (data.length != 0) {
        clodList.value = data;
    }

}

/** 清空本地历史 */
function clearHistory(){
    user.clearVideoHistory()
    locList.value = []
}
function playInfo(videoItem){
    if(videoItem.share){
        location.href = videoItem.href;
        return
    }

    let vInfo = user.getVideoPage()
    vInfo.id=videoItem.id;
    vInfo.drive_id=videoItem.drive_id;
    vInfo.play_cursor = videoItem.play_cursor;
    vInfo.name = videoItem.name;
    vInfo.thumbnail = "";
    vInfo.folderName = videoItem.folderName;
    vInfo.type = 0;
    vInfo.href = videoItem.href;
    let html = `<div class="modal--nw7G9" id="videoHistory">
    <div class="web--sYiY- container--5Stu-">
      <div class="content--9N3Eh">
        <div class="header--u7XR-" data-layout-sider-open="true">
        <div class="header-right--jsds3">
          <div class="nav-actions--hGPM3">
          <span class="nav-action--McoQC nav-prev--f5MXf">
                    <span data-role="icon" data-render-as="svg" data-icon-type="PDSLeftNormal" class="nav-icon--0dKs7 icon--D3kMk "  style="color:#1890ff">
                  <svg viewBox="0 0 1024 1024">
                    <use xlink:href="#PDSRightNormal">
                    </use>
                  </svg>
                </span>
                <span class="nav-text--gdQi6">
                  <a href="${vInfo.href}">进入到当前目录</a>
                </span>
              </span>
            </div>
          <div class="separator--cn-Xf">
            </div>
          </div>
        <div class="header-center--CexZ2">
          <div class="filename--cpLKM">
              <span class="text--KBVB3">${ vInfo.name}</span>
            </div>
          </div>
          <div style="padding:10px" id="header-close">
            <span data-role="icon" data-render-as="svg" data-icon-type="PDSClose"  class="icon--BObaC icon--D3kMk ">
              <svg viewBox="0 0 1024 1024" data-spm-anchor-id="0.0.0.i4.54a06c75hUkxKw">
                <use xlink:href="#PDSClose">
                </use>
              </svg>
            </span>
          </div>
        </div>
        <div class="previewer--g6qCF">
          <div class="video-previewer--6slx7">
 		<div class="video-previewer-container--43gy-"  tabindex="-1" data-fullscreen="false">
               <div class="video-stage---5FXB">
                <video class="video--26SLZ" preload="metadata" src="">
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`
    $('#root').append(html)
    var app =  createApp(VideoPage)
    app.mount(
        (() => {
            const app = $(`<div id="videoPage" class='video-previewer--6slx7'></div>`)[0];
            $(".previewer--g6qCF").replaceWith(app)
            $('.ant-modal-Link .icon-wrapper--TbIdu').click()
            return app;
        })(),
    );

    
    $("#header-close").one('click', function () {
        app.unmount()
        $('#videoHistory').remove()
    })                                         

}

let videoHistoryList = function (callback) {
    homeWidgets().then(res => {
        let site = location.protocol + "//" + location.host + '/drive/file/backup/'
        if (res.data && res.data.recentUsed) {
            let videoList = res.data.recentUsed.items.filter(function (item, index) {
                return item.category === 'video'
            })
            videoList = videoList.map((item) => {
                let href = site

                if (item.compilationId) {

                    let i = item.compilationId.indexOf('_');
                    let compilationId = item.compilationId.substring(i + 1, item.compilationId.length);
                    href += compilationId
                }
            
                return {
                    "category": "video",
                    "name": item.name,
                    "progress": item.progressPercentage,
                    "id": item.fileId,
                    "folderName": item.fromSourceDescription,
                    "href": href,
                    "share": false,
                    "drive_id":item.driveId,
                    "play_cursor": item.playCursor
                }
            });
            callback && callback(videoList);
            return
        }
        callback && callback([])

    }).catch(err => {
        callback && callback([])
    })
}




onUnmounted(() => {
    console.log("历史页面销毁")
})


</script>

<template>
    <div>
        <p style="padding-bottom:10px" :class="CLASS_NAMES.textPrimary"> 最近观看了{{ locList.length + clodList.length }}个视频</p>

        <div style="height: 410px; overflow-y: auto;">
            <div v-for="(data, i1) in listData" :key="i1" >

                <hr v-if="data.key=='云端历史'" align=center width="100%" color="#1890ff" size=1/>

                <h1 style="padding-bottom:13px" :class="CLASS_NAMES.textPrimary">{{ data.key }}</h1>
                <p v-if="data.key=='本地历史'" class="text-secondary--38-Of clearHistory" style="padding-bottom:13px" @click.stop="clearHistory"><a>清空本地历史</a></p>

                    <div style="height: 52px; width: 100%;" v-for="(item, index) in data.list" :key="index">
                        <div data-index="0" class="tr-wrapper--RxoAI" style=" height: 52px; width: 100%;" >
                            <div class="padding-element-horizontal--pMTS6" style="width: 32px;"></div>
                            <div class="drop-wrapper--T27s" data-drop-target="false">
                                <div data-is-dragging="false" class="drag-wrapper---smTQ" draggable="true">
                                    <div  class="tr--Ogi-3 tr--97U9T" data-is-selected="false" data-clickable="true" data-has-checkbox="true" style="cursor: pointer;">
                                        <div @click="playInfo(item)" class="checkbox--P-zHa checkbox-container--t0ALJ" role="checkbox"
                                            aria-checked="false" data-checked="false" data-partial="false"
                                            data-disabled="false" data-no-padding="false"><span data-role="icon"
                                                data-render-as="svg" data-icon-type="PDSMore"
                                                class="ant-dropdown-trigger icon--d-ejA ">
                                                <svg t="1676180557921"
                                                    class="icon" viewBox="0 0 1024 1024" version="1.1"
                                                    xmlns="http://www.w3.org/2000/svg" p-id="3478" width="16" height="16">
                                                    <path
                                                        d="M374.6 636.5c4.4 0 8.5-1.2 12.1-3.3l171.7-100c8-3.6 13.6-11.9 13.6-21.5 0-8.8-4.8-16.6-11.9-20.7l-167.8-97.8c-4.3-5-10.7-8.1-17.7-8.1-13.1 0-23.6 10.7-23.6 23.8v1.3l-0.3 0.2 0.4 199.8c-0.1 0.8-0.1 1.6-0.1 2.5 0 13.2 10.6 23.8 23.6 23.8z"
                                                        fill="#4D4D4D" p-id="3479"></path>
                                                    <path d="M64.7 586.3a32.2 32.1 0 1 0 64.4 0 32.2 32.1 0 1 0-64.4 0Z"
                                                    fill="#4D4D4D" p-id="3480"></path>
                                                <path
                                                    d="M960 398.3c0.1-1.6 0.2-3.2 0.2-4.8 0-35-28.5-63.3-63.6-63.3-11.7 0-22.7 3.2-32.2 8.7l-0.5-0.3-31.5 18.2v-64.7c-0.1-73.1-59.9-133-133.1-133H197.4c-73.1 0-133 59.8-133 133v165.8h0.2c0 17.7 14.4 32.1 32.2 32.1s32.2-14.4 32.2-32.1h0.2V287c0-35.2 28.8-64 64-64h510.2c35.2 0 64 28.8 64 64v448.9c0 35.2-28.8 64-64 64H193.3c-35.2 0-64-28.8-64-64v-21.4c0-17.7-14.4-32.1-32.2-32.1-17.8 0-32.2 14.4-32.2 32.1h-0.4v15.3c0 73.2 59.9 133 133 133h501.9c73.2 0 133-59.8 133-133v-64.1l33.1 19.1 0.1-0.1c9.2 5.1 19.8 8 31 8 35.1 0 63.6-28.4 63.6-63.3 0-1.6-0.1-3.2-0.2-4.8V398.3z m-63.6 205.1c-0.3 7.8-6.9 14.1-15 14.1-2.7 0-5.3-0.7-7.5-2l-41.5-23.7V430.1l40.9-23.2c2.3-1.5 5.1-2.3 8.1-2.3 8.3 0 15 6.6 15 14.6v184.2z"
                                                    fill="#4D4D4D" p-id="3481"></path>
                                            </svg></span></div>
                                    <div class="td--SGrZj td---v-kp history_video" compilationid="" data-col-key="name"
                                        style="flex: 1 1 0%; min-width: 160px;" @click="playInfo(item)">
                                        <div class="cover--Mn1Bt file-cover--tJG-H" data-size="XXS"
                                            data-thumbnail="normal">
                                            <div class="is-loaded--otXtL thumbnail-wrapper--aGcWv">
                                                <div class="thumbnail--skb-6 fill-mode-cover--VWUJo size-xxs--oSITU">
                                                    <img alt="video" class="fileicon--38wQG fileicon---webs "
                                                        draggable="false"
                                                        src="https://img.alicdn.com/imgextra/i2/O1CN01H7FCkb1P6mPJxDEFa_!!6000000001792-2-tps-80-80.png">
                                                </div>
                                            </div>
                                        </div>
                                        <p :class="CLASS_NAMES.textPrimary" :title="item.name">{{ item.name }}</p>
                                    </div>
                                    <div compilationid="" 
                                        class="history_video td--SGrZj td---v-kp" data-col-key="updated_at"
                                        style="width: 200px; flex: 0 0 auto;" @click="playInfo(item)">
                                        <p class="text-secondary--kiARj">已观看{{ item.progress }}%</p>
                                    </div>
                                    <div class="td--SGrZj td---v-kp" data-col-key="size"
                                        style="width: 160px; flex: 0 0 auto;">
                                        <p class="text-secondary--kiARj"><a
                                                :href="item.href">{{ item.folderName }}</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="padding-element-horizontal--39l8Q" style="width: 32px;"></div>
                    </div>
      
            </div>
        </div>



    </div>
</div></template>

<style scoped></style>