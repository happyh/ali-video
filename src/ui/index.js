import home  from './home'
import share  from './share'
import $ from "jquery"
import user from '../util/user'

var globalMenuName;

/** 显示首页的UI */
function showHomeUi(menuName){
    globalMenuName=menuName;
    console.log(globalMenuName)
    if(menuName ==='文件' ||menuName ==='收藏夹' ||menuName ==='密码箱'){
        setTimeout(function(){
            home(menuName)
        },200);
    } 

}



function initHomeUi(){
    let menu = $(".nav-menu--Lm1q6")
    if (menu.length !== 0) {
        $('.nav-menu-item--2oDIG').on('click',function(e){
            showHomeUi(e.currentTarget.textContent)
        })
        
        // 如果从收藏夹里面点击，则会触发该方法
        setInterval(function(){
            let node = $(".is-active--fBPou:eq(0)");
            if(node.length>0){
                if(node.text()!==globalMenuName){
                    showHomeUi(node.text()) 
                }
            }
        },700); 
        setTimeout(function(){
            let node = $(".is-active--fBPou:eq(0)");
            if(node.length>0){
                showHomeUi(node.text()) 
            }
        },300);
    }else{
        setTimeout(initHomeUi, 500)
    }
}


export default ()=>{
    if(user.home()){
        initHomeUi()
    }else{
        share()
    }
}
