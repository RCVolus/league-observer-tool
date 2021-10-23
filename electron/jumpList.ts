import { app } from 'electron'

export function createJumpLists() : void {
  app.setJumpList([
    {
      name: 'App',
      items: [
        {
          type: 'task',
          program: process.execPath,
          args: '--quit-app',
          iconPath: process.execPath,
          iconIndex: 0,
          title: 'Quit App',
          description: 'Quit the Observer Tool'
        }
      ]
    }
  ])
}