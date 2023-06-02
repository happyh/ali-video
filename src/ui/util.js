import $ from "jquery"
import { ElMessage } from 'element-plus'



let showError = function (msg, timeout) {
    ElMessage({
        message: msg,
        type: 'error',
        duration:timeout || 3000
      })
}


let showSuccess = function (msg, timeout) {

    ElMessage({
        message: msg,
        type: 'success',
        duration:timeout || 3000
      })
}


let showDiv = function (title, app) {
    function format(s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
        });
    }


    let html = '<div class="ant-modal-root ant-modal-Link"><div class="ant-modal-mask"></div><div tabindex="-1" class="ant-modal-wrap" role="dialog"><div role="document" class="ant-modal modal-wrapper--5SA7y" style="width: 666px;"><div class="ant-modal-content"><div class="ant-modal-header"><div class="ant-modal-title" id="rcDialogTitle1">{title}</div></div><div class="ant-modal-body"><div class="icon-wrapper--TbIdu"><span data-role="icon" data-render-as="svg" data-icon-type="PDSClose" class="close-icon--KF5OX icon--D3kMk  "><svg viewBox="0 0 1024 1024"><use xlink:href="#PDSClose"></use></svg></span></div>'
    html = format(html, {
        title: title
    })

    html += '</div></div></div></div></div></div>'
    $('body').append(html)

   app.mount(
        (() => {
          const app = document.createElement('div');
          $('.ant-modal-body').append(app);
          return app;
        })(),
      );


    $('.ant-modal-Link .icon-wrapper--TbIdu').one('click', function () {
        $('.ant-modal-Link').remove()
        app.unmount()
    })

    $('.ant-modal-Link .ant-modal-wrap').on('click', function (event) {
        if ($(event.target).closest('.ant-modal-content').length === 0) {
            $('.ant-modal-Link').remove()
            app.unmount()
        }
    })

}




let showShareDiv = function (title, app) {
    function format(s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
        });
    }


    let html = `
    <div class="ant-modal-root ant-modal-Link">
  <div class="ant-modal-mask">
  </div>
  <div tabindex="-1" class="ant-modal-wrap" role="dialog">
    <div role="document" class="ant-modal modal-wrapper--5SA7y" style="width: 666px;">
      <div class="ant-modal-content">
        <div class="ant-modal-header">
          <div class="ant-modal-title" id="rcDialogTitle1">{title}</div>
        </div>
        <div class="ant-modal-body">
          <div class="icon-wrapper--TbIdu" style="height:28px;width:28px;display:-ms-flexbox;display:flex;border-radius:5px;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;color:var(--context_secondary);position:absolute;top:18px;right:16px;-webkit-transition:all .3s ease;-o-transition:all .3s ease;transition:all .3s ease;cursor:pointer;z-index:10;" data-spm-anchor-id="aliyundrive.file_file_sharing.0.i2.39733575IlF5dn">
           <img src="https://img.alicdn.com/imgextra/i1/O1CN01Q2sMej1EoKIosKJLA_!!6000000000398-2-tps-56-56.png" width="28" height="28" style="margin: 0px 14px 7px 0px; align-self: flex-end; cursor: pointer;" data-spm-anchor-id="aliyundrive.file_file_sharing.0.i3.39733575eJqbVb" />
          </div>
    `
    html = format(html, {
        title: title
    })

    html += '</div></div></div></div></div></div>'
    $('body').append(html)

   app.mount(
        (() => {
          const app = document.createElement('div');
          $('.ant-modal-body').append(app);
          return app;
        })(),
      );


    $('.ant-modal-Link .icon-wrapper--TbIdu').one('click', function () {
        $('.ant-modal-Link').remove()
        app.unmount()
    })

    $('.ant-modal-Link .ant-modal-wrap').on('click', function (event) {
        if ($(event.target).closest('.ant-modal-content').length === 0) {
            $('.ant-modal-Link').remove()
            app.unmount()
        }
    })

}




export {
    showSuccess,
    showError,
    showDiv,
    showShareDiv
}