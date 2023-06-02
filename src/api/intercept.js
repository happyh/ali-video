import xhrHandler  from './xhr/index'

class XMLHttp {

    constructor() {
        this.responseListen = []
        this.requestListen = []
    }

    request = function (param) {
    }
    response = function (param) {
    }

    onRequest = function(cal){
        this.requestListen.push(cal);
    }

    onResponse = function(cal){
        this.responseListen.push(cal);
    }
}




function initXMLHttpRequest(http) {
    let open = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function (...args) {
        let send = this.send
        let _this = this
        let post_data = []
        this.send = function (...data) {
            post_data = data


            let dataBody = {
                url: args[1],
                method: args[0],
                headers: {},
                data: data
            }

            if (_this._header_) {
                dataBody.headers = _this._header_
            }
            if (_this._header_ && _this._header_['fileId']) {
                return send.apply(_this, data)
            }

            // 请求前拦截
            http.request(dataBody)
            return send.apply(_this, data)
        }


        this.addEventListener('readystatechange', function () {
            if (this.readyState === 4) {
                let config = {
                    url: args[1],
                    status: this.status,
                    method: args[0],
                    data: post_data
                }
                // 请求后拦截
                let res = this.response
                if (_this._header_ && _this._header_['fileId']) {
                    return
                }

                if (typeof res == 'string') {
                    try {
                        res = JSON.parse(this.response)
                    } catch (e) {
                        console.log("解析出问题了， ",e)
                        return
                    }
                }
       
            
                http.response({ config, response: res })
            }
        }, false)
        return open.apply(this, args)
    }
}

const http = new XMLHttp()

function listen() {

    xhrHandler()

    http.request = function (req) {
        if(this.requestListen.length > 0 ){
            this.requestListen.forEach(i=>{
                i(req);
            })
        }
    }
    http.response = function (res) {
        if(this.responseListen.length > 0 ){
            let config = res.config
            this.responseListen.forEach(i=>{
                i(res,config.url);
            })
        }
    }
    initXMLHttpRequest(http)

}
export {
    listen,
    http
}