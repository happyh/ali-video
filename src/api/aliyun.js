import axios from 'axios'


export const getDownloadUrl=(data)=>axios.post('/v2/file/get_download_url',data,{
    headers: {
      'x-canary': 'client=web,app=adrive,version=v4.2.0',
    }
  })
export const search=(data)=>axios.post('/adrive/v3/file/search',data,{
    headers: {
      'x-canary': 'client=web,app=adrive,version=v4.2.0',
    }
  })
export const videoUpdate=(data)=>axios.post('/adrive/v2/video/update',data)

export const deviceLogout=()=>axios.post('/users/v1/users/device_logout',{})

export const homeWidgets=()=>axios.post('/apps/v1/users/home/widgets',{"context":{"recentUsed":{"limit":20},"recentSaved":{"limit":1}}})

export const shareVideoInfo=(fileId,share_id,shareToken)=>axios({
    method: 'post',
    url:'/v2/file/get_share_link_video_preview_play_info',
    data:{
        category: 'live_transcoding',
        file_id: fileId,
        get_preview_url: true,
        share_id: share_id,
        template_id: '',
        get_subtitle_info: !0
    },
    headers:{
        'content-type': 'application/json;charset=UTF-8',
        'x-share-token': shareToken
    }

})

export const videoPreviewPlayInfo=(data)=>axios.post('/v2/file/get_video_preview_play_info',data)



export const shareLinkDownloadUrl=(data,shareToken)=>axios({
    method: 'post',
    url:'/v2/file/get_share_link_download_url',
    data:{
        ...data
    },
    headers:{
        'content-type': 'application/json;charset=UTF-8',
        'x-share-token': shareToken,
        '_token':false
    }

})



export const createSessionUrl=(data,signature,deviceId)=>axios({
    method: 'post',
    url:'/users/v1/users/device/create_session',
    data:{
        ...data
    },
    headers:{
        'content-type': 'application/json;charset=UTF-8',
        'x-canary': 'client=web,app=adrive,version=v3.17.0',
        '_token':false,
        'x-signature': signature,
        'x-device-id': deviceId
    }

})



// export const getDownloadUrl=(data)=>axios({
//     method: 'post',
//     url:'/v2/file/get_download_url',
//     data:{
//         ...data
//     },
//     headers:{
//         '_token':false
//     }
// })