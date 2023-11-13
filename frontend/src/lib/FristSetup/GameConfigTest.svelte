<script lang="ts">
  import { Step, ProgressRadial } from "@skeletonlabs/skeleton";
  import Fa from "svelte-fa";
  import {
    faVial,
    faVialCircleCheck,
    faGears,
  } from "@fortawesome/free-solid-svg-icons";

  let testComplete = false;
  let testFailed = false;
  let testInProgress = false;

  let configsCanBeFixed = false;
  let setupInProgress = false;

  let testIssues: string[] = ["Test Problem v2"];

  function runTest() {
    testInProgress = true;
    setTimeout(() => {
      testInProgress = false;
      configsCanBeFixed = true;
    }, 1000 * 5);
  }

  function runConfigSetup() {
    setupInProgress = true;
    setTimeout(() => {
      setupInProgress = false;
      configsCanBeFixed = false;
      testComplete = true;
    }, 1000 * 5);
  }
</script>

<Step locked={!testComplete}>
  <svelte:fragment slot="header">Game Config Test</svelte:fragment>
  For the final step we will try to locate your game configuration files <br />
  and check if they include all the necessary settings
  <!-- ... -->
  {#if testFailed}
    <aside class="alert variant-ghost-error">
      <!-- Icon -->
      <div>
        <Fa icon={faVial} size="1.25x" />
      </div>
      <!-- Message -->
      <div class="alert-message">
        <h3 class="h3">Test Failed</h3>
        <b> Something went wrong! </b>
        <ol class="list mt-2">
          {#each testIssues as testIssue}
            <li>
              <span>-</span>
              <span>{testIssue}</span>
            </li>
          {/each}
        </ol>
      </div>
    </aside>
  {:else if configsCanBeFixed}
    <aside class="alert variant-ghost-warning">
      <!-- Icon -->
      <div>
        <Fa icon={faGears} size="1.25x" />
      </div>
      <!-- Message -->
      <div class="alert-message">
        <h3 class="h3">Configuration not complete!</h3>
        <p>
          Your configuration files are not complete,
          <b> but we can automatically set them up for you! </b>
        </p>
      </div>
      <!-- Actions -->
      <div class="alert-actions">
        <button
          type="button"
          on:click={runConfigSetup}
          disabled={setupInProgress}
          class="btn variant-filled"
        >
          {#if setupInProgress}
            <span>
              <ProgressRadial width="w-4" value={undefined} />
            </span>
          {/if}
          <span>Setup Config!</span>
        </button>
      </div>
    </aside>
  {:else if testComplete}
    <aside class="alert variant-ghost-success">
      <!-- Icon -->
      <div>
        <Fa icon={faVialCircleCheck} size="1.25x" />
      </div>
      <!-- Message -->
      <div class="alert-message">
        <h3 class="h3">Test Successful</h3>
        <p>You can continue the setup</p>
      </div>
    </aside>
  {:else}
    <aside class="alert variant-ghost-warning">
      <!-- Icon -->
      <div>
        <Fa icon={faVial} size="1.25x" />
      </div>
      <!-- Message -->
      <div class="alert-message">
        <p>Run Test!</p>
      </div>
      <!-- Actions -->
      <div class="alert-actions">
        <button
          type="button"
          on:click={runTest}
          disabled={testInProgress}
          class="btn variant-filled"
        >
          {#if testInProgress}
            <span>
              <ProgressRadial width="w-4" value={undefined} />
            </span>
          {/if}
          <span>Run!</span>
        </button>
      </div>
    </aside>
  {/if}
</Step>
