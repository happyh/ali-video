

import SHA256 from './hash/sha/256'
import MD5 from './md5'
import secp256k1 from 'secp256k1'
import Buffer_ from 'Buffer'
import { unsafeWindow} from '$';

const sha256=SHA256();
const bf=Buffer_.Buffer;
var nonce=0;
var t;
var key = "你好,罗根"

function  fu(){
   return  typeof  t ==='function'
}

// generate privKey
function  generatePrivKey(id){
    let privKey
    let  random =MD5(id+randomString(16))
    do {
        privKey = bf.from(random)
    } while (!secp256k1.privateKeyVerify(privKey))
    return {
        key:id,
        iv:privKey
    };
}

function toString(appId, deviceId, userId,nonce){
    let str = (fu()&&t.toString().indexOf(key)!==-1)?`${appId}:${deviceId}:${userId}:${nonce}`:`${appId}:${userId}:${nonce}:${deviceId}`;
    let digest = sha256.update(str).digest();
    return bf.from(digest);
}

function  toHex(arr){
    return uint8Array(new Uint8Array(arr));
}


function uint8Array(uint8Array) {
    return Array.prototype.map
        .call(uint8Array, (x) => ('00' + x.toString(16)).slice(-2))
        .join('');
}

function randomString(len) {
    len = len || 10; // 默认长度为10
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // 可选字符
    var str = ""; // 结果字符串
    for (var i = 0; i < len; i++) {
        var index = Math.floor(Math.random() * chars.length); // 随机生成一个索引
        str += chars.charAt(index); // 根据索引获取字符并拼接
    }
    return str; // 返回随机字符串
}

function  session(that,appId, deviceId, userId){
    if (typeof  that !=='function'){
        return "";
    }
    t=that;
    console.log("%c 你好，罗根 create_session" ,  "color:red")
    let buf = toString(appId, deviceId, userId,nonce);
    const key = generatePrivKey(userId);
    let  un = new Uint8Array(65);
    secp256k1.publicKeyCreate(key.iv,false,un)
    const  pubStrHex = uint8Array(un);
    const sigObj = secp256k1.ecdsaSign(buf, key.iv)
    let msgHex =toHex(sigObj.signature)
    nonce++;
    that(key.key,pubStrHex,msgHex + "01",deviceId)
}


/*

session( function (key,pubStrHex,signature,deviceId) {
    console.log("私钥：" + key)
    console.log("公钥" + pubStrHex)
    console.log("结果" + signature)
    console.log("设备" + deviceId)
    "你好,罗根"
},"5dde4e1bdf9e4966b387ba58f4b3fdc3","ba58f4b3AFDAV","0401835dd36d4ff78b9bafe1273064ad")
*/

export default (call)=>{

    unsafeWindow.luoGenSession = function (that,appId, deviceId, userId){
        let nav =  window.navigator;
        let  d = deviceId + nav.appCodeName + nav.appName + nav.appVersion
        d = MD5(d)
        session(that,appId, d, userId)
    }
    call && call()
}




