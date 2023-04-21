document.addEventListener('click', (event) => {
  const clickData = {
    where: 'index.html',
    x: event.clientX,
    y: event.clientY,
  };

  // 여기서 'click-detected'는 사용자 정의 이벤트입니다.
  window.ipcRenderer.send('click-detected', clickData);

});

document.querySelector('#soojip-start-btn').addEventListener('click', (event) => {
  window.ipcRenderer.send('soojip-start', {});
});

document.querySelector('#refresh-btn').addEventListener('click', (event) => {
  window.ipcRenderer.send('refresh', {});
});

document.querySelector('#login-btn').addEventListener('click', (event) => {
  window.ipcRenderer.send('move-login', {});
});


