<script setup>
import { ref, onMounted, onUnmounted, reactive, h } from "vue";
import Hls from 'hls.js/dist/hls.min'
import Artplayer from "artplayer";
import user from '../util/user'
import { artplayPluginQuality, selector, subtitle, hotkeyEven, artSet } from '../plugins/index'
import { videoPreviewPlayInfo, shareVideoInfo } from '../api/aliyun'
import { ElResult, ElButton, ElDrawer, ElNotification, ElMessageBox, ElColorPicker } from 'element-plus'
import SubTitle from '../components/SubTitle.vue';
import $ from "jquery"
import indicator from '../assets/indicator.svg';
import state from '../assets/state.svg';
import Selector from '../components/Selector.vue'




const artRef = ref()
const subtitleRef = ref()
const selectorRef = ref()
const color = ref('#fff')

const table = ref(false)
const showSelector = ref(false)
const retry = reactive({
    error: false,
    text: "",
    title: "",
    loading: false
})

const transcoding = {
    UHD: '4K 超清',
    QHD: '2K 超清',
    FHD: '1080 全高清',
    HD: '720 高清',
    SD: '540 标清',
    LD: '360 流畅'
}


var options = {}
// 重试3次
var retries = 3;

let instance;



onMounted(() => {
    getVideoInfo(artp)
})


/** 清晰度设置 */
function getOption(video) {

    let vInfo = user.getVideoPage();
    let yh = vInfo.name && getExt(vInfo.name) == 'mp4'

    //视频信息
    let play_info = video.video_preview_play_info
    //清晰度
    let task_list = play_info.live_transcoding_task_list
    var option = [];

    if (yh) {
        option.push({
            html: ' 原画',
            url: ''
        })
    }

    task_list.forEach(function (item, index) {

        let name = transcoding[item.template_id]
        if (!name) {
            return
        }
        if (item.url != '') {
            option.push({
                html: name,
                url: item.url || item.preview_url
            })
        }

    })



    return option;

}

function nextVideo(item) {
    showSelector.value = false;
    if (item.file) {
        item = item.file;
    }
    instance.destroy(false)
    let vInfo = user.getVideoPage();

    vInfo.id = item.file_id;
    if (!item.user_meta) {
        item.user_meta = "{}"
    }
    let meta = JSON.parse(item.user_meta);
    vInfo.duration = meta.duration;
    vInfo.play_cursor = meta.play_cursor;
    vInfo.name = item.name;
    vInfo.thumbnail = item.thumbnail;

    getVideoInfo(artp)
}

//视频加载后
function artp(video) {
    var option = getOption(video);
    var plset = user.getVideoPlayerSet()
    color.value = plset.subtitleColor || '#FFF';
    instance = new Artplayer({
        container: artRef.value,
        settings: [
            {
                html: '画中画',
                icon: '<i class="art-icon art-icon-pip"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" height="32" width="32"><path d="M25 17h-8v6h8v-6Zm4 8V10.98C29 9.88 28.1 9 27 9H9c-1.1 0-2 .88-2 1.98V25c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2Zm-2 .02H9V10.97h18v14.05Z"></path></svg></i>',
                switch: false,
                tooltip: 'Close',
                onSwitch: function (item, $dom, event) {
                    console.info(item, $dom, event);
                    const nextState = !item.switch;
                    instance.pip = nextState;
                    item.tooltip = nextState ? 'Open' : 'Close';
                    return nextState;
                },
            },
            {
                html: '字幕设置',
                selector: [
                    {
                        html: '字体大小',
                        range: [(plset.subtitleSize || 20), 10, 45, 5],
                        tooltip: (plset.subtitleSize || 20) + 'px',
                        onChange: function (item, $dom, event) {
                            $('.art-subtitle').css("font-size", item.range + "px");
                            instance.subtitleSize = item.range;
                            return item.range + 'px';
                        },
                    },
                    {
                        html: '上下移动',
                        range: [(plset.subtitleMargin || 0), 0, 150, 10],
                        tooltip: (plset.subtitleMargin || 0) + 'px',
                        onChange: function (item, $dom, event) {
                            $('.art-subtitle').css("margin-bottom", item.range + "px");
                            instance.subtitleMargin = item.range;
                            return item.range + 'px';
                        },
                    },
                    {
                        html: '偏移',
                        tooltip: (plset.subtitleOffset || 0) + 's',
                        range: [(plset.subtitleOffset || 0), -5, 5, 0.1],
                        onChange(item) {
                            instance.subtitleOffset = item.range;
                            return item.range + 's';
                        },
                    },
                    {
                        html: `<div style="display:flex;justify-content:center; align-items:center ">颜色<div style='background-color:${color.value};width:15px;height:15px;' /></div>`,
                        switch: false,
                        onSwitch: function (item, $dom, event) {
                            var subtitle = $('.art-subtitle')
                            ElMessageBox({
                                title: '颜色面板',
                                message: () => h('p', null, [
                                    h('span', null, '请选择颜色'),
                                    h(ElColorPicker, {
                                        model: color,
                                        modelValue: color.value,
                                        'onUpdate:modelValue': (val) => {
                                            color.value = val
                                        },
                                    }),
                                ]),
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                closeOnClickModal: false,
                            }).then(() => {
                                subtitle.css("color", color.value);
                                item.html = `<div style="display:flex;justify-content:center; align-items:center ">颜色<div style='background-color:${color.value};width:15px;height:15px;' /></div>`;
                                item.switch = true;
                                instance.subtitleColor = color.value;
                            }).catch(() => {

                            })
                            return false;
                        },
                    }
                ]
            }
        ],
        plugins: [
            // 清晰度
            artplayPluginQuality(option),
            // 上下集
            selector(function (item) {
                if (item == null) {
                    instance.pause()
                    showSelector.value = true;
                    return
                }
                nextVideo(item)
            }),
            //快捷键
            hotkeyEven(),
            // 字幕插件
            subtitle(openSubTitle),
            // 偏好设置
            artSet()
        ],
        ...options
    });
    instance.on('error', function (e) {
        console.log(e)
    })

    instance.on('ready', () => {
        let subtitle = video && video.video_preview_play_info && video.video_preview_play_info.live_transcoding_subtitle_task_list

        if (subtitle != null && subtitle.length > 0) {
            let subtitleType = getExt(subtitle[0].url);
            instance.subtitle.switch(subtitle[0].url, {
                type: subtitleType.length > 3 ? 'srt' : subtitleType
            })
        }



        instance.play();
    });

    instance.on('destroy', () => {

        console.info('destroy');
    });


}


function getExt(url) {
    if (url.includes('?')) {
        return getExt(url.split('?')[0]);
    }

    if (url.includes('#')) {
        return getExt(url.split('#')[0]);
    }

    return url.trim().toLowerCase().split('.').pop();
}


function selectSubTitle(fileInfo) {
    console.log(fileInfo.url)
    table.value = false
    instance.subtitle.switch(fileInfo.url, {
        type: getExt(fileInfo.name)
    })
    instance.play()
}

// 打开字幕
function openSubTitle() {
    instance.pause()
    table.value = true
}

// 重试按钮
function retryClick() {
    retries = 3;
    retry.loading = true;
    getVideoInfo(artp)
}


var hlsErrorHandler = function (event, data, art) {
    if (art.hls.error == -1) {
        console.log("在处理了")
        return
    }
    var errorType = data.type;
    var errorDetails = data.details;
    var errorFatal = data.fatal;


    console.log(errorType)
    console.log(errorDetails)
    console.log(errorFatal)
    if (art.hls.error) {
        art.hls.error += 1;
    } else {
        art.hls.error = 1
    }
    if (data.details == 'fragLoadError' && (errorFatal || art.hls.error >= 4)) {
        art.hls.error = -1;
        retry403(art)

    } else if (errorType == 'networkError' && errorFatal) {
        ElNotification({
            title: '网络错误',
            message: '请检查网络配置后，刷新页面',
            type: 'error',
        })
    }


}

function m3u8Hls(video, url, art) {
    if(art.qualityHtml == ' 原画'){
        video.src = url ;
        return;
    }

    art.hls = new Hls();
    art.hls.loadSource(url);

    art.hls.attachMedia(video);

    video.addEventListener('loadstart', function (e) {
        console.log('提示视频的元数据已加载' + video.src)
        if (art.hlsCurrentTime403) {
            video.currentTime = art.hlsCurrentTime403
        }
    })

    art.hls.on(Hls.Events.ERROR, function (e, d) {
        hlsErrorHandler(e, d, art)
    })

}



/** 处理分享视频的403 */
function retry403(art) {


    getVideoInfo(function (data) {
        let option = getOption(data);
        let index = option.findIndex(function (item, index) {
            return item.html === art.qualityHtml
        })
        if (index == -1) {
            index = option.length - 1
        }
        let item = option[index];
        item['default'] = true;

        art.quality_.selector = option
        art.hlsCurrentTime403 = art.currentTime;
        art.hls.destroy()
        art.hls.error = 0;
        art.hls = new Hls()
        art.hls.loadSource(item.url);
        art.hls.attachMedia(art.video);
        art.hls.on(Hls.Events.ERROR, function (e, d) {
            hlsErrorHandler(e, d, art)
        })
    })

}

function showSelectorOpen() {
    selectorRef.value.loadingList(instance.videoList)
}

function closeSelector() {
    instance.play()
}


function getVideoInfo(call) {
    let token = user.getToken()
    if (token == null) {
        ElMessageBox.alert('当前登录凭证获取为空，请刷新或重新登录', {
            confirmButtonText: '获取凭证失败',
            callback: (action) => {
                location.href = location.href
            },
        })
        return;
    }

    let videoInfo = user.getVideoPage();

    let req;
    if (videoInfo.type == 0) {
        req = videoPreviewPlayInfo({
            category: 'live_transcoding',
            drive_id: token.default_drive_id,
            file_id: videoInfo.id,
            template_id: "FHD|HD|SD|LD",
            url_expire_sec: 14400,
            get_subtitle_info: !0
        })
    } else if (videoInfo.type == 1) {
        let shareToken = user.getShareToken();
        if (!user.isExpires(shareToken)) {
            ElMessageBox.alert('很抱歉，当前页面太久没活动了，请点击刷新后再来观看吧', "分享凭证失效", {
                confirmButtonText: '刷新',
                callback: (action) => {
                    location.href = location.href
                },
            })
        }
        req = shareVideoInfo(videoInfo.id, shareToken.share_id, shareToken.share_token)

    }
    req.then(res => {
        retry.error = false;
        Artplayer.ASPECT_RATIO = ['default', '1:1', '2:1', '4:3', '16:9','21:9'];

        options = {
            id: videoInfo.id,
            poster: videoInfo.thumbnail,
            title: videoInfo.name,
            type: 'm3u8',
            customType: {
                m3u8: m3u8Hls,
            },
            flip: true,
            setting: true,
            playbackRate: true,
            aspectRatio: true,
            fullscreen: true,
            fullscreenWeb: true,
            miniProgressBar: true,
            autoplay: true,
            screenshot: true,
            hotkey: false,
            airplay: true,
            theme: '#23ade5',
            volume: 1.0,
            contextmenu: [],
            icons: {
                state: `<img width="150" heigth="150" src="${state}">`,
                indicator: `<img width="16" heigth="16" src="${indicator}">`,
            },
        }
        if (videoInfo.type == 0) {
            $('.text--2KGvI').text(videoInfo.name)
        } else if (videoInfo.type == 1) {
            $('.header-file-name--CN_fq').text(videoInfo.name)
        }
        call && call(res.data)
    }).catch(e => {
        if (instance) {
            instance.pause();
            instance.destroy(false)
        }
        console.log(e)
        if(retries != 0 ){
            retries = retries -1; 
            getVideoInfo(call)   
        }

        if (e && e + '' == 'AxiosError: Request failed with status code 429') {
            retry.text = '请稍候点击下方按钮，刷新尝试'
            retry.title = '您操作的太快了'
        }else {
            retry.title = '接口问题'
            retry.text = e + '';
        }
        retry.error = true;
    }).finally(() => {
        retry.loading = false;
    });
}





onUnmounted(() => {
    if (instance) {
        instance.destroy(false)

    }
    console.log("视频页面销毁")
})

</script>

<template>
    <el-drawer v-model="table" title="请选择字幕文件" direction="rtl" size="25%">
        <SubTitle @select-sub-title="selectSubTitle" ref="subtitleRef" />
    </el-drawer>

    <el-drawer v-model="showSelector" title="选集" direction="rtl" size="20%" @open="showSelectorOpen" @close="closeSelector">
        <Selector :videoList="videoList" ref="selectorRef" @next="nextVideo" />
    </el-drawer>
    <!-- <ElColorPicker v-model="color"></ElColorPicker> -->

    <div v-show="!retry.error" class="player" ref="artRef"></div>


    <el-result v-show="retry.error" :title="retry.title" :sub-title="retry.text">
        <template #extra>
            <el-button type="primary" :loading="retry.loading" @click.stop="retryClick">刷新</el-button>
        </template>
    </el-result>
</template>

<style scoped>
.player {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}
</style>