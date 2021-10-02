import { app } from 'electron'

export function createUserTasks() : void {
  app.setUserTasks([
    {
      program: process.execPath,
      arguments: '--quit-app',
      iconPath: process.execPath,
      iconIndex: 0,
      title: 'Quit App',
      description: 'Quit the Observer Tool'
    }
  ])
}