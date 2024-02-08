import { http } from '../intercept'


function handler(res) {
    let data = res.data
    let response = res.response
    // console.log(res);

}

export default ()=>{

    http.onRequest(function(req){
        let config = res.config
        console.log(config)
        if (req.url.endsWith('users/device/create_session') || req.url.endsWith("/users/device/renew_session")) {
            handler(response)
        }

    })    
}