import home  from './home'
import share  from './share'
import $ from "jquery"
import user from '../util/user'
import SignIn from '../page/SignInPage.vue'
import { createApp } from 'vue';

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
        $('.nav-tab-item--WhAQf').on('click',function(e){
            showHomeUi(e.currentTarget.textContent)
        })
        
        // 如果从收藏夹里面点击，则会触发该方法
        // setInterval(function(){
        //     let node = $(".is-active--8atYr:eq(0)");
        //     if(node.length>0){
        //         if(node.text()!==globalMenuName){
        //             showHomeUi(node.text()) 
        //         }
        //     }
        // },700); 
        setTimeout(function(){
            let node = $(".is-active--8atYr:eq(0)");
            if(node.length>0){
                showHomeUi(node.text()) 
            }
        },300);
    }else{
        setTimeout(initHomeUi, 500)
    }
}


function signInUi(){

    let storage = $(".storage-wrapper--h-rcS")
    if (storage.length !== 0) {
        let app =  createApp(SignIn)
        app.mount(
            (() => {
              const app = document.createElement('div');
              storage.prepend (app);
              return app;
            })(),
          );
    
    }else{
        setTimeout(signInUi, 500)
    }

}


export default ()=>{
    if(user.home()){
        initHomeUi()
        signInUi()
    }else{
        share()
    }

}
