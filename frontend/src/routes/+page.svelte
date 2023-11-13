<script lang="ts">
  import { Accordion, AccordionItem } from "@skeletonlabs/skeleton";
</script>

<header id="hero" class="m-auto text-center">
  <div class="section-container">
    <img src="./icon.png" class="mx-auto mb-3" width="100" alt="" />
    <h6 class="h6 opacity-50">RCVolus</h6>
    <h1 class="h1 mb-2">League Observer Tool</h1>
    <h4 class="h4">Version: 7.0.0</h4>
  </div>
</header>

<div>
  <h3 class="h3 mb-3">Patch notes</h3>
  <Accordion autocollapse>
    <AccordionItem>
      <svelte:fragment slot="summary">Features</svelte:fragment>
      <svelte:fragment slot="content" />
    </AccordionItem>
    <AccordionItem>
      <svelte:fragment slot="summary">Updates</svelte:fragment>
      <svelte:fragment slot="content" />
    </AccordionItem>
    <AccordionItem>
      <svelte:fragment slot="summary">Bug Fixes</svelte:fragment>
      <svelte:fragment slot="content" />
    </AccordionItem>
  </Accordion>
</div>
