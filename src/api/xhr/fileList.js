import { http } from '../intercept'
import user from '../../util/user'
import $ from "jquery"
import {showSuccess} from '../../ui/util'
import home from '../../ui/home'

function handler(res) {
    let data = res.data
    let response = res.response
    let page = user.getPage();
    let items = []
    // debugger
    //分页加载时，进行数组合并，判断是否为当前页
    if (page.id === data.parent_file_id && page.order === data.order_direction && page.order_by === data.order_by &&  page.drive_id === data.drive_id ) {
        items = response.items;
    } else {
        page.id = data.parent_file_id
        page.order = data.order_direction
        page.drive_id = data.drive_id
        page.order_by = data.order_by
        page.items = response.items
    }
    let folderName = $('.breadcrumb-item-link--9zcQY:last').text();
    page.folderName = folderName;

    if(items.length > 0){
        if(!page.items){
            page.items = [];
        }
        
        items.forEach(function(newItem) {
            // 检查新对象的 id 是否存在于旧的数组对象中
            var existingItemIndex = page.items.findIndex(function(oldItem) {
              return oldItem.file_id === newItem.file_id;
            });
          
            // 如果存在，则替换旧对象
            if (existingItemIndex !== -1) {
              page.items[existingItemIndex] = newItem;
            } else {
                // 如果不存在，则追加到旧数组的尾部
                page.items.push(newItem);
              }
          });
    }
   

    console.log(`已加载${page.items.length}个文件`)
    showSuccess(`已加载${page.items.length}个文件`)

    if($(".button-download-aliyun").length <= 0 && user.home()){
        home()
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
        
        // 增加获取电影和电视剧直链接
        if( url.indexOf('/file/list') > 0 || url.indexOf('/file/search') > 0 
        || url.indexOf('/adrive/v1/intelligent/movie') > 0  || url.indexOf('/adrive/v1/intelligent/tv') > 0   ){
           
            handler(response)

        }
    })    
}