<script>
    import { fade, scale } from "svelte/transition";
    import { createEventDispatcher } from 'svelte';

    export let image = "";
    export let title = "";
    export let description = "";
    export let shortDescription = "";
    export let techStack = [];
    export let link = "";
    export let links = [];
    export let expanded = false;
    export let skills = [];
    export let additionalImages = [];
    export let date = "";

    const dispatch = createEventDispatcher();

    function toggleExpand() {
      expanded = !expanded;
      if (expanded) {
        dispatch('expand');
      }
    }

    function extractLinkName(url) {
      try {
        const hostname = new URL(url).hostname.replace('www.', '');
        if (hostname.includes('github.com')) return 'GitHub';
        if (hostname.includes('devpost.com')) return 'Devpost';
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'YouTube';
        if (hostname.includes('linkedin.com')) return 'LinkedIn';
        if (hostname.includes('figma.com')) return 'Figma';
        return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
      } catch {
        return 'Link';
      }
    }
  </script>
  
  
  <div 
    class="card" 
    on:click={toggleExpand}
  >
    {#if image}
      <div
        class="image-container"
        style="background-image: url('{image}');"
      ></div>
    {:else}
      <div class="image-container image-placeholder">
        <span class="placeholder-icon">📁</span>
      </div>
    {/if}
    <div class="content">
      <div class="title">{title}</div>
      <div class="short-description">{shortDescription}</div>
      <div class="short-description">{date}</div>
      {#if !image}
        <div class="description-preview">{description}...</div>
      {/if}
    </div>
  </div>
  
  {#if expanded}
    <div class="modal-overlay" on:click={toggleExpand} transition:fade></div>
    <div class="modal" transition:scale>
      <span class="close-btn" on:click={toggleExpand}>✖</span>

      <div class="modal-header">
        {#if image}
          <div class="modal-image">
            <img src={image} alt={title} />
          </div>
        {/if}
        <div class="modal-title-section">
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
        </div>
      </div>

      <div class="modal-body">
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
            <a href={link} target="_blank" class="link-pill">View Project</a>
          {/if}
          {#each links as additionalLink}
            {#if additionalLink && !additionalLink.includes('Private') && !additionalLink.includes('Archived') && !additionalLink.includes('Contact') && !additionalLink.includes('Lost') && additionalLink.startsWith('http')}
              <a href={additionalLink} target="_blank" class="link-pill">{extractLinkName(additionalLink)}</a>
            {:else if additionalLink && !additionalLink.startsWith('http')}
              <span class="link-pill link-disabled">{additionalLink}</span>
            {/if}
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
    </div>
  {/if}

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
      height: 200px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      border-radius: 14px 14px 0 0;
      filter: grayscale(100%);
      transition: filter 0.2s ease-in-out;
    }

    .image-placeholder {
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      filter: none;
    }

    .placeholder-icon {
      font-size: 2.5rem;
      opacity: 0.4;
    }

    .card:hover .image-container {
      filter: grayscale(0%);
    }

    .card:hover .image-placeholder {
      filter: none;
    }
  
    .content {
      padding: 24px; /* Increased from 20px */
    }

    .title {
      font-size: 1.6rem; 
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
      max-width: 900px;
      background: #121212;
      padding: 40px;
      border-radius: 14px;
      box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.5);
      color: white;
      max-height: 90vh;
      overflow-y: auto;
      z-index: 1000;
      font-size: 1.1rem;
    }

    .modal-header {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      align-items: flex-start;
    }

    .modal-image {
      flex-shrink: 0;
      width: 160px;
      height: 160px;
      border-radius: 12px;
      overflow: hidden;
      background: #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .modal-title-section {
      flex: 1;
    }

    .modal-title-section h2 {
      margin: 0 0 8px 0;
      font-size: 1.8rem;
      line-height: 1.2;
    }

    .modal-body p {
      line-height: 1.7;
      color: #e0e0e0;
      margin-bottom: 20px;
    }

    .link-disabled {
      opacity: 0.5;
      cursor: default;
    }

    .link-disabled:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #A8DAE5;
    }

    @media (max-width: 600px) {
      .modal-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .modal-image {
        width: 120px;
        height: 120px;
      }

      .skills-container {
        justify-content: center;
      }
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
      margin-top: 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .link-pill {
      display: inline-block;
      background: rgba(255, 255, 255, 0.1);
      color: #A8DAE5;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.2s ease-in-out;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .link-pill:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
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