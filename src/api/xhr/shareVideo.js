import { http } from '../intercept'
import {shareVideo} from '../../ui/video'
import user from '../../util/user'



function handler(res) {

    let response = res.response
    let shareToken = user.getShareToken();
    if (!user.isExpires(shareToken) || shareToken.share_id != response.share_id ) {
        showError("当前页面已过期，请刷新重试")
        return
    }
    shareVideo(response)
}



export default ()=>{

    http.onResponse(function(res,url){
        let config = res.config

        try {
            config.data = JSON.parse(config.data)
        } catch (error) {
            config.data = {}
        }

        let response = {
            response: res.response,
            data: config.data
        }
   
        if( url.indexOf('get_video_preview_play_info_by_share') > 0 ){
            handler(response)
        }
    })    
}