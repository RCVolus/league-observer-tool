<script lang="ts">
  import { Step, ProgressRadial } from "@skeletonlabs/skeleton";
  import Fa from "svelte-fa";
  import { faVial, faVialCircleCheck } from "@fortawesome/free-solid-svg-icons";

  let testComplete = false;
  let testFailed = false;
  let testInProgress = false;

  let testIssues: string[] = ["Test Problem v2"];

  function runTest() {
    testInProgress = true;
    setTimeout(() => {
      testInProgress = false;
      testComplete = true;
    }, 1000 * 5);
  }
</script>

<Step locked={!testComplete}>
  <svelte:fragment slot="header">Testing</svelte:fragment>
  The setup is complete! Now we will try to connect to you League of Legends Client,
  the Game and the Prod-Tool. <br />
  For this to work Please make sure your Prod-Tool and your LoL-Client are running
  and open up an old Replay of a Game or spectate someone playing.
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
        <b>
          Something went wrong please check all setting and that you have all
          programmes running and try again!
        </b>
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
          disabled={testInProgress || testComplete}
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
