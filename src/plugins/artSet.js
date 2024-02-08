

import {videoUpdate} from "../api/aliyun"
import user from '../util/user'
import $ from "jquery"

function saveCloud(art){
    let token = user.getToken()
    if(token==null){
        return
    }
    let v = user.getVideoPage()

    videoUpdate({
        drive_id: token.default_drive_id,
        duration: art.duration,
        file_id: v.id,
        play_cursor: art.currentTime
    }).then(res=>{})
}



function saveExit(){

    return (art)=>{
        art.on('ready',()=>{
            let v = user.getVideoPage()
            if(v.play_cursor){
                art.seek  = v.play_cursor
            }else{
                // 去历史列表中查看
               let list =  user.getVideoLookList()
               let index =  list.findIndex(item=>{
                    return item.id == v.id
                })
                if(index!=-1){
                    art.seek  = list[index].play_cursor
                }

            }

            let plset = user.getVideoPlayerSet()
            if(plset.fullscreen){
                art.fullscreen= true;
            }
            if(plset.fullscreenWeb){
                art.fullscreenWeb= true;
            }
            if(plset.playbackRate){
                art.playbackRate= plset.playbackRate;
            }
           
            if(plset.subtitleSize && plset.subtitleSize!=0){
                $('.art-subtitle').css("font-size", plset.subtitleSize + "px");
                art.subtitleSize= plset.subtitleSize;
            }
            if(plset.subtitleMargin && plset.subtitleSize!=0){
                $('.art-subtitle').css("margin-bottom", plset.subtitleMargin + "px");
                art.subtitleMargin= plset.subtitleMargin;
            }
            if(plset.subtitleOffset){
                art.subtitleOffset= plset.subtitleOffset;
                art.subtitleOffset= plset.subtitleOffset;
            }
            if(plset.subtitleColor && plset.subtitleColor.indexOf("#") != -1){
                $('.art-subtitle').css("color",plset.subtitleColor);
                art.subtitleColor= plset.subtitleColor;
            }

        })

        art.on('destroy', () => {
      
            let v = user.getVideoPage()
            if(v.type == 0 ){
                saveCloud(art)
            }
            user.saveVideoPlayerSet(art);
            let currentTime=  art.currentTime;
            let progress =  parseInt(( currentTime/ art.duration) * 100)
            try {
                art.hls.destroy()
                art.video.dispose()
            } catch (error) {
                
            }
       
            let items = user.getPage().items;
            let index = items.findIndex((it)=>{
                return it.file_id == v.id
            })
            // 保存当前页面的观看信息
            if(index !=-1){
                if(!items[index].user_meta){
                    items[index].user_meta ="{}"
                }
                let meta = JSON.parse(items[index].user_meta);
                meta.play_cursor =  currentTime
                items[index].user_meta =JSON.stringify(meta);
            }

          
            let folderName;
            let href=v.href;
            if(v.type==1){
                folderName="来自分享";
            }else{
                folderName=v.folderName
            }
            //保存到本地
            user.saveVideoInfo(v.id,v.name,progress,folderName,href,v.type==1,currentTime,v.drive_id)



        });
    }
}


export default saveExit