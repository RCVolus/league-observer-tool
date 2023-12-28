<script lang="ts">
  import { alert } from "$lib/store";
  import Fa from "svelte-fa";
  import {
    faPlay,
    faCheckSquare,
    faSave,
    faFileImport,
    faFileExport,
    faUndo,
    faRemove,
  } from "@fortawesome/free-solid-svg-icons";

  let uiState: string[] = [];

  let uiOptions = [
    "interfaceAll",
    "interfaceReplay",
    "interfaceScore",
    "interfaceScoreboard",
    "interfaceFrames",
    "interfaceMinimap",
    "interfaceTimeline",
    "interfaceChat",
    "interfaceTarget",
    "interfaceQuests",
    "interfaceAnnounce",
    "interfaceKillCallouts",
    "interfaceNeutralTimers",
    "healthBarChampions",
    "healthBarStructures",
    "healthBarWards",
    "healthBarPets",
    "healthBarMinions",
  ];

  let actions: Map<string, string[]> = new Map();
  actions.set("Observer", [
    "interfaceAll",
    "healthBarChampions",
    "healthBarMinions",
    "healthBarStructures",
    "healthBarWards",
    "interfaceNeutralTimers",
    "interfaceScoreboard",
  ]);
  actions.set("Cinematics", []);

  let actionName = "";

  function addAction(e: Event) {
    e.preventDefault();
    if (actionName === "") return;
    actions.set(actionName, uiState);
    actions = actions;
    actionName = "";
  }

  function deleteAction(action: string) {
    actions.delete(action);
    actions = actions;
    uiState = [];
  }

  function updateAction(action: string) {
    actions.set(action, uiState);
    actions = actions;
  }

  function showSelection(action: string) {
    if (actions.has(action)) {
      uiState = actions.get(action)!;
    } else {
      $alert = {
        color: "error",
        title: "Action not found",
        message: "Action could not be executed!",
      };
    }
  }

  function execAction(action: string) {
    if (action === "selection") {
      // exec current selection
    } else if (actions.has(action)) {
      // exec action
    } else {
      $alert = {
        color: "error",
        title: "Action not found",
        message: "Action could not be executed!",
      };
    }
  }
</script>

<h1 class="h3 mb-3">UI Control</h1>

<form on:submit={addAction}>
  <div class="grid grid-cols-2 gap-4">
    <div class="col-span-1">
      <select class="select" required size={14} multiple bind:value={uiState}>
        {#each uiOptions as uiOption}
          <option value={uiOption}>{uiOption}</option>
        {/each}
      </select>
    </div>
    <div class="col-span-1">
      <h3 class="h3 mb-3">Observer UI</h3>
      <div class="flex w-full justify-stretch">
        <button
          class="btn w-full variant-filled-primary rounded-none"
          on:click={() => execAction("Observer")}
        >
          <span><Fa icon={faPlay} /></span>
          <span>Setup for Observer</span>
        </button>
        <button
          class="btn w-full variant-filled-surface rounded-none"
          on:click={() => showSelection("Observer")}
        >
          <span><Fa icon={faCheckSquare} /></span>
          <span>Show selection</span>
        </button>
        <button
          class="btn w-full variant-filled-surface rounded-none"
          on:click={() => updateAction("Observer")}
        >
          <span><Fa icon={faSave} /></span>
          <span>Save selection</span>
        </button>
      </div>
      <div class="flex w-full justify-stretch">
        <button class="btn w-full variant-filled-surface rounded-none">
          <span><Fa icon={faFileImport} /></span>
          <span>Import selection</span>
        </button>
        <button class="btn w-full variant-filled-surface rounded-none">
          <span><Fa icon={faFileExport} /></span>
          <span>Export selection</span>
        </button>
        <button class="btn w-full variant-filled-error rounded-none">
          <span><Fa icon={faUndo} /></span>
          <span>Restore Default</span>
        </button>
      </div>

      <hr class="my-3 !border-t-2" />

      <h3 class="h3 mb-3">Cinematic UI</h3>
      <div class="flex w-full justify-stretch">
        <button
          class="btn w-full variant-filled-primary rounded-none"
          on:click={() => execAction("Cinematics")}
        >
          <span><Fa icon={faPlay} /></span>
          <span>Setup for Cinematics</span>
        </button>
        <button
          class="btn w-full variant-filled-surface rounded-none"
          on:click={() => showSelection("Cinematics")}
        >
          <span><Fa icon={faCheckSquare} /></span>
          <span>Show selection</span>
        </button>
        <button
          class="btn w-full variant-filled-surface rounded-none"
          on:click={() => updateAction("Cinematics")}
        >
          <span><Fa icon={faSave} /></span>
          <span>Save selection</span>
        </button>
      </div>
      <div class="flex w-full justify-stretch">
        <button class="btn w-full variant-filled-surface rounded-none">
          <span><Fa icon={faFileImport} /></span>
          <span>Import selection</span>
        </button>
        <button class="btn w-full variant-filled-surface rounded-none">
          <span><Fa icon={faFileExport} /></span>
          <span>Export selection</span>
        </button>
        <button class="btn w-full variant-filled-error rounded-none">
          <span><Fa icon={faUndo} /></span>
          <span>Restore Default</span>
        </button>
      </div>

      <hr class="my-3 !border-t-2" />

      {#if actions.size > 0}
        {#each actions as [action]}
          {#if action !== "Observer" && action !== "Cinematics"}
            <h3 class="h3 mb-3">{action} UI</h3>
            <div class="flex w-full justify-stretch">
              <button
                class="btn w-full variant-filled-primary rounded-none"
                on:click={() => execAction(action)}
              >
                <span><Fa icon={faPlay} /></span>
                <span>Setup for {action}</span>
              </button>
              <button
                class="btn w-full variant-filled-surface rounded-none"
                on:click={() => showSelection(action)}
              >
                <span><Fa icon={faCheckSquare} /></span>
                <span>Show selection</span>
              </button>
              <button
                class="btn w-full variant-filled-surface rounded-none"
                on:click={() => updateAction(action)}
              >
                <span><Fa icon={faSave} /></span>
                <span>Save selection</span>
              </button>
            </div>
            <div class="flex w-full justify-stretch">
              <button class="btn w-full variant-filled-surface rounded-none">
                <span><Fa icon={faFileExport} /></span>
                <span>Export selection</span>
              </button>
              <button
                class="btn w-full variant-filled-error rounded-none"
                on:click={() => deleteAction(action)}
              >
                <span><Fa icon={faRemove} /></span>
                <span>Delete {action}</span>
              </button>
            </div>

            <hr class="my-3 !border-t-2" />
          {/if}
        {/each}
      {/if}

      <label class="label mb-2">
        <span>Action Name</span>
        <input
          class="input rounded-none"
          bind:value={actionName}
          type="text"
          required
          placeholder="Action..."
        />
      </label>
      <div class="flex w-full justify-stretch">
        <button
          type="submit"
          class="btn w-full variant-filled-primary rounded-none"
        >
          <span><Fa icon={faSave} /></span>
          <span>New Actions</span>
        </button>
        <button class="btn w-full variant-filled-surface rounded-none">
          <span><Fa icon={faFileImport} /></span>
          <span>Import selection</span>
        </button>
      </div>

      <hr class="my-3 !border-t-2" />

      <button
        type="button"
        class="btn w-full variant-filled-primary rounded-none"
        on:click={() => execAction("selection")}>Setup using Selected</button
      >
    </div>
  </div>
</form>
