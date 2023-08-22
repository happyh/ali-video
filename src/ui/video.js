/**
 *  被动加载视频UI，只有当点击视频的时候才会加载，所以不用把该js加载到index.js中
 */
import $ from "jquery";
import { createApp } from 'vue';
import VideoPage from '../page/VideoPage.vue'
import user from '../util/user'
import { ElMessageBox } from 'element-plus'
var interval;

function initVideoPlayer(videoFile) {
    let node = $(".video-previewer--6slx7")


    if (node.length <= 0) {
        if (interval == null) {
            interval = setInterval(function () {
                initVideoPlayer(videoFile);
            }, 200);
        }
        return
    } else {
        clearInterval(interval);
        interval = null;
    }

    let vInfo = user.getVideoPage()

    vInfo.id = videoFile.file_id;
    if (videoFile.user_meta) {
        try {
            let meta = JSON.parse(videoFile.user_meta);
            if (meta.duration) { vInfo.duration = meta.duration; }
            if (meta.play_cursor) { vInfo.play_cursor = meta.play_cursor; }
        } catch (error) {
            console.error(error);
        }
    }
    vInfo.name = videoFile.name;
    vInfo.drive_id = videoFile.drive_id;
    vInfo.thumbnail = videoFile.thumbnail;
    vInfo.folderName = user.getPage().folderName;
    vInfo.type = 0;
    vInfo.href = location.href;
    var app = createApp(VideoPage)

    app.mount(
        (() => {
            const app = $(`<div id="videoPage" class='video-previewer--6slx7'></div>`)[0];
            node.replaceWith(app);
            return app;
        })(),
    );


    $(".header-left--Kobd9").on('click', function () {
        app.unmount();
    })


}

function homeVideo(videoFile) {
    if (interval != null) {
        clearInterval(interval);
    }
    initVideoPlayer(videoFile)

}

function shareVideo(videoFile) {

    let node = $(".video-previewer--1ESTK")

    if (node.length <= 0) {
        if (interval == null) {
            interval = setInterval(function () {
                shareVideo(videoFile);
            }, 200);
        }
        return
    } else {
        clearInterval(interval);
        interval = null;
    }
    let it = user.getPage().items
    let index = it.findIndex(item => {
        return item.file_id == videoFile.file_id
    })
    console.log(index)
    if (index == -1) {
        ElMessageBox.alert('手速太快啦，请回到文件列表中，随便点击排序，看到已加载多少文件时,在进来吧', '操作页面过快', {
            confirmButtonText: '去排序',
            callback: (action) => {
                location.href = location.href
            },
        })
        return
    }
    let v = it[index]
    v.user_meta = "{}";

    let vInfo = user.getVideoPage()
    let list = user.getVideoLookList()

    index = list.findIndex(item => {
        return item.id == videoFile.file_id
    })
    if (index != -1) {


        vInfo.play_cursor = list[index].play_cursor
    }

    vInfo.id = v.file_id;
    vInfo.name = v.name;
    vInfo.thumbnail = v.thumbnail;
    vInfo.type = 1;
    vInfo.folderName = "来自分享";
    vInfo.href = location.href;

    var app = createApp(VideoPage)
    app.mount(
        (() => {
            const app = $(`<div id="videoPage" class='video-previewer--1vo5c'></div>`)[0];
            node.replaceWith(app);
            return app;
        })(),
    );


    $(".header-icon--bJn--").on('click', function () {
        app.unmount();
    })


}


// 视频信息作为参数
export {
    homeVideo,
    shareVideo
}