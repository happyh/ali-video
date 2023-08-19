<script setup>
import $ from "jquery"
import user from '../util/user';
import { reactive,ref } from "vue";
import {  ElButton,ElSwitch,ElInput  } from 'element-plus'
import { showSuccess,showError } from "../ui/util";


const data = reactive({
    isShowAria2Set:false,
    pushBtonText: 'Aria2 推送',
    aria2Model: user.getAria2Set()
})
const errorMsg = ref(false)



function saveAria2() {
    $.ajax({
        type: "POST",
        url: data.aria2Model.link,
        data: JSON.stringify({
            "jsonrpc": "2.0",
            "method": "aria2.getVersion",
            "id": "1",
            "params": [
            "token:"+data.aria2Model.token
            ]
        }),
        crossDomain: true,
        processData: false,
        contentType: "application/json",
        success: function (result) {
            user.setAria2Set(data.aria2Model);
            data.isShowAria2Set = false;
            errorMsg.value=false
            showSuccess("Aria2配置保存成功",null,{
                appendTo:".ant-modal-header"
            })
    
        },
        error: function (error) {
            errorMsg.value=true
            showError("保存失败,连接不上Aria2配置",null,{
                appendTo:"#aria2_set_LuoGen"
            })
        }
    });


}


function aria2Push(fileList,call) {
    if (data.pushBtonText == '正在推送') {
        return
    }
    let folderName = "";
    if (data.aria2Model.dirCreate) {
        let dir = $(".breadcrumb--2FqFQ[data-calc=true] > .breadcrumb-item--tV9dn > .breadcrumb-item-link--M-p4b");
        folderName = "\/阿里云盘";
        for (let i = 0; i < dir.length; i++) {
            folderName += "\/" + dir[i].innerText
        }
    }

    let sendDownLoad = [];

    fileList.forEach(function (item, index) {
        sendDownLoad.push({
            id: "",
            jsonrpc: "2.0",
            method: "aria2.addUri",
            params: [
                "token:" + data.aria2Model.token,
                [item.url],
                {
                    out: item.name,
                    dir: data.aria2Model.path + folderName,
                    referer: "https://www.aliyundrive.com/",
                    "user-agent": navigator.userAgent
                }
            ]
        });
    });


    let text = data.pushBtonText;
    data.pushBtonText = "正在推送"
    $.ajax({
        type: "POST",
        url: data.aria2Model.link,
        data: JSON.stringify(sendDownLoad),
        crossDomain: true,
        processData: false,
        contentType: "application/json",
        success: function (result) {
            showSuccess("Aria2推送成功",null,{
                appendTo:".ant-modal-header"
            })
            data.pushBtonText = text;
            call(true)
        },
        error: function (error) {
            showError("Aria2 推送失败,请检查配置",null,{
                appendTo:".ant-modal-header"
            })
            data.pushBtonText = text;
            call(false)
        }
    });

}

function show(){
    data.isShowAria2Set =true
}

function hide (){
    data.isShowAria2Set = false
}

defineExpose({
    aria2Push,show,hide
});

</script>

<template>
 <div class="ant-modal-root" id="aria2-set-box" v-if="data.isShowAria2Set">
        <div class="ant-modal-mask">
        </div>
        <div tabindex="-1" class="ant-modal-wrap" role="dialog" id="aria2_set_LuoGen">
            <div role="document" class="ant-modal modal-wrapper--2yJKO" style="width: 340px;transform-origin: -14px 195px;">
                <div class="ant-modal-content">
                    <div class="ant-modal-header">
                        <div class="ant-modal-title">
                            Aria2设置
                        </div>
                    </div>
                    <div class="ant-modal-body">
                        <div class="icon-wrapper--3dbbo" id="aria2-set-icon" @click.stop="data.isShowAria2Set = false">
                            <span data-role="icon" data-render-as="svg" data-icon-type="PDSClose"
                                class="close-icon--33bP0 icon--d-ejA ">
                                <svg t="1685717543646" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2490" id="mx_n_1685717543647" width="16" height="16"><path d="M849 896c-12 0-24.1-4.6-33.2-13.8l-674-674c-18.4-18.4-18.4-48.1 0-66.5s48.1-18.4 66.5 0l674 674c18.4 18.4 18.4 48.1 0 66.5A47.03 47.03 0 0 1 849 896z" p-id="2491" fill="#cdcdcd"></path><path d="M175 896c-12 0-24.1-4.6-33.2-13.8-18.4-18.4-18.4-48.1 0-66.5l674-674c18.4-18.4 48.1-18.4 66.5 0s18.4 48.1 0 66.5l-674 674C199 891.4 187 896 175 896z" p-id="2492" fill="#cdcdcd"></path></svg>
                            </span>
                        </div>
                        <div>
                            推送链接：
                        </div>
                        <div class="content-wrapper--1_WJv">
                            <ElInput  id="aria2-link"  v-model="data.aria2Model.link" type="text" />

                        
                        </div>
                        <div>
                            推送路径：
                        </div>
                        <div class="content-wrapper--1_WJv">
                                <ElInput  id="aria2-path"  v-model="data.aria2Model.path" type="text" />
                        </div>
                        <div>
                            RPC密钥：
                        </div>
                        <div class="content-wrapper--1_WJv">
                            <ElInput id="aria2-token"  v-model="data.aria2Model.token" type="text" />
                        </div>
                        <div>
                            其他：
                        </div>
                        不创建对应目录： <el-switch v-model="data.aria2Model.dirCreate" />
                        <p class="notice2" v-if="errorMsg">连接不上的原因：<br/> 1.端口或链接填写错误<br/> 2.密钥错误 <br/>  3.未开启跨域请求<br/>
                        </p>
                        <p class="notice2" v-if="errorMsg">
                            ./aria2c.exe --enable-rpc --rpc-listen-all   --rpc-secret 123 --rpc-allow-origin-all=true<br/>
                            可以在Aria2的程序目录下,使用上面命令,RPC密钥为:123
                        </p>
                    </div>
                    <div class="ant-modal-footer">
                        <div class="footer--3Q0je">
                            <ElButton id="aria2-set-save" type="primary" 
                                @click.stop="saveAria2">
                                检测 & 确定
                            </ElButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.icon-wrapper--3dbbo {
    height: 28px;
    width: 28px;
    display: -ms-flexbox;
    display: flex;
    border-radius: 5px;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: center;
    justify-content: center;
    color: var(--context_secondary);
    position: absolute;
    top: 18px;
    right: 16px;
    -webkit-transition: all .3s ease;
    -o-transition: all .3s ease;
    transition: all .3s ease;
    cursor: pointer;
    z-index: 10;
}
.notice2 {
    margin: 2px 0 0;
    color: red;
    font-size: 8pt;
}


.close-icon--33bP0 {
    font-size: 18px;
}

.icon--d-ejA {
    display: -ms-inline-flexbox;
    display: inline-flex;
    -ms-flex-pack: center;
    justify-content: center;
    -ms-flex-align: center;
    align-items: center;
    text-align: center;
}

.content-wrapper--1_WJv {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    -ms-flex-align: center;
    align-items: center;
}
</style>