const { app, BrowserWindow, BrowserView, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const URL_OBJECT = {
  login: 'https://www.g2b.go.kr:8070/um/login/login.do?eventType=1%22', // 로그인
  manage_condition: 'https://www.g2b.go.kr:8079/ls/perf/selectStateMngStatC.do', // 경영상태(실적, 여유율포함)
  my_company:
    'https://www.g2b.go.kr:8070/um/supplier/general/supplierSelfInfoMng.do', // 자기정보확인관리/등록증출력
  sinindo: 'https://www.g2b.go.kr:8079/ls/perf/selectCreditDtlC.do', // 신인도
  technical_list: 'https://www.g2b.go.kr:8079/ls/perf/selectTechnInfoListC.do', // 기술인력정보목록
  technical_detail: 'https://www.g2b.go.kr:8079/ls/techn/selectTechnRegDtl.do', // 기술인력정보 상세
};

let mainWindow = null;
let contentView = null;

const createWindow = () => {
  // 상단 메뉴바 설정
  const template = [];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      defaultEncoding: 'UTF-8',
      preload: path.join(__dirname, 'preload.js'),

      // 다 기본값
      // contextIsolation: true, // 렌더러 프로세스의 JavaScript 환경과 메인 프로세스의 JavaScript 환경이 분리 -> 웹 페이지에서 Electron API에 대한 직접적인 액세스를 차단하여 보안을 강화
      // nodeIntegration: false, // 이 옵션을 true로 설정하면 웹 페이지에서 Node.js 기능을 사용 가능 (보안 취약점이 발생하므로 X)
      // webviewTag: false, // webview 태그 사용가능 설정
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 브라우저뷰 생성
  contentView = new BrowserView({
    webPreferences: {
      defaultEncoding: 'UTF-8',
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  contentView.setBounds({ x: 0, y: 80, width: 800, height: 500 });
  contentView.webContents.loadURL(URL_OBJECT.login);

  mainWindow.setBrowserView(contentView);

  // 새로고침 버튼 클릭 이벤트 처리
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F5') {
      mainWindow.webContents.reload();
      contentView.webContents.reload();
    }
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  contentView.webContents.openDevTools();

  contentView.webContents.on('did-finish-load', () => {
    contentView.webContents.executeJavaScript(`
      document.body.addEventListener('click', (event) => {
        window.ipcRenderer.send('click-detected', {
          where: 'g2b',
          x: event.clientX,
          y: event.clientY,
        });
      });
    `);
  });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// 메인프로세스의 ipc 통신 응답
ipcMain.on('click-detected', (event, clickData) => {
  console.log(
    `${clickData.where} - Clicked at x: ${clickData.x}, y: ${clickData.y}`,
  );
  // 필요한 작업 수행
});

ipcMain.on('refresh', (event, clickData) => {
  mainWindow.webContents.reload();
  contentView.webContents.reload();
});

ipcMain.on('move-login', (event, clickData) => {
  contentView.webContents.loadURL(URL_OBJECT.login);
});

ipcMain.on('soojip-start', async (event, clickData) => {
  getHtml(URL_OBJECT.manage_condition);
  await sleep(3000);
  getHtml(URL_OBJECT.my_company);
  await sleep(3000);
  getHtml(URL_OBJECT.sinindo);
  await sleep(3000);
  getHtml(URL_OBJECT.technical_list);
  await sleep(3000);
  getHtml(URL_OBJECT.technical_detail);
  await sleep(3000);
});

function getHtml(url) {
  contentView.webContents.loadURL(url);

  contentView.webContents
    .executeJavaScript(`document.querySelector('html').innerHTML;`)
    .then((html) => {
      html = `################# ${url} #################` + html;
      // 파일 저장 경로
      const savePath = path.join(__dirname, 'data/data.txt');

      // 파일 존재 여부 확인
      fs.access(savePath, fs.constants.F_OK, (err) => {
        if (err) {
          // 파일이 없으면 새로 생성
          fs.writeFile(savePath, html, (err) => {
            if (err) throw err;
            console.log('File saved!');
          });
        } else {
          // 파일이 있으면 내용 추가
          fs.appendFile(savePath, html, (err) => {
            if (err) throw err;
            console.log('Data appended!');
          });
        }
      });
    })
    .catch((error) => {
      console.error('Error executing script:', error);
    });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
