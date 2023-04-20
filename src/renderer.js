const { remote } = require('electron');

// BrowserView 객체 생성
const view = new remote.BrowserView();

// BrowserWindow 객체 가져오기
const win = remote.getCurrentWindow();

document.addEventListener('click', (event) => {
  const clickData = {
    where: 'index.html',
    x: event.clientX,
    y: event.clientY,
  };

  // 여기서 'click-detected'는 사용자 정의 이벤트입니다.
  window.ipcRenderer.send('click-detected', clickData);
});
