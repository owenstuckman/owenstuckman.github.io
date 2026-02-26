<script>
import currentProjectsData from "$lib/../jsons/current_projects.json";
import CurrentCard from "$lib/components/CurrentCard.svelte";
import projectsData from "$lib/../jsons/projects.json";
import ProjectCard from "$lib/components/ProjectCard.svelte";
</script>

# Owen Stuckman

<div id="about">

## About

I'm an undergraduate studying computer science with a minor in cybersecurity at Virginia Tech.

My professional interest is currently focused on automation — be it cloud-based or desktop-based robotic process automation. I enjoy creating and improving systems so people can spend time on things that matter rather than on inefficiencies or manual analog processes.

I've worked across multiple industries including moving and storage, consumer packaged goods, small business food, hospitality, and more.

In my free time, I like to run, play spikeball and pickleball, work on my personal projects and businesses, and backpack.

### Tech (TLDR):
- Dart with **Flutter**
- **Supabase** (PostgreSQL) for Auth, DB, Storage, and Serverless
- Webapps with **Svelte** and React
- **Python**, Java, C++, C# across a wide variety of applications
- Microsoft **Power Platform**
- OpenCV Computer Vision
- *Whatever I need to learn for a project*

</div>

---

<div id="projects">

## Current Projects

<div class="current-grid">
  {#each currentProjectsData.current_projects as project}
    <CurrentCard
      title={project.title}
      description={project.description}
    />
  {/each}
</div>

## Past Projects

<div class="projects-grid">
  {#each projectsData.projects as project}
    <ProjectCard
      image={project.image}
      title={project.title}
      description={project.description}
      shortDescription={project.shortDescription}
      techStack={project.techStack}
      skills={project.skills}
      additionalImages={project.additionalImages}
      links={project.links}
      date={project.date}
    />
  {/each}
</div>

</div>

---


## Favorite Technologies:

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px;">
    <img src="https://storage.googleapis.com/cms-storage-bucket/lockup_flutter_horizontal.c823e53b3a1a7b0d36a9.png" alt="Flutter" />
    <img src="https://diversetalent.ai/wp-content/uploads/2024/03/svelte-1.png" alt="Svelte" />
    <img src="https://dart.dev/assets/img/logo/dart-logo-for-shares.png" alt="Dart" />
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Typescript.svg/1200px-Typescript.svg.png" alt="TypeScript" />
    <img src="data:image/jpeg;base64,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" alt="Supabase" />
    <img src="https://kinsta.com/wp-content/uploads/2022/02/postgres-logo.png" alt="PostgreSQL" />
</div>


*This site is built with mdsvex.*

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
