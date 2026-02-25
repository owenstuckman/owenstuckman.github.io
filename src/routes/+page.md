<script>
import currentProjectsData from "$lib/../jsons/current_projects.json";
import CurrentCard from "$lib/components/CurrentCard.svelte";
import projectsData from "$lib/../jsons/projects.json";
import ProjectCard from "$lib/components/ProjectCard.svelte";
</script>

# Owen Stuckman
---

I'm Owen Stuckman, a software engineer passionate about building solutions to save people time.

---

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

## Favorite Technologies:

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px;">
    <img src="https://storage.googleapis.com/cms-storage-bucket/lockup_flutter_horizontal.c823e53b3a1a7b0d36a9.png" alt="Flutter" />
    <img src="https://diversetalent.ai/wp-content/uploads/2024/03/svelte-1.png" alt="Svelte" />
    <img src="https://dart.dev/assets/img/logo/dart-logo-for-shares.png" alt="Dart" />
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Typescript.svg/1200px-Typescript.svg.png" alt="TypeScript" />
    <img src="https://supabase.com/_next/image?url=https%3A%2F%2Ffrontend-assets.supabase.com%2Fwww%2F72db84b0b08f%2F_next%2Fstatic%2Fmedia%2Flogo-preview.50e72501.jpg&w=3840&q=75" alt="Supabase" />
    <img src="https://kinsta.com/wp-content/uploads/2022/02/postgres-logo.png" alt="PostgreSQL" />
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

<div id="contact">

## Contact

Feel free to reach out at <a href="mailto:inquiries@owenstuckman.co">inquiries@owenstuckman.co</a> — I'm open to any and all freelance projects!

- [GitHub](https://github.com/owenstuckman)
- [LinkedIn](https://www.linkedin.com/in/owen-stuckman-b69977235)

</div>

---

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
