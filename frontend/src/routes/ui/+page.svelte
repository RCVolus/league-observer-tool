<script lang="ts">
  import { alert } from "$lib/store";

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
    e.preventDefault()
    if (actionName === "") return;
    actions.set(actionName, uiState);
    actions = actions;
    actionName = "";
  }

  function deleteAction(action: string) {
    actions.delete(action);
    actions = actions;
    uiState = []
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
      <select class="select" required size={20} multiple bind:value={uiState}>
        {#each uiOptions as uiOption}
          <option value={uiOption}>{uiOption}</option>
        {/each}
      </select>
    </div>
    <div class="col-span-1">
      <button
        type="button"
        class="btn w-full variant-filled-primary rounded-none"
        on:click={() => execAction("selection")}>Setup using Selected</button
      >

      <hr class="my-3 !border-t-2" />

      <button
        type="button"
        class="btn variant-ghost-primary w-full rounded-none"
        on:click={() => execAction("Observer")}>Setup for Observer</button
      >
      <button
        type="button"
        class="btn variant-ghost-surface w-full rounded-none"
        on:click={() => showSelection("Observer")}
        >Show selection for Observer</button
      >
      <button
        type="button"
        class="btn variant-ghost-warning w-full rounded-none"
        on:click={() => updateAction("Observers")}
        >Save selection for Observer</button
      >
      <button type="button" class="btn variant-ghost-error w-full rounded-none"
        >Restore Observer</button
      >

      <hr class="my-3 !border-t-2" />

      <button
        type="button"
        class="btn variant-ghost-primary w-full rounded-none"
        on:click={() => execAction("Cinematics")}>Setup for Cinematics</button
      >
      <button
        type="button"
        class="btn variant-ghost-surface w-full rounded-none"
        on:click={() => showSelection("Cinematics")}
        >Show selection for Cinematics</button
      >
      <button
        type="button"
        class="btn variant-ghost-warning w-full rounded-none"
        on:click={() => updateAction("Cinematics")}
        >Save selection for Cinematics</button
      >
      <button type="button" class="btn variant-ghost-error w-full rounded-none"
        >Restore Cinematics</button
      >

      <hr class="my-3 !border-t-2" />

      {#if actions.size > 0}
        {#each actions as [action]}
          {#if action !== "Observer" && action !== "Cinematics"}
            <button
              type="button"
              class="btn variant-ghost-primary w-full rounded-none"
              on:click={() => execAction(action)}>Setup for {action}</button
            >
            <button
              type="button"
              class="btn variant-ghost-surface w-full rounded-none"
              on:click={() => showSelection(action)}
              >Show selection for {action}</button
            >
            <button
              type="button"
              class="btn variant-ghost-warning w-full rounded-none"
              on:click={() => updateAction(action)}
              >Save selection for {action}</button
            >
            <button
              type="button"
              class="btn variant-ghost-error w-full rounded-none"
              on:click={() => deleteAction(action)}>Delete {action}</button
            >
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
      <button
        type="submit"
        class="btn variant-ghost-warning w-full rounded-none"
        >Save selection for new Actions</button
      >
    </div>
  </div>
</form>
