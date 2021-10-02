<script lang="ts">
  const { ipcRenderer } = require('electron')
  import { Progress } from 'sveltestrap';

  ipcRenderer.on("state", (_event : any, newSate: string) => {
    state = newSate
  });
  ipcRenderer.on("download-progress", (_event : any, progressInfo: any) => {
    percent = progressInfo.percent
    total = (progressInfo.total / Math.pow(1024, 2)).toFixed(1)
    transferred = (progressInfo.transferred / Math.pow(1024, 2)).toFixed(1)
  });

  let state = 'checking' 
  let percent = 0
  let total = "0.0"
  let transferred = "0.0"
</script>

<main class="p-4">
  <img src="./img/icon.png" alt="RCV Logo" width="75" class="mb-3">
  <p class="text-muted mb-1">Riot Community Volunteers</p>
  <h2>League Observer Tool</h2>

  <div class="mt-4 w-100 text-center text-muted">
    {#if state === 'checking'}
      <small>Checking for Update ...</small>
    {:else if state === 'downloading'}
      <div id="progress" class="d-flex w-100 mb-1">
        <small class="mr-5">Downloading ...</small>
        <small class="ml-auto">{transferred} MBs / {total} MBs</small>
      </div>
      <Progress value={percent} width="100%" />
    {:else if state === 'update-downloaded'}
      <small>Installing Update ...</small>
    {:else if state === 'finished'}
      <small>Starting ...</small>
    {/if}
  </div>
</main>

<style>
  main {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-top: 6px solid #D8EF5E;
  }

  #progress {
    justify-content: space-between;
  }
</style>
