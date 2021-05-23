<script lang="ts">
  import { Button, Card, CardBody, CardHeader } from "sveltestrap";
  const { ipcRenderer } = window.require("electron");

  export let id : string
  export let name : string
  let isSync = false

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

  ipcRenderer.on(`${id}`, (_e, connstate: boolean) => {
    isSync = connstate
  })
</script>

<Card class="my-2" inverse style="background: #0f2027">
  <CardHeader class="d-flex justify-content-between align-items-center">
    <b>{name}</b>
    <small class={`ml-auto ${isSync ? 'text-success' : 'text-danger'}`}>{isSync ? 'Sync' : 'offline'}</small>
  </CardHeader>
  <CardBody>
    <Button block class="w-100 mb-2" color={isSync ? 'success' : 'secondary'} on:click={sync}>Sync</Button>
    <Button block class="w-100" size="sm" color="dark" on:click={save}>Save</Button>
  </CardBody>
</Card>