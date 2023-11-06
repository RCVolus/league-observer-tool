import { app, BrowserWindow, Menu, Tray, nativeImage } from "electron";
import { join } from "path";

export default function createTray(mainWindow: BrowserWindow): Tray {
  const execPath = __dirname.replace("\\app.asar", "");
  const iconPatch = join(execPath, "../assets/icons/icon.ico")
  const icon = nativeImage.createFromPath(iconPatch)
  const tray = new Tray(icon)
  tray.setIgnoreDoubleClickEvents(true)
  tray.on('click', () => {
    if (!mainWindow?.isVisible()) {
      mainWindow?.show()
    }
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      icon: icon.resize({ width: 16 }),
      click: function () {
        mainWindow?.show();
      }
    },
    {
      type: "separator"
    },
    {
      label: 'Quit',
      click: function () {
        app.quit();
      }
    }
  ])
  tray.setToolTip('League Observer Tool')
  tray.setContextMenu(contextMenu)

  return tray
}