
<script>
import currentProjectsData from "$lib/../jsons/current_projects.json";
import CurrentCard from "$lib/components/CurrentCard.svelte";
import projectsData from "$lib/../jsons/projects.json";
import ProjectCard from "$lib/components/ProjectCard.svelte";
</script>

# Current Projects

<div class="current-grid">
  {#each currentProjectsData.current_projects as project}
    <CurrentCard
      title={project.title}
      description={project.description}
    />
  {/each}
</div>

# Past Projects

<div class="projects-grid">
  {#each projectsData.projects as project}
    <ProjectCard
      image={project.image}
      title={project.title}
      description={project.description}
      shortDescription={project.shortDescription}
      techStack={project.techStack}
      link={project.link}
      skills={project.skills}
      additionalImages={project.additionalImages}
      links={project.links}
      date={project.date}
    />
  {/each}
</div>

<style>
  .current-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    max-width: 700px;
    margin: 1.5rem auto 3rem;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-top: 1.5rem;
  }

  @media (max-width: 768px) {
    .current-grid,
    .projects-grid {
      grid-template-columns: 1fr;
    }
  }
</style>



# Quick Summary

| Project | Description | Tools/Technologies |
|---------|-------------|-------------------|
| SteerClear | Safety app for walking at night using crowdsourced data | Expo, React Native, Supabase, MapBox, OpenAI |
| TrashCash | Mobile app incentivizing proper waste disposal | Flutter, Supabase, IoT, C++, Esp32 |
| Apple Canada Remittance | Revamp existing apple remittance process for Planes | Power Automate |
| Harvard's CS50 | Taking Harvard's introductory computer science course | C, Python, SQL |
| Student Health Tracker | Location based early diagnosis and health education tool | Flutter, Supabase, Serverless |
| Inflectors Project | CIA Pilot Game, cryptography puzzles | Cryptography techniques |
| Project Torch | Develop websites for local businesses in blacksburg | React, Javascript, Supabase |
| RoomReady | Connect locals and travelers, with AI suggestions | Flutter, Supabase, ChatGPT |
| Website Creation | Create Website in Markdown with some HTML | Markdown, Obsidian |
| AdaptiveSpec Logistics | Web scraper and data storage | Scrapy, Python, Supabase |
| Archimedes | Microsoft Imagine Cup | Flutter |
| SeeFood | AI Cooking Assistant in Unity MR | Unity, MR, ChatGPT |
| Planes SWE | RPA, Python Scripting + APIs, Power Platform | RPA, Python, APIs |
| Sprklii LLC | Date ideas personalized | Flutter, Supabase |
| Robot-X | FTC Robotics | OpenCV, Java, Odometry |
| Planes IT Intern | WTT App and SOP Sharepoint | Power Platform |
| Automatic Garage Closer | Arduino project | C++ |
| Kids Like Food 2 | Food Blog | HTML, CSS, JS |