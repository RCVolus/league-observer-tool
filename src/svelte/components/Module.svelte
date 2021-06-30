<script lang="ts">
  import { Button, Card, CardBody, CardHeader, Icon } from "sveltestrap";
  const { ipcRenderer } = window.require("electron");
  import { activeModules } from "../stores/Stores";
  import { ConnectionStore } from "../stores/Connector"; 

  const {isConnected, isPending} = ConnectionStore

  export let id : string
  export let name : string
  export let actions : [string, string][]
  let isSync = $activeModules[id] || false

  function sync () {
    if (!isSync) {
      ipcRenderer.send(`${id}-start`)
    } else {
      ipcRenderer.send(`${id}-stop`)
    }
  }

  function save () {
    ipcRenderer.send(`${id}-save`)
  }

  function callAction (action: string) {
    ipcRenderer.send(`${id}-${action}`)
  }

  ipcRenderer.on(`${id}`, (_e, connstate: boolean) => {
    isSync = connstate
    activeModules.update(m => {
      m[id] = connstate
      return m
    })
  })
</script>

<Card class={`my-3 ${isSync ? 'border-success' : ''}`} color="dark">
  <CardHeader class="d-flex justify-content-between align-items-center">
    <small class={isSync ? 'text-success' : 'text-danger'}>{isSync ? 'Sync' : 'Offline'}</small>
    <Button block class="ml-auto" size="sm" color="dark" on:click={save} disabled={!$isConnected || $isPending}>
      <Icon name="file-earmark-post-fill" />
    </Button>
  </CardHeader>
  <CardBody>
    <h3 class="mb-3 text-center">{name}</h3>
    <Button block class="w-100 mb-2" color={isSync ? 'success' : 'primary'} on:click={sync} disabled={!$isConnected || $isPending}>Sync</Button>
    {#each actions as action}
      <Button block class="w-100 mb-2" color='secondary' on:click={() => {
        callAction(action[0])
      }} disabled={!$isConnected || $isPending}>{action[1]}</Button>
    {/each}
  </CardBody>
</Card>