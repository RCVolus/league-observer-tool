<script lang="ts">
  import { Form, FormGroup, Input } from 'sveltestrap';
  import { store } from "../stores/Stores"; 
  import { AlertStore } from "../stores/Alert";

  const { Alert } = AlertStore

  async function saveSettings(e: SubmitEvent) {
    e.preventDefault()
    $store = await window.store.saveStore($store)
    
    $Alert = {
      color: 'success',
      text: 'Settings Save'
    }
  }
</script>

<div class="my-auto p-3 w-100">
  <Form validated={true} on:submit={(e) => saveSettings(e)}>
    <h2>Prod-Tool</h2>

    <FormGroup floating label="Prod-Tool-IP">
      <Input type="text" required placeholder="127.0.0.1" bind:value={$store['server-ip']} />
    </FormGroup>

    <FormGroup floating label="Prod-Tool-Port">
      <Input type="number" required min={1025} max={65535} placeholder="3003" bind:value={$store['server-port']} />
    </FormGroup>

    <FormGroup floating label="Prod-Tool-APi-Key">
      <Input type="password" placeholder="RCVPT-..." bind:value={$store['server-api-key']} />
    </FormGroup>

    <h2>League of Legends</h2>

    <FormGroup floating label="Live-Events-APi-Port">
      <Input type="number" required min={1025} max={65535} placeholder="34243" bind:value={$store['live-events-port']} />
    </FormGroup>

    <Input type="submit" class="w-100" value="Save Settings" />
  </Form>
</div>