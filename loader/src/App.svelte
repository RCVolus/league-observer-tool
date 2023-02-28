<script lang="ts">
  import { onMount } from "svelte";

  window.sender.on("state", (e : any, data : any) => {
    state = data[0]
  });
  window.sender.on("download-progress", (e : any, data: any) => {
    percent = data[0].percent
    total = (data[0].total / Math.pow(1024, 2)).toFixed(1)
    transferred = (data[0].transferred / Math.pow(1024, 2)).toFixed(1)
  });

  let version = '5.0.0'

  onMount(async () => {
    version = await window.constants.getVersion()
  })

  let state = 'checking' 
  let percent = 0
  let total = "0.0"
  let transferred = "0.0"
</script>

<main class="p-4">
  <img src="./img/icon.png" alt="RCV Logo" width="75" class="mt-auto mb-3">
  <p class="text-muted mb-1">Riot Community Volunteers</p>
  <h2 class="mb-1">League Observer Tool</h2>
  <p>Version: {version}</p>

  <div class="mt-auto w-100 text-center text-muted">
    {#if state === 'checking-app'}
      <small>Checking for App-Update ...</small>
    {:else if state === 'downloading-app'}
      <div id="progress" class="mt d-flex w-100 mt-1">
        <small class="mr-5">Downloading App-Update ...</small>
        <small class="ml-auto">{transferred} MBs / {total} MBs</small>
      </div>
      
      <div class="progress-bg">
        <div class="progress-bar" style="width: {percent}%;"></div>
      </div>
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

  .progress-bg {
    margin-top: auto;
    width: 100%;
    height: 20px;
    background-color: var(--dark-gray);
    position: relative;
  }

  .progress-bar {
    position: absolute;
    height: 100%;
    background: var(--bs-primary);
    background: linear-gradient(90deg, var(--bs-primary-dark) 0%, var(--bs-primary) 100%);
    transition: width 0.15s ease;
  }
</style>
