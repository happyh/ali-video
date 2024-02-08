import { http } from '../intercept'
import {deviceLogout} from '../aliyun'



export default ()=>{

    http.onRequest(function(req){

        if (req.url.endsWith('/users/v1/users/device_logout')) {
            deviceLogout().then((response) => {
                console.log("用户退出")
            })
        }

    })    
}