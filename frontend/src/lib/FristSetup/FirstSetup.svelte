<script lang="ts">
  import { Stepper, Step } from "@skeletonlabs/skeleton";
  import SetupTest from "./SetupTest.svelte";
  import GameConfigTest from "./GameConfigTest.svelte";
  import { firstSetup, alert } from "$lib/store";

  let setup = {
    "pt-ip": "127.0.0.1",
    "pt-port": 3003,
    "pt-key": "",
    "live-events-port": 1025,
  };

  function onCompleteHandler() {
    $firstSetup = false
    $alert = {
      color: 'success',
      title: 'First Setup Completed',
      message: 'Settings have been saved'
    }
  }
</script>

<div class="mb-5">
  <Stepper on:complete={onCompleteHandler}>
    <Step>
      <svelte:fragment slot="header">First Setup!</svelte:fragment>
      This Setup is meant to help you set up this tool and all necessary connections
      and settings for League of Legends
    </Step>
    <Step>
      <svelte:fragment slot="header"
        >Prod-Tool Connection Settings</svelte:fragment
      >
      Setup Your Prod-Toolkit IP-Address
      <label class="label">
        <input
          class="input"
          type="text"
          required
          placeholder="127.0.0.1"
          bind:value={setup["pt-ip"]}
        />
      </label>
    </Step>
    <Step>
      <svelte:fragment slot="header"
        >Prod-Tool Connection Settings</svelte:fragment
      >
      Setup Your Prod-Toolkit Port
      <label class="label">
        <input
          class="input"
          type="number"
          min="1025"
          step="1"
          max="65535"
          required
          placeholder="3003"
          bind:value={setup["pt-port"]}
        />
      </label>
    </Step>
    <Step>
      <svelte:fragment slot="header"
        >Prod-Tool Connection Settings</svelte:fragment
      >
      Setup Your Prod-Toolkit API Key
      <label class="label">
        <input
          class="input"
          type="text"
          placeholder="RCVPT-..."
          bind:value={setup["pt-key"]}
        />
      </label>
    </Step>
    <!-- ... -->
    <Step>
      <svelte:fragment slot="header">League Settings</svelte:fragment>
      Setup Your League Live Events Port
      <label class="label">
        <input
          class="input"
          type="number"
          min="1025"
          step="1"
          max="65535"
          required
          placeholder="1025"
          bind:value={setup["live-events-port"]}
        />
      </label>
    </Step>
    <!-- ... -->
    <SetupTest />
    <!-- ... -->
    <GameConfigTest />
    <!-- ... -->
    <Step locked={false}>
      <svelte:fragment slot="header">Finish!</svelte:fragment>
      Thats all! Your observer Tool is ready ro use now
    </Step>
    <!-- ... -->
  </Stepper>
  <hr class="mt-5" />
</div>
