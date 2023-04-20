const { app, BrowserWindow, BrowserView, ipcMain, Menu } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // 상단 메뉴바 설정
  const template = [];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
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
  const contentView = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  contentView.setBounds({ x: 0, y: 80, width: 800, height: 500 });
  contentView.webContents.loadURL(
    'https://www.g2b.go.kr:8070/um/login/login.do?eventType=1%22',
  );

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
  // contentView.webContents.openDevTools();

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

  // js 코드 실행
  // contentView.webContents
  //   .executeJavaScript(`document.querySelector('html').innerHTML;`)
  //   .then((html) => {
  //     console.log(html);
  //   })
  //   .catch((error) => {
  //     console.error('Error executing script:', error);
  //   });

  // contentView.webContents.executeJavaScript(`transmit_selfClick('C');`);
  // .then((html) => {
  //   console.log(html);
  // })
  // .catch((error) => {
  //   console.error('Error executing script:', error);
  // });
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
