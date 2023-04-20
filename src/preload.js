// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// 렌더러 프로세스와 메인 프로세스 간에 안전한 통신을 설정
// contextBridge를 사용하여 렌더러 프로세스의 window 객체에 ipcRenderer라는 이름의 새로운 객체를 생성합니다. 이를 통해 웹 페이지에서 메인 프로세스와 안전하게 통신
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
});
