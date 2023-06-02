


function loadScript(src) {

  if (!window.instances) {
    window.instances = {};
  }
  if (!window.instances[src]) {
    window.instances[src] = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = src;
      script.type = "text/javascript";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return window.instances[src];

}


export {
  loadScript
}