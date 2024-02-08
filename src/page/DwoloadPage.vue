<script setup>
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { monkeyWindow } from '$';
import user from '../util/user';
import { getDownloadUrl, shareLinkDownloadUrl,videoPreviewPlayInfo } from '../api/aliyun'
import { ElLink, ElButton, ElResult } from 'element-plus'
import {
    Refresh
} from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import Aria2Set from '../components/Aria2Set.vue';
import { showError } from "../ui/util";
import $ from "jquery"
import { CLASS_NAMES } from '../ui/style'


let list = user.selectedFileList();
if (list.length == 0) {
    list = user.getAllFileList();
}
list= list.filter(function(item) {
  return item.type === 'folder' || item.type === 'file' ;
});
console.log(list)

const fileList = reactive(list)
const aria2SetRef = ref()
const data = reactive({
    pushBtonText: 'Aria2 推送'
})
const home = ref(user.home())
const resource = ref(user.resource())
const laterLoad = ref(getCount() != 0 && list == 0)


function getCount() {

    let text = $('.left-wrapper--zzDY4').text()
    if (!text) {
        return 0
    }
    var reg = /\d+/g;
    var num = text.match(reg);
    if (num.length == 0) {
        return 0
    }
    return num[0]
}


function group(array, subGroupLength) {
    var index = 0;
    var newArray = [];

    while (index < array.length) {
        newArray.push(array.slice(index, index += subGroupLength));
    }

    return newArray;
}



function updateHref(id) {
    var $a = $(`a[data-id="${id}"]`);
    var title = $a.attr('title');
    $a.attr("href", title)
}

var shareToken;
const shareTokenV = reactive(user.getShareToken());
onMounted(async () => {




    if (!user.home()) {
        shareToken = user.getShareToken();
        if (!user.isExpires(shareToken)) {
            showError("当前页面已过期，请刷新重试")
            return
        }

    }



    var groupedCountries = group(fileList, 1);

    for (const index in groupedCountries) {
        await loadingUrl(groupedCountries[index]);

    }


    function loadingUrl(array) {
        return new Promise((resolve, reject) => {
            let length = array.length;
            let initLength = 0;
            array.forEach(item => {
                if (item.type == 'file') {

                    getFileUrl(item, function () {
                        initLength += 1;
                        if (initLength == length) {
                            resolve()
                        }
                    });
                } else {
                    initLength += 1;
                    if (initLength == length) {
                        resolve()
                    }
                }
            })
        })
    }

})

function showSet() {
    aria2SetRef.value.show()
}


function IDMPush() {
    var protocol = window.location.protocol; 
    var host = window.location.host;
    var fullHost = protocol + '//' + host+"/";
    var content = "", referer = fullHost, userAgent = navigator.userAgent;
    fileList.forEach(function (item, index) {
        if (item.url != '' && item.url != null) {
            content += ["<", item.url, "referer: " + referer, "User-Agent: " + userAgent, ">"].join("\r\n") + "\r\n";
        }

    });

    downloadLink(content,"IDM导出文件_阿里云盘.ef2")
}


function aria2Push() {
    if (data.pushBtonText == '正在推送') {
        return
    }
    var text = data.pushBtonText;
    data.pushBtonText = "正在推送"
    aria2SetRef.value.aria2Push(fileList, (res) => {
        if(res==false){
            data.pushBtonText = '推送失败'
        }else{
            data.pushBtonText = text;

        }
    })

}


function bitComet(item) {

    if (!item || !item.name) {
        throw new Error('Item or item.name is not defined');
    }

    const params = `AA/${encodeURIComponent(item.name)}/?url=${encodeURIComponent(item.download_url || item.url)}&refer=${encodeURIComponent(location.protocol + "//" + location.host + "/")}ZZ`;

    const base64Params = btoa(params);

    let url = `bc://http/${base64Params}`

    navigator.clipboard.writeText(url)
    createLink(url);
}

function m3u(item){
    item.loading = true
    videoPreviewPlayInfo({
            category: 'live_transcoding',
            drive_id: item.drive_id,
            file_id: item.file_id,
            template_id: "FHD|HD|SD|LD",
            url_expire_sec: 14400,
            get_subtitle_info: !0
        }).then(res => {
            const task = res.data?.video_preview_play_info?.live_transcoding_task_list?.filter(task => task.url)
            .pop();
            if(task == null){
                showError("获取视频链接失败，请重新获取")
                return
            }
         
            const escapedTitle = item.name.replace(/,/g, '\\,');
            let referrer = location.protocol + "//" + location.host + "/";
            const escapedUrl = task.url.replace(/,/g, '\\,');
            const m3uContent = [
            '#EXTM3U',
            `#EXTVLCOPT:http-referrer=${referrer}`,
            `#EXTINF:-1, ${escapedTitle}`,
            escapedUrl
            ].join('\n');

            let name = item.name.substring(0,item.name.lastIndexOf("."+item.file_extension))
            downloadLink(m3uContent,`${name || '视频文件'}.m3u`)
        }).finally(()=>{
            item.loading = false
        });
   
}

function downloadLink (text, name) {
    var a = document.createElement("a");
    var blob = new Blob([text]);
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
}

function createLink(url){

    const a = document.createElement('a');

    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function getFileUrl(item, call) {
    item.loading = true;
    item.text = "正在获取下载地址中"

    let showDnload;

    if (item.share_id) {
        showDnload = shareLinkDownloadUrl({
            file_id: item.file_id,
            share_id: item.share_id
        }, shareToken.share_token).then((response) => {
            item.error = false;
            item.text = response.data.download_url
            item.url = response.data.download_url
      
        })
    } else {
        showDnload = getDownloadUrl({
            expire_sec: 14400,
            drive_id: item.drive_id,
            file_id: item.file_id
        }).then((response) => {
            item.error = false;
            if(response.data.url){
                item.text = response.data.url
                item.url = response.data.url
            }else{
                item.text =item.url;
            }

        })
 
    }

    showDnload.catch((e) => {
        if (e && e + '' == 'AxiosError: Request failed with status code 429') {
            item.error = true;
            item.text = "接口请求频繁，请稍后点击文件旁边的刷新按钮，重新获取 (也可点击我尝试跳转下载)"
        } else {
            item.text = "刷新失败，错误异常:" + e
        }
    }).finally(() => {
        item.loading = false
        call && call()
    })
}


onUnmounted(() => {
    console.log("文件下载窗口关闭")
})


</script>

<template>
    <Aria2Set ref="aria2SetRef" />

    <div v-if="laterLoad">

        <el-result icon="error" title="获取文件失败" sub-title="请回到文件列表中，随便点击排序，看到已加载多少文件时，在回到这里吧">
        </el-result>
    </div>

    <div v-if="!laterLoad">
        <div v-if="fileList.length > 0">
            <p class="notice2">注意： 如果大批量获取下载地址，会被官网限速！</p>
            <p class="notice1">1. 因阿里云盘接口限制,短期大量请求会出现接口请求频繁,可以先选择需要下载的文件，在点击显示链接按钮。 </p>
            <p class="notice1">2. 接口请求频繁,也可尝试点击下载,不过文件名需要重新命名 </p>
            <p class="notice1">3. 在点击刷新按钮时,不要连续点击,可等几秒在点一次尝试获取 </p>
        </div>

        <p class="notice"> 共加载了{{ fileList.length }}个文件</p>
        <div class="item-list" style="padding: 20px; height: 410px; overflow-y: auto;">
            <div v-for="(item, index) in fileList" :key="index">
                <p v-if="item.type == 'folder'" :class="CLASS_NAMES.textPrimary">{{ index + 1 }}. {{ item.name }}</p>
                <p v-if="item.type == 'file'" :class="CLASS_NAMES.textPrimary">{{ index + 1 }}. {{ item.name }}
                    <el-button type="primary" :icon="Refresh" :loading="item.loading" circle size="small"
                        @click.stop="getFileUrl(item)" />
                    <el-link type="primary" style="margin-left: 10px;" :loading="item.loading" 
                       @click.stop="bitComet(item)" >BitComet</el-link>
                    <el-link type="primary" v-if="home && item.mime_type.indexOf('video')!=-1" style="margin-left: 10px;" :loading="item.loading" 
                       @click.stop="m3u(item)" >M3U</el-link>
                </p>
                <p style="margin:10px 0px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">
                    <el-link v-if="item.type == 'folder'" type="primary"
                        :href="resource ? '/drive/file/resource/' + item.file_id : 
                        home ? '/drive/file/backup/' + item.file_id : '/s/' + shareTokenV.share_id + '/folder/' + item.file_id">
                        <p :class="CLASS_NAMES.textPrimary">
                        点击进入文件夹</p></el-link>

                    <el-link @mousedown="updateHref(item.file_id)" @mouseup="updateHref(item.file_id)"
                        v-if="item.type == 'file' && !item.error" :data-id="item.file_id" type="primary" :title='item.url'
                        :href="item.url" ><p :class="CLASS_NAMES.textPrimary">{{
                            item.text
                        }}</p></el-link>

                    <el-link v-if="item.type == 'file' && item.error" type="danger" :href="item.url">{{
                        item.text
                    }}</el-link>


                </p>
            </div>
        </div>
        <div>
            <div class="footer">
                <div>
                    <ElButton type="primary"
                        @click.stop="monkeyWindow.open('https://github.com/wyndem/ali-video', '_blank')">❤️
                        开源地址</ElButton>

                    <ElButton type="primary"
                        @click.stop="monkeyWindow.open('https://greasyfork.org/zh-CN/scripts/458626', '_blank')">👍
                        点个赞</ElButton>

                    <ElButton type="primary" @click.stop="IDMPush">IDM 导出文件</ElButton>

                    <ElButton type="primary" @click.stop="aria2Push">{{ data.pushBtonText }}</ElButton>
                    <ElButton type="primary" style="margin-left: 10px;width: auto;border: 0 solid transparent;"
                        class="aria2-set" @click.stop="showSet" circle>⚙️</ElButton>
                </div>
            </div>
        </div>

    </div>
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

