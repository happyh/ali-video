/**
 * 字幕
 * 
 */

function subtitle(click){
    return art => {

            
        art.controls.add({
            name: 'subtitle',
            position: 'right',
            html: '字幕',
            index: 2,
            style: {
                marginLeft: '10px',
            },
            click:function(){
                if(art.fullscreen){
                    art.fullscreen=false;
                }else if(art.fullscreenWeb){
                    art.fullscreen=false;
                }
                click && click()
            },
        });


    }
}


export default subtitle