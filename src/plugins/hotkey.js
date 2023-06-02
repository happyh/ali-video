/**
 * 快捷键
 */


var doubleSpeed = function (art) {
    art.notice.show = '倍速播放 x3';
    art.playbackRate = 3;
}

function hotkey(){

    return art => {
        var rightCount = 0;
        var playbackRate = null;
        var rightInterval = null;
        var logKey = false;


        document.onkeyup = function (event) {

            if (event.code === 'ArrowRight') {
                if (rightCount === 1) {
                    art.currentTime =  art.currentTime  + 5
                }
                logKey = false;
                if (rightInterval) {
                    window.clearInterval(rightInterval)
                }
    
                rightInterval = null;
                rightCount = 0;
    
                if (playbackRate) {
                    art.playbackRate = playbackRate;

                    playbackRate = null
                }
            }
        }


        document.onkeydown = function (event) {

        
            //右
            if (event.code === 'ArrowRight') {
                rightCount += 1;
                if (!playbackRate) {
                    playbackRate = art.playbackRate
                }
                if (!rightInterval) {
        
                    rightInterval = setInterval(function () {
                        if (rightCount > 100) {
                            rightCount = 2;
                        }
        
                        if (rightCount > 1 && !logKey) {
                            doubleSpeed(art)
                            logKey = true;
                        }
        
                    }, 100)
                }
            } else if (event.code === 'ArrowLeft') {
                //左
                art.currentTime =  art.currentTime - 5
            } else if (event.code === 'ArrowUp') {
                //上
                art.volume = art.volume + .01
  
            } else if (event.code === 'ArrowDown') {
                //下
                art.volume = art.volume - .01
            } else if (event.code === 'Space') {
                //空格
                art.toggle();
            } else if (event.code === 'Enter') {
                //回车
                art.fullscreen =!art.fullscreen ;
            }
        
        
        }



    }

}

export default hotkey