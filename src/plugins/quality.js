/**
 * 清晰度选择
 */
import user from '../util/user'
import { getDownloadUrl, shareLinkDownloadUrl } from '../api/aliyun'
import {showError} from '../ui/util'

function title(html) {
    let name = html.split(" ")[1];
    let css ="display:flex;flex-direction:row;align-items:center;"
    let htmlDiv = `<div style='${css}padding-left:10px;padding-right:10px'>
        <p>${name}</p>
    </div>`

    return htmlDiv;
}


// 获取原画的视频地址
function getVideoSrc(call){
    let videoPage =  user.getVideoPage()
   

    let showDnload;
    if (!user.home()) {
        let token = user.getShareToken()
        if(token == ''){
            showError("当前登录凭证失效，请刷新或重新登录");
            return ""
        }

        showDnload = shareLinkDownloadUrl({
            file_id: videoPage.id,
            share_id: token.share_id
        }, token.share_token).then((response) => {
            call && call(response.data.download_url)
        })

    } else {
        let token =  user.getToken()
        if(token == ''){
            showError("当前登录凭证获取为空，请刷新或重新登录");
            return ""
        }

        showDnload = getDownloadUrl({
            expire_sec: 14400,
            drive_id: token.default_drive_id,
            file_id: videoPage.id
        }).then((response) => {
            call &&  call(response.data.url)
        })
    }



    showDnload.catch((e) => {
        if (e && e + '' == 'AxiosError: Request failed with status code 429') {
            showError("接口请求频繁")
        } else {
            showError("刷新失败，错误异常:" + e)
        }
    }).finally(() => {
        call && call()
    })


}


function getOptionUrl(option){
    console.log(option)
    return  new Promise((resolve, reject) => {
        if(option.html!=' 原画'){
            resolve(option.url)
        }else {
            getVideoSrc((url)=>{
                if(url!=''){
                    resolve(url)
                }else{
                    reject("获取地址视频错误")
                }
            })
        }
    })
}



function artplayPluginQuality(option) {
    return async art => {
        let def = option[option.length - 1];
        let loc = user.getVideoPlayerSet().qualityHtml
        var storageQuality;


        if (loc) {
            let quality = option.find(item => item.html === loc);
            if (quality) {
                quality['default'] = true;
                storageQuality = quality.html
            }
        }

        if (!storageQuality) {
            storageQuality = def.html
            def['default'] = true;
        }

        let index = option.findIndex(function (item, index) {
            return item.html === storageQuality
        })


       var  quality =  {
            name: 'quality',
            position: 'right',
            html: title(storageQuality) || 'Quality',
            selector: option,
            index: 2,
            onSelect:async function (item) {
                let url =await getOptionUrl(item);
                console.log(item.html)
                console.log(url)
                art.qualityHtml = item.html;
                art.switchQuality(url, item.html);
                return title(item.html)
            },
        }

        
        art.quality_ = quality
        art.controls.add(quality);

        const quality1 = option[index];
        if (quality1) {
            art.url =await getOptionUrl(quality1);
            
            art.qualityHtml = quality1.html;
        } else {
            art.url =await getOptionUrl(option[0]);
            art.qualityHtml = option[0].html;
        }
        
    }

}


export default artplayPluginQuality