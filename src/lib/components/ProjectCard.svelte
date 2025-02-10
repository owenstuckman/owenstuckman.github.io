<script>
    import { onMount } from "svelte";
    import { fade, scale } from "svelte/transition";
  
    export let image = "";
    export let title = "";
    export let description = "";
    export let techStack = [];
    export let link = "";
    export let expanded = false;
    export let size = "medium"; // Can be "small", "medium", or "large"
    
    // Dispatch event when expanded changes so parent can handle closing others
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
  
    function toggleExpand() {
      expanded = !expanded;
      if (expanded) {
        dispatch('expand');
      }
    }

    // Get card dimensions based on size
    $: cardDimensions = {
      small: {
        width: "400px",
        height: "250px"
      },
      medium: {
        width: "600px", 
        height: "400px"
      },
      large: {
        width: "800px",
        height: "500px"
      }
    }[size];
  </script>
  
  <style>
    .card {
      position: relative;
      width: 100%;
      cursor: pointer;
      overflow: hidden;
      border-radius: 12px;
      transition: all 0.2s ease-in-out;
      margin: 0 auto;
      filter: grayscale(100%);
    }
  
    .card:hover {
      transform: scale(1.02);
      filter: grayscale(0%);
    }
  
    .image-container {
      width: 100%;
      height: 100%;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      border-radius: 12px;
    }
  
    .overlay {
      position: absolute;
      bottom: 0;
      width: 100%;
      background: rgba(0, 0, 0, 0.6);
      padding: 20px;
      text-align: center;
      color: white;
      font-size: 1.5rem;
    }
  
    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 95%;
      max-width: 1000px;
      background: #121212;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
      color: white;
      max-height: 90vh;
      overflow-y: auto;
    }
  
    .close-btn {
      position: absolute;
      top: 20px;
      right: 25px;
      cursor: pointer;
      font-size: 24px;
    }
  
    .tech-icons {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }
  
    .tech-icons img {
      width: 32px;
      height: 32px;
    }
  </style>
  
  <div 
    class="card" 
    on:click={toggleExpand}
    style="max-width: {cardDimensions.width};"
  >
    <div 
      class="image-container" 
      style="
        background-image: url('{image}');
        height: {cardDimensions.height};
      "
    ></div>
    <div class="overlay">{title}</div>
  </div>
  
  {#if expanded}
    <div class="modal" transition:scale>
      <span class="close-btn" on:click={toggleExpand}>✖</span>
      <h2>{title}</h2>
      <p>{description}</p>
  
      {#if techStack.length > 0}
        <div class="tech-icons">
          {#each techStack as tech}
            <img src={tech} alt="Tech Icon" />
          {/each}
        </div>
      {/if}
  
      {#if link}
        <p><a href={link} target="_blank" style="color: cyan;">View Project</a></p>
      {/if}
    </div>
  {/if}