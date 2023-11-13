<script lang="ts">
  import { Table, tableMapperValues } from "@skeletonlabs/skeleton";
  import type { TableSource } from "@skeletonlabs/skeleton";
  import { TabGroup, Tab } from "@skeletonlabs/skeleton";
  import Fa from "svelte-fa";
  import {
    faWindowMaximize,
    faGamepad,
  } from "@fortawesome/free-solid-svg-icons";

  const sourceData = [
    { position: 1, name: "Hydrogen", weight: 1.0079, symbol: "H" },
    { position: 2, name: "Helium", weight: 4.0026, symbol: "He" },
    { position: 3, name: "Lithium", weight: 6.941, symbol: "Li" },
    { position: 4, name: "Beryllium", weight: 9.0122, symbol: "Be" },
    { position: 5, name: "Boron", weight: 10.811, symbol: "B" },
  ];

  const tableSimple: TableSource = {
    // A list of heading labels.
    head: ["Name", "Description", "Actions"],
    // The data visibly shown in your table body UI.
    body: tableMapperValues(sourceData, ["name", "description", "actions"]),
  };

  let tabSet: number = 0;
</script>

<h1 class="h3 mb-3">Modules</h1>

<TabGroup>
  <Tab bind:group={tabSet} name="Client" value={0}>
    <div class="flex items-center">
      <Fa icon={faWindowMaximize} size="1x" />
      <span class="ml-2">Client</span>
    </div>
  </Tab>
  <Tab bind:group={tabSet} name="Game" value={1}>
    <div class="flex items-center">
      <Fa icon={faGamepad} size="1x" />
      <span class="ml-2">Game</span>
    </div>
  </Tab>
  <!-- Tab Panels --->
  <svelte:fragment slot="panel">
    {#if tabSet === 0}
      <Table source={tableSimple} interactive={true} />
    {:else if tabSet === 1}
      <Table source={tableSimple} interactive={true} />
    {/if}
  </svelte:fragment>
</TabGroup>
