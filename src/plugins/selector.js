import user from '../util/user'
import $ from "jquery"


var cur = `<span  data-role="icon"data-render-as="svg"data-icon-type="PDSPlayCircle"class="icon--2AFV7 icon--d-ejA ">
<svg viewBox="0 0 1024 1024"><use xlink:href="#PDSPlayCircle"></use></svg>
</span>`;

function html(item, def) {

    let htmlDiv = `<div style='display:flex;flex-direction:row;align-items:center;'  title="${item.name}">
    <p class="title--2vewu " >
        ${def ? cur : ''}
    </p>
        <span class="filename--3hcxw filename_luogen" style="font-size:14px">${item.name}</span>
    </div>
    `
    return htmlDiv;
}



//选集
function selector(call) {
    let items = user.getPage().items;
    if(items.length==0 ||  $('#videoHistory').length > 0){
        return (art)=>{}
    }

    let fileList = items
    let id = user.getVideoPage().id;
    var videoList = fileList.filter(function (item, index) {
        return item.category === 'video'
    })
        , fileIndex = videoList.findIndex(function (item, index) {
            return item.file_id === id
        })

    if (!(fileIndex > -1 && videoList.length > 1)) return () => { }

    console.log("视频数量为：：" + videoList.length)


    return (art) => {

        let option = []

        videoList.forEach((it, index) => {
            option.push({
                default: index == fileIndex,
                index: index,
                file: it,
                html: html(it, index == fileIndex)
            })

        })
        let svg = '<svg t="1677915128666" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2048" width="24" height="24"><path d="M665.47 417.65l-345.03-244.3c-69.8-49.42-166.29 0.49-166.29 86.01v502.27c0 85.52 96.49 135.43 166.29 86.01l345.03-244.31c64.02-45.34 64.02-140.34 0-185.68zM811.82 868.52c-30.38 0-55-24.62-55-55V207.46c0-30.38 24.62-55 55-55s55 24.62 55 55v606.07c0 30.37-24.62 54.99-55 54.99z" p-id="2049" fill="#ffffff"></path></svg>'

        if(fileIndex + 1 < videoList.length){
            art.controls.add({
                name: 'next_selector',
                position: 'left',
                html: `<i class="art-icon"  title="${videoList[fileIndex + 1].name}">` + svg + '</i>',
                tooltip: videoList[fileIndex + 1].name,
                style: {
                    marginRight: '10px',
                },
                click: function(){
                    let item =videoList[fileIndex + 1];
                    call && call(item)
                }
            });
        }
        
        art.videoList = option;
        art.controls.add({
            name: 'selector',
            position: 'right',
            index: 1,
            html: '选集',
            click: function(){
                if(art.fullscreen){
                    art.fullscreen=false;
                }else if(art.fullscreenWeb){
                    art.fullscreen=false;
                }
                call && call()
            }
        });

    }


}


export default selector