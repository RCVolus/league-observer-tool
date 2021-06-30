<script lang="ts">
  import { Icon, Spinner } from "sveltestrap";
  import { ConnectionStore } from "../../stores/Connector"; 

  const {isConnected, isPending} = ConnectionStore
  
  function handleConnection () {
    if ($isPending) return

    if ($isConnected) ConnectionStore.disconnect()
    else ConnectionStore.connect()
  }
</script>

<div class="navconnect" class:connected={$isConnected} class:pending={$isPending} on:click={handleConnection} >
  <span>
    {#if $isPending}
      <Spinner type="border" style="border-width: .10em" class="mt-1"></Spinner>
    {:else}
      <Icon name="power"></Icon>
    {/if}
  </span>
</div>

<style>
  .navconnect {
    position: absolute;
    z-index: 5;
    top: 0;
    left: 50%;
    transform: translate(-50%, -60%);
    width: 70px;
    height: 70px;
    background: rgb(255,95,147);
    background: radial-gradient(circle, rgba(255,95,147,1) 25%, rgba(185,72,109,1) 100%);
    box-shadow: 0 0 15px rgb(185,72,109, 0.75);
    border-radius: 50%;
    transition: all 0.3s ease;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 25px;
    cursor: pointer;
  }

  .navconnect:hover {
    box-shadow: 0 0 20px rgb(185,72,109, 1);
  }

  .connected {
    background: rgb(0,255,182);
    background: radial-gradient(circle, rgba(0,255,182,1) 25%, rgba(0,184,132,1) 100%);
    box-shadow: 0 0 15px rgb(0,184,132, 0.75);
    color: black;
  }

  .connected:hover {
    box-shadow: 0 0 20px rgb(0,184,132, 1);
  }

  .pending {
    background: rgb(204,204,204);
    background: radial-gradient(circle, rgba(204,204,204,1) 15%, rgba(119,119,119,1) 100%);
    box-shadow: 0 0 15px rgb(119,119,119, 0.75);
    color: black;
    pointer-events: none;
    cursor: not-allowed;
  }
</style>