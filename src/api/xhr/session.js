import { http } from '../intercept'
import user from '../../util/user'

function handler(headers) {
    user.sessionSet(headers['Authorization'],headers['x-device-id'],headers['x-signature'])
}

export default ()=>{

    http.onRequest(function(req){
        let fileId =  req.headers['fileId']

        if (fileId==null && req.headers['x-device-id']!=null ) {
            handler(req.headers)
        }

    })    
}