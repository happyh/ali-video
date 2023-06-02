<script setup>

import { search } from '../api/aliyun'
import { ref, onMounted } from "vue";
import { ElMessageBox, ElInput, ElButton } from 'element-plus'
import { showError } from "../ui/util";
import user from '../util/user'

const emit = defineEmits(['selectSubTitle'])
const data = ref([])
const path = ref([])
const url = ref()


onMounted(() => {
    getFileList("root", "全部文件");

})

/** 选择了该文件 */
function selectFile(fileInfo) {
    ElMessageBox.confirm(
        `确认加载《${fileInfo.name}》字幕文件吗？`,
        '字幕选择',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
        }
    ).then(() => {
        emit("selectSubTitle", fileInfo)
    })
}

function getFileList(parent_file_id, name) {

    if (path.value.length != 0) {
        let last = path.value[path.value.length - 1]
        if (last.id == parent_file_id) {
            return
        }


        let index = path.value.findIndex((item, index) => {
            return item.id === parent_file_id
        })

        if (index != -1) {
            path.value = path.value.splice(0, index);
        }
    }

    path.value.push({
        id: parent_file_id,
        name: name
    })

    let token = user.getToken();
    if (token == '' || token == null) {
        showError("登录凭证失效，请重新登录重试")
        return;
    }

    if (token.default_drive_id == null || token.default_drive_id == '') {
        showError("设备id为空,请刷新重试")
        console.log(token.default_drive_id)
        return;
    }



    search({
        "drive_id": token.default_drive_id,
        "query": `parent_file_id = \"${parent_file_id}\" and (type = \"folder\" or file_extension in [\"srt\", \"ass\", \"vtt\"])`,
        "order_by": "type ASC,updated_at DESC",
        "limit": 20,
        "image_thumbnail_process": "image/resize,w_256/format,jpeg",
        "image_url_process": "image/resize,w_1920/format,jpeg/interlace,1",
        "video_thumbnail_process": "video/snapshot,t_1000,f_jpg,ar_auto,w_256"
    }).then(res => {
        data.value.length = 0
        data.value = res.data.items


        if (parent_file_id == 'root') {
            url.value = 'https://www.aliyundrive.com/drive'
        } else {
            url.value = 'https://www.aliyundrive.com/drive/folder/' + parent_file_id
        }

    }).catch(e => {

        console.log(e)
        if (e && e + '' == 'AxiosError: Request failed with status code 429') {
            showError('您操作的太快了! 请稍候点击下方按钮，刷新尝试')
        } else {
            showError(e + '')
        }

        path.value.pop()

    })
}

function toUrlFile() {

    var link = url.value;
    if (link == 'https://www.aliyundrive.com/drive') {
        showError("如需跳首页，请点下方全部文件")
        return;
    }

    var regex = /folder\/(.+?)(?:\/|\?|$)/;
    var match = link.match(regex);
    if (match) {
        var value = match[1];
        getFileList(value, "搜索结果");

    } else {
        showError("错误的链接")
    }


}

function toCurrentPage() {
    url.value = location.href
    toUrlFile()
}


defineExpose({
    getFileList
});

</script>

<template>
    <div>

        <div style="margin-top: -20px; ">
            <p class="notice1">页面链接就是先去找到字幕位置，然后再把当前页面的链接拷贝复制到下面输入框中，再点击跳转即可</p>
        </div>

        <div style="margin-bottom: 20px;">
            <ElInput v-model="url" placeholder="Please input">
                <template #prepend>链接</template>
                <template #append>
                    <ElButton type="primary" @click="toUrlFile">跳转</ElButton>
                </template>
            </ElInput>
        </div>
        <ElButton type="primary" link @click="toCurrentPage">跳转到当前页面</ElButton>


        <div class="bread-container--npII5">
            <div class="breadcrumb-wrap--2iqqe" data-align="left">
                <div class="breadcrumb--2FqFQ" data-calc="true">
                    <div v-for="(item, index) in path" :key="index" class="breadcrumb-item--tV9dn" :data-label="item.name"
                        @click.stop="getFileList(item.id, item.name)" :data-key="item.id" data-hide="false"
                        data-more="false">
                        <div class="breadcrumb-item-link--M-p4b" data-spm-anchor-id="0.0.0.i5.54a06c75zaT9h6">{{ item.name
                        }}</div>
                        <div class="breadcrumb-item-separator--r1w8a">›</div>
                    </div>

                </div>

            </div>
        </div>


        <div class="list--13IBL" v-if="data.length == 0">
            <div class="placeholder---npkN">
                <img src="https://img.alicdn.com/imgextra/i2/O1CN018yXBXY1caApf7qUew_!!6000000003616-2-tps-224-224.png"
                    alt="empty folder">
                <span>文件夹为空</span>
            </div>
        </div>


        <div v-for="(item, index) in data" :key="index">
            <div v-if="item.type == 'folder'" class="item--18Z6t" @click.stop="getFileList(item.file_id, item.name)">
                <img alt="folder" class="file-icon--3CoKG fileicon--vNn4M" draggable="false"
                    src="https://img.alicdn.com/imgextra/i1/O1CN01rGJZac1Zn37NL70IT_!!6000000003238-2-tps-230-180.png">
                <span>{{ item.name }}</span>
            </div>

            <div v-if="item.type == 'file'" class="item--18Z6t" :title="item.name" @click.stop="selectFile(item)">
                <img alt="others" class="file-icon--3CoKG fileicon--vNn4M " draggable="false"
                    src="https://img.alicdn.com/imgextra/i2/O1CN01ROG7du1aV18hZukHC_!!6000000003334-2-tps-140-140.png">
                <span>{{ item.name }}</span>
            </div>


        </div>


    </div>
</template>

<style scoped>
.notice1 {
    margin: 2px 0 0;
    color: #E6A23C;
    font-size: 8pt;
}

.breadcrumb-item--tV9dn {
    font-size: 12px;
}
</style>