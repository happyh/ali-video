import { http } from '../intercept'
import {homeVideo} from '../../ui/video'

function handler(res) {

    let response = res.response
    if (response.category && response.category === 'video') {
        homeVideo(response)
    }

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

        if( url.endsWith('/file/get') ){
            handler(response)
        }
    })    
}