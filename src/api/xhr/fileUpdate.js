import { http } from '../intercept'



export default ()=>{

    http.onRequest(function(req){

        if (req.url.endsWith('v3/file/update')) {
            let reqbody = JSON.parse(req.data[0]);
            let name = reqbody.name;
            //原本的后缀
            let i = name.lastIndexOf('.');
            if (i === -1) {
                return;
            }
            let newName = name.substring(0, i);
            if (newName.lastIndexOf('.') !== -1) {
                reqbody.name = newName;
                req.data[0] = JSON.stringify(reqbody)
            }
        }
    })    
}