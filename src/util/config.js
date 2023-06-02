import { store } from '@/js/store'
import { unsafeWindow } from '$';



const transcoding = {
    UHD: '4K 超清',
    QHD: '2K 超清',
    FHD: '1080 全高清',
    HD: '720 高清',
    SD: '540 标清',
    LD: '360 流畅'
}


/**
 * 
 * 是否已加载完成
 */
function initFinsh() {
    return unsafeWindow.luoGenSession!=null
}


export {
    transcoding,
    initFinsh
}