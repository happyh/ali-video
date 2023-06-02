<script setup>
import { ref, onMounted } from 'vue';
import { ElCard, ElScrollbar, ElTooltip } from 'element-plus'

import $ from "jquery";
const videoList = ref([])
const emit = defineEmits(['next'])
const card = ref()

onMounted(() => {
})


function nextVideo(index) {
    videoList.value.forEach((it, ix) => {
        if (ix == index) {
            it.default = true
        } else {
            it.default = false
        }
    })
    emit("next", videoList.value[index])
}

function loadingList(vList) {
    console.log(vList)
    videoList.value = vList
    scrollToData();
}

function scrollToData() {
    // 获取目标元素
    let target = $('div[data-def="true"]')
    if (target.length == 0) {
        setTimeout(scrollToData, 200)
        return
    }
    card.value.setScrollTop(target[0].offsetTop)
}


defineExpose({
    loadingList
});
</script>

<template>
    <ElScrollbar class="GoodList" ref="card">

        <div :data-def="item.default" class="card" v-for="(item, index) in videoList" :key="index">
            <ElTooltip :content="item.file.name" placement="left-start" effect="light" hide-after="10" show-after="100">
                <ElCard :shadow="item.default ? 'always' : 'hover'" @click.stop="nextVideo(index)">
                    <p :style="item.default ? 'color:#23ade5' : ''">
                        {{ item.file.name }}
                    </p>
                </ElCard>
            </ElTooltip>
        </div>
    </ElScrollbar>
</template>

<style scoped>
.card {
    margin-bottom: 10px;

}

/*  */
</style>