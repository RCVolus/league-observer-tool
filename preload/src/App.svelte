<script lang="ts">
  import { Progress } from 'sveltestrap';

  window.sender.on("state", (e : any, data : any) => {
    state = data[0]
  });
  window.sender.on("download-progress", (e : any, data: any) => {
    percent = data[0].percent
    total = (data[0].total / Math.pow(1024, 2)).toFixed(1)
    transferred = (data[0].transferred / Math.pow(1024, 2)).toFixed(1)
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
    {#if state === 'checking-app'}
      <small>Checking for App-Update ...</small>
    {:else if state === 'downloading-app'}
      <div id="progress" class="d-flex w-100 mt-1">
        <small class="mr-5">Downloading App-Update ...</small>
        <small class="ml-auto">{transferred} MBs / {total} MBs</small>
      </div>
      <Progress value={percent} width="100%" />
    {:else if state === 'update-downloaded-app'}
      <small>Installing App-Update ...</small>
    {:else if state === 'error-app'}
      <small>There was an error while Updating the App ...</small>
    
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
