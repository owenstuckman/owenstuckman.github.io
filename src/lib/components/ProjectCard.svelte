<script>
    import { onMount } from "svelte";
    import { fade, scale } from "svelte/transition";
  
    export let image = "";
    export let title = "";
    export let description = "";
    export let shortDescription = ""; // Added shortDescription
    export let techStack = [];
    export let link = "";
    export let links = []; // Array of additional links
    export let expanded = false;
    export let size = "medium"; // Can be "small", "medium", or "large"
    export let skills = []; // Add skills prop
    export let additionalImages = []; // Array of additional images
    export let date = ""; // Add date prop
    
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
        width: "450px", // Increased from 400px
        height: "180px"  // Increased from 150px
      },
      medium: {
        width: "650px", // Increased from 600px
        height: "280px"  // Increased from 250px
      },
      large: {
        width: "850px", // Increased from 800px
        height: "330px"  // Increased from 300px
      }
    }[size];
  </script>
  
  <style>
    .card {
      position: relative;
      width: 100%;
      cursor: pointer;
      overflow: hidden;
      border-radius: 14px; /* Slightly larger radius */
      transition: all 0.2s ease-in-out;
      margin: 0 auto;
      background: white;
      border: 1px solid #e5e7eb;
    }
  
    .card:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  
    .image-container {
      width: 100%;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      border-radius: 14px 14px 0 0;
      filter: grayscale(100%);
    }

    .card:hover .image-container {
      filter: grayscale(0%);
    }
  
    .content {
      padding: 24px; /* Increased from 20px */
    }

    .title {
      font-size: 1.7rem; /* Increased from 1.5rem */
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 10px; /* Increased from 8px */
    }

    .short-description {
      color: #4b5563;
      font-size: 1.15rem; /* Increased from 1rem */
      line-height: 1.5;
    }

    .description-preview {
      color: #4b5563;
      font-size: 1.05rem; /* Increased from 0.9rem */
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-top: 10px; /* Increased from 8px */
    }
  
    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 95%;
      max-width: 1100px; /* Increased from 1000px */
      background: #121212;
      padding: 45px; /* Increased from 40px */
      border-radius: 14px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
      color: white;
      max-height: 90vh;
      overflow-y: auto;
      z-index: 1000;
      font-size: 1.15rem; /* Added larger base font size */
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }
  
    .close-btn {
      position: absolute;
      top: 20px;
      right: 25px;
      cursor: pointer;
      font-size: 28px; /* Increased from 24px */
    }
  
    .tech-icons {
      display: flex;
      gap: 14px; /* Increased from 12px */
      margin-top: 24px; /* Increased from 20px */
    }
  
    .tech-icons img {
      width: 38px; /* Increased from 32px */
      height: 38px; /* Increased from 32px */
    }

    .links-container {
      margin-top: 24px; /* Increased from 20px */
    }

    .links-container a {
      display: block;
      color: cyan;
      margin-bottom: 10px; /* Increased from 8px */
      font-size: 1.15rem; /* Added larger font size */
    }

    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px; /* Increased from 8px */
      margin-bottom: 24px; /* Increased from 20px */
    }

    .skill-tag {
      background: rgba(255, 255, 255, 0.1);
      padding: 6px 14px; /* Increased from 4px 12px */
      border-radius: 18px; /* Increased from 16px */
      font-size: 1.05rem; /* Increased from 0.9rem */
      color: #fff;
    }

    .additional-images {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* Increased from 200px */
      gap: 18px; /* Increased from 16px */
      margin-top: 28px; /* Increased from 24px */
    }

    .additional-images img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 10px;
    }

    .date {
      color: #888;
      font-size: 1.05rem; /* Increased from 0.9rem */
      margin-top: -10px; /* Adjusted from -8px */
      margin-bottom: 18px; /* Increased from 16px */
    }
  </style>
  
  <div 
    class="card" 
    on:click={toggleExpand}
    style="max-width: {cardDimensions.width};"
  >
    {#if image}
      <div 
        class="image-container" 
        style="
          background-image: url('{image}');
          height: {cardDimensions.height};
        "
      ></div>
    {/if}
    <div class="content">
      <div class="title">{title}</div>
      <div class="short-description">{shortDescription}</div>
      {#if !image}
        <div class="description-preview">{description}...</div>
      {/if}
    </div>
  </div>
  
  {#if expanded}
    <div class="modal-overlay" on:click={toggleExpand} transition:fade></div>
    <div class="modal" transition:scale>
      <span class="close-btn" on:click={toggleExpand}>✖</span>
      <h2>{title}</h2>
      {#if date}
        <div class="date">{date}</div>
      {/if}

      {#if skills && skills.length > 0}
        <div class="skills-container">
          {#each skills as skill}
            <span class="skill-tag">{skill}</span>
          {/each}
        </div>
      {/if}

      <p>{description}</p>
  
      {#if techStack.length > 0}
        <div class="tech-icons">
          {#each techStack as tech}
            <img src={tech} alt="Tech Icon" />
          {/each}
        </div>
      {/if}
  
      <div class="links-container">
        {#if link}
          <a href={link} target="_blank">View Project</a>
        {/if}
        {#each links as additionalLink}
          <a href={additionalLink} target="_blank">{additionalLink}</a>
        {/each}
      </div>

      {#if additionalImages && additionalImages.length > 0}
        <div class="additional-images">
          {#each additionalImages as imgSrc}
            <img src={imgSrc} alt="Additional project image" />
          {/each}
        </div>
      {/if}
    </div>
  {/if}