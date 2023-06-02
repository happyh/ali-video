import { defineConfig,loadEnv  } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn,util } from 'vite-plugin-monkey';
// import requireTransform from 'vite-plugin-require-transform';


// https://vitejs.dev/config/
export default defineConfig({
  
  assetsInclude: ['**/*.html'],
  plugins: [
 
    vue(),
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: "阿里云盘助手",
        version: loadEnv("", process.cwd(), '').VITE_VERSION,
        license:'MIT',
        description:'支持生成文件下载链接、修改文件后缀,支持第三方播放器Artplayer(突破视频2分钟限制,长按倍速,选集,历史播放)',
        icon: 'https://img.alicdn.com/imgextra/i1/O1CN01JDQCi21Dc8EfbRwvF_!!6000000000236-73-tps-64-64.ico',
        namespace: 'http://tampermonkey.net/',
        author:"罗根大人",
        match: ['https://www.aliyundrive.com/*'],
      },
      build: {
        externalGlobals: {
          vue: cdn.bootcdn('Vue', 'vue.global.min.js') .concat(
                   await util.fn2dataUrl(() => {
                     window.Vue = Vue; // work with element-plus
                    })),
          jquery: cdn.bootcdn('$','jquery.min.js'),
          axios: cdn.bootcdn('axios','axios.min.js'),
          'hls.js/dist/hls.min':cdn.bootcdn("Hls",'hls.min.js'),
          artplayer: cdn.bootcdn('Artplayer','artplayer.min.js'),
          'element-plus':  cdn.bootcdn('ElementPlus', 'index.full.min.js')
        },
        externalResource:{
          'element-plus/dist/index.css': cdn.bootcdn('','index.min.css'),
        }
      },
    }),
  ],
});
