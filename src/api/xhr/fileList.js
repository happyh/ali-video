import { http } from '../intercept'
import user from '../../util/user'
import $ from "jquery"
import {showSuccess} from '../../ui/util'

function handler(res) {
    let data = res.data
    let response = res.response
    let page = user.getPage();
    let items = []

    // 数据量过大，进行数组合并
    if (page.id === data.parent_file_id && page.order === data.order_direction && page.order_by === data.order_by) {
        items = response.items;
    } else {
        page.id = data.parent_file_id
        page.order = data.order_direction
        page.order_by = data.order_by
        page.items = response.items
    }
    let folderName = $('.breadcrumb-item-link--M-p4b:last').text();
    page.folderName = folderName;

    if(items.length > 0){
        if(!page.items){
            page.items = [];
        }
        page.items = page.items.concat(response.items)
    }
   

    console.log(`已加载${page.items.length}个文件`)
    showSuccess(`已加载${page.items.length}个文件`)

    // if (isHome()) {
    //     initMenuButton()
    // } else {
    //     initShareButton()
    // }

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

        if( url.indexOf('/file/list') > 0 || url.indexOf('/file/search') > 0){
           
            handler(response)

        }
    })    
}