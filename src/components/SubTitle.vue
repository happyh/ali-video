<script setup>

import { search } from '../api/aliyun'
import { ref, onMounted } from "vue";
import { ElMessageBox, ElInput, ElButton,ElCard,ElEmpty,ElLoading } from 'element-plus'
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
    let loadingInstance =  ElLoading.service({
        target: "#_fileList",
        text:"加载中"
    });
    try{
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
                    url.value = 'https://www.aliyundrive.com/drive/file/backup'
                } else {
                    url.value = 'https://www.aliyundrive.com/drive/file/backup/' + parent_file_id
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

    }finally{

        loadingInstance.close()
    }
    
}

function toUrlFile() {

    var link = url.value;
    if (link == 'https://www.aliyundrive.com/drive') {
        showError("如需跳首页，请点下方全部文件")
        return;
    }

    var regex = /backup\/(.+?)(?:\/|\?|$)/;
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


        <div class="bread-container--xuGOj">
            <div class="breadcrumb-wrap--Uq5Lb" data-align="left">
                <div class="breadcrumb--gnRPG" data-calc="true">
                    <div v-for="(item, index) in path" :key="index" class="breadcrumb-item--j8J5H" :data-label="item.name"
                        @click.stop="getFileList(item.id, item.name)" :data-key="item.id" data-hide="false"
                        data-more="false">
                        <div class="breadcrumb-item-link--9zcQY" data-spm-anchor-id="0.0.0.i5.54a06c75zaT9h6">{{ item.name
                        }}</div>
                        <div class="breadcrumb-item-separator--MnbFV">›</div>
                    </div>

                </div>

            </div>
        </div>


        <div v-if="data.length == 0">
            <ElEmpty description="文件夹为空" />
        </div>

        <div id="_fileList">

            <div v-for="(item, index) in data" :key="index" style="margin-top: 4px;">
            

            <ElCard  :body-style="{ 'padding': '5px', 'margin': '0px'}"   v-if="item.type == 'folder'" shadow="hover" @click.stop="getFileList(item.file_id, item.name)">
                <div class="td--SGrZj td---v-kp" data-col-key="name" style="flex: 1 1 0%; min-width: 160px;">
                    <div class="cover--Mn1Bt folder-cover--ExDmp" data-size="XXS">
                        <img alt="folder" class="fileicon--Ob-Oj fileicon---webs " draggable="false" src="https://img.alicdn.com/imgextra/i3/O1CN01qSxjg71RMTCxOfTdi_!!6000000002097-2-tps-80-80.png">
                    </div>
                    <p :title="item.name">{{ item.name }}</p>
                 </div>
            </ElCard>

            <ElCard  :body-style="{ 'padding': '5px', 'margin': '0px'}"   v-if="item.type == 'file'" shadow="hover" @click.stop="selectFile(item)">
                <div class="td--SGrZj td---v-kp" data-col-key="name" style="flex: 1 1 0%; min-width: 160px;">
                    <div class="cover--Mn1Bt folder-cover--ExDmp" data-size="XXS">
                        <img alt="others" class="fileicon--Ob-Oj fileicon---webs" draggable="false"
                    src="https://img.alicdn.com/imgextra/i2/O1CN01ROG7du1aV18hZukHC_!!6000000003334-2-tps-140-140.png" />              
                      </div>
                    <p  :title="item.name">{{ item.name }}</p>
                 </div>
            </ElCard>

        


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

.td--SGrZj {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    height: 52px;
    position: relative;
}

.td---v-kp {
    position: relative;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    padding: 0 24px;
}

.cover--Mn1Bt {
    margin-right: 20px;
}

.folder-cover--ExDmp {
    position: relative;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: center;
    justify-content: center;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    -ms-flex-positive: 0;
    flex-grow: 0;
}

.folder-cover--ExDmp[data-size=XXS] {
    width: 28px;
    height: 28px;
}

.folder-cover--ExDmp[data-size=XXS] .fileicon--Ob-Oj {
    width: 28px;
    height: 28px;
}
.fileicon---webs {
    max-width: 100%;
    max-height: 100%;
}

.breadcrumb-wrap--Uq5Lb {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    font-size: 16px;
    line-height: 1.4;
    width: 100%;
    overflow: hidden;
    position: relative;
}

.breadcrumb-wrap--Uq5Lb[data-align=left] {
    -ms-flex-pack: start;
    justify-content: flex-start;
}

.breadcrumb-wrap--Uq5Lb .breadcrumb--gnRPG {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    min-width: 24px;
}
.breadcrumb-item--j8J5H {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    white-space: nowrap;
    color: var(--context_tertiary);
    cursor: pointer;
}

.breadcrumb-item--j8J5H:first-child .breadcrumb-item-link--9zcQY {
    font-weight: 500;
}
.breadcrumb-item--j8J5H .breadcrumb-item-link--9zcQY {
    font-weight: 400;
    line-height: 1.4;
    -webkit-transition: all .3s ease;
    -o-transition: all .3s ease;
    transition: all .3s ease;
}

.breadcrumb-item--j8J5H .breadcrumb-item-separator--MnbFV {
    line-height: 1.4;
    margin: 0 8px;
}

</style>