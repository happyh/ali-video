<script setup>
import { ref, onMounted,computed } from "vue";
import user from '../util/user';
import { ElSwitch, ElForm, ElFormItem } from 'element-plus'
import { signInList, signInReward } from "../api/aliyun"
import { showSuccess, showError } from "../ui/util";

const signInSwitch = ref(false)
const signInSet= ref({

    goods_info:{
        name:"",
        description:"",
        notice:""
    }
})

const isSigIn = computed(() => {
      // 在这里编写计算属性的逻辑
      return isSignIn();
    });



/** 签到 */
async function signIn() {

    const data =await signInList();


    if (data.status !== 200) {
        showError("签到失败，服务器响应：" + data.status)
        return
    }
    let signin_count = data.data['result']['signInCount']; // 获取签到次数
    console.log(signin_count)

    var reward = await signInReward(signin_count);
    if (data.status !== 200) {
        showError("领取奖励失败，服务器响应：" + reward.status)
        return
    }
    const res = reward.data;
    let rewardName = res["result"]["name"];
    let rewardDescription = res["result"]["description"]; 
    let rewardNotice= res["result"]["notice"];

    signInSet.value['last_siginIn'] = getNowDate();
    signInSet.value['goods_info'] = {
        name: rewardName,
        description: rewardDescription,
        notice: rewardNotice
    }
    showSuccess(rewardNotice)
    user.setSignInSet(signInSet.value)
}


const  changeEvent  = () => {
    signInSet.value['status'] =  signInSwitch.value

    if(!isSignIn()  &&  signInSwitch.value) {
        signIn()
    }

    user.setSignInSet(signInSet.value)
}

function getNowDate() {

    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();
    return year + '' + month + '' + day;
}


/**
 *  已签到 true
 *  末签到 false
 */
function isSignIn(){
    const now =  getNowDate();
    return signInSet.value['last_siginIn'] == now
}

onMounted(async () => {
    let _signInSet = user.getSignInSet()
    if(Object.keys(_signInSet).length > 0){
        signInSet.value=_signInSet;
    }

    signInSwitch.value = _signInSet['status'] == true;
 
    if(!isSignIn()  &&  signInSwitch.value) {
        signIn()
    }

})


</script>

<template>
    <p>
        <span  v-if="isSigIn" class="notice">今日：已签到</span> <br />
        <span  v-if="!isSigIn" class="notice2">今日：末签到</span>
        <p     v-if="isSigIn"  class="notice">
    
             {{ signInSet.goods_info.name }}<br />
             {{ signInSet.goods_info.description }}<br />
        </p>
        
    </p>
    <el-form style="max-width: 100%">
        <el-form-item label="自动签到">
            <el-switch v-model="signInSwitch" inline-prompt active-text="是" inactive-text="否"  @change="changeEvent"/>
        </el-form-item>
    </el-form>
</template>

<style scoped>



.notice {
    color: #6592F9;
    font-size: 8pt;
}

.notice2 {
    color: red;
    font-size: 8pt;
}

</style>