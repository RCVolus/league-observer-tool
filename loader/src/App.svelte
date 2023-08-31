<script lang="ts">
  import { onMount } from "svelte";
  import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "sveltestrap";

  let open = false;
  const toggle = () => (open = !open);

  let patchNotes: string;
  let newVersion: string;

  window.sender.on("show-patch-notes", (e: any, sInfo: any) => {
    const info = JSON.parse(sInfo);

    patchNotes = info.releaseNotes;
    newVersion = info.version;

    toggle();
  });

  function installUpdate() {
    window.autoUpdater.installUpdate();
    toggle();
  }
  function skipUpdate() {
    window.autoUpdater.skipUpdate();
    toggle();
  }

  window.sender.on("state", (e: any, data: any) => {
    state = data[0];
  });
  window.sender.on("download-progress", (e: any, data: any) => {
    percent = data[0].percent;
    total = (data[0].total / Math.pow(1024, 2)).toFixed(1);
    transferred = (data[0].transferred / Math.pow(1024, 2)).toFixed(1);
  });

  let version = "5.0.0";

  onMount(async () => {
    version = await window.constants.getVersion();
  });

  let state = "checking";
  let percent = 0;
  let total = "0.0";
  let transferred = "0.0";
</script>

<div class="model">
  <Modal isOpen={open} fullscreen backdrop={false} scrollable>
    <ModalHeader controls={false} toggle={skipUpdate}>Update {newVersion}</ModalHeader>
    <ModalBody>
      {@html patchNotes}
    </ModalBody>
    <ModalFooter>
      <Button
        color="success"
        style="background-color: var(--bs-primary);"
        on:click={installUpdate}>Install Update</Button
      >
      <Button color="secondary" on:click={skipUpdate}>Skip Update</Button>
    </ModalFooter>
  </Modal>
</div>

<main class="p-4">
  <img src="./img/icon.png" alt="RCV Logo" width="75" class="mt-auto mb-3" />
  <p class="text-muted mb-1">Riot Community Volunteers</p>
  <h2 class="mb-1">League Observer Tool</h2>
  <p>Version: {version}</p>

  <div class="mt-auto w-100 text-center text-muted">
    {#if state === "checking-app"}
      <small>Checking for App-Update ...</small>
    {:else if state === "downloading-app"}
      <div id="progress" class="mt d-flex w-100 mt-1">
        <small class="mr-5">Downloading App-Update ...</small>
        <small class="ml-auto">{transferred} MBs / {total} MBs</small>
      </div>

      <div class="progress-bg">
        <div class="progress-bar" style="width: {percent}%;" />
      </div>
    {:else if state === "update-downloaded-app"}
      <small>Installing App-Update ...</small>
    {:else if state === "error-app"}
      <small>There was an error while Updating the App ...</small>
    {:else if state === "finished"}
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
    border-top: 6px solid var(--bs-primary);
  }

  .model {
    width: 100%;
    height: 100vh;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
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
    transition: width 0.15s ease;
  }
</style>
