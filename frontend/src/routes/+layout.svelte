<script lang="ts">
  import "../app.postcss";
  import { AppShell } from "@skeletonlabs/skeleton";
  import { AppRail, AppRailAnchor } from "@skeletonlabs/skeleton";
  import Fa from "svelte-fa";
  import {
    faPowerOff,
    faHome,
    faCog,
    faPuzzlePiece,
    faClapperboard,
    faWindowRestore,
  } from "@fortawesome/free-solid-svg-icons";
  import Alerts from "$lib/Alerts.svelte";
  import FirstSetup from "$lib/FristSetup/FirstSetup.svelte";
  import { page } from "$app/stores";
  import { firstSetup } from "$lib/store";

  let currentTile: number = 0;
</script>

<!-- App Shell -->
<AppShell>
  <svelte:fragment slot="header">
    <Alerts />
  </svelte:fragment>
  <!-- (header) -->
  <svelte:fragment slot="sidebarLeft">
    <AppRail>
      <!-- --- -->
      <AppRailAnchor
        bind:group={currentTile}
        name="Home"
        value={0}
        title="Home"
        href="index.html"
        selected={$page.url.pathname.endsWith("index.html")}
      >
        <svelte:fragment slot="lead">
          <Fa icon={faHome} size="1.25x" />
        </svelte:fragment>
        <span>Home</span>
      </AppRailAnchor>
      <AppRailAnchor
        bind:group={currentTile}
        name="Modules"
        value={1}
        title="Modules"
        href="modules.html"
        selected={$page.url.pathname.endsWith("modules.html")}
      >
        <svelte:fragment slot="lead">
          <Fa icon={faPuzzlePiece} size="1.25x" />
        </svelte:fragment>
        <span>Modules</span>
      </AppRailAnchor>
      <AppRailAnchor
        bind:group={currentTile}
        name="UI Control"
        value={2}
        title="UI Control"
        href="ui.html"
        selected={$page.url.pathname.endsWith("ui.html")}
      >
        <svelte:fragment slot="lead">
          <Fa icon={faWindowRestore} size="1.25x" />
        </svelte:fragment>
        <span>UI Control</span>
      </AppRailAnchor>
      <AppRailAnchor
        bind:group={currentTile}
        name="Replay Control"
        value={3}
        title="Replay Control"
        href="replay.html"
        selected={$page.url.pathname.endsWith("replay.html")}
      >
        <svelte:fragment slot="lead">
          <Fa icon={faClapperboard} size="1.25x" />
        </svelte:fragment>
        <span>Replay Control</span>
      </AppRailAnchor>
      <!-- --- -->
      <svelte:fragment slot="trail">
        <AppRailAnchor
          bind:group={currentTile}
          name="Settings"
          value={10}
          title="Settings"
          href="settings.html"
          selected={$page.url.pathname.endsWith("settings.html")}
        >
          <svelte:fragment slot="lead">
            <Fa icon={faCog} size="1.25x" />
          </svelte:fragment>
          <span>Settings</span>
        </AppRailAnchor>

        <hr class="!border-t-2" />

        <AppRailAnchor name="Connect" title="Connect" on:click>
          <svelte:fragment slot="lead">
            <Fa icon={faPowerOff} size="1.5x" />
          </svelte:fragment>
          <span>Connect</span>
        </AppRailAnchor>
      </svelte:fragment>
    </AppRail>
  </svelte:fragment>
  <!-- (sidebarRight) -->
  <svelte:fragment slot="pageHeader" />
  <!-- Router Slot -->
  <div class="m-auto flex-col p-5 flex h-full">
    {#if $firstSetup}
      <FirstSetup />
    {/if}
    
    <slot />
  </div>
  <!-- ---- / ---- -->
  <!-- (pageFooter) -->
  <!-- (footer) -->
</AppShell>
