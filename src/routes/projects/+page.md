
# Current Projects
---

<script>
import currentProjectsData from "$lib/../jsons/current_projects.json";
import CurrentCard from "$lib/components/CurrentCard.svelte";
import projectsData from "$lib/../jsons/projects.json";
import ProjectCard from "$lib/components/ProjectCard.svelte";
</script>

<div class="current-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 800px; margin: 0 auto;">
  {#each currentProjectsData.current_projects as project}
	<CurrentCard
	  title={project.title}
	  description={project.description}
	/>
  {/each}
</div>

###

# Past Projects
---


<!--
<style>
	.masonry-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 12px;
		padding: 12px;
		grid-auto-flow: dense;
		grid-auto-rows: min-content;
	}

	@media (min-width: 768px) {
		.masonry-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1200px) {
		.masonry-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
-->

<div class="masonry-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
	{#each projectsData.projects as project}
		<ProjectCard
			image={project.image}
			title={project.title} 
			description={project.description}
			shortDescription={project.shortDescription}
			techStack={project.techStack}
			link={project.link}
			size={project.size}
			skills={project.skills}
			additionalImages={project.additionalImages}
			links={project.links}
			date={project.date}
		/>
	{/each}
</div>



<center>

###

# Quick Summary
---

| Project                     | Description                                                  | Tools/Technologies                              |
|-----------------------------|--------------------------------------------------------------|-------------------------------------------------|
SteerClear                   | Safety app for walking at night using crowdsourced data      | Expo, React Native, Supabase, MapBox, OpenAI    |
| TrashCash                    | Mobile app incentivizing proper waste disposal                | Flutter, Supabase, IoT, C++, Esp32              |
| Apple Canada Remittance      | Revamp existing apple remittance process for Planes          | Power Automate                                   |
| Harvard's CS50              | Taking Harvard's introductory computer science course        | C, Python, SQL                                  |
| Student Health Tracker       | Location based early diagnosis and health education tool     | Flutter, Supabase, Serverless                   |
| Inflectors Project           | CIA Pilot Game, cryptography puzzles.                        | Cryptography techniques, technical knowledge    |
| Project Torch                | Develop websites for local businesses in blacksburg          | React, Javascript, Supabase                     |
| RoomReady                    | Connect locals and travelers, with AI suggestions (Code Fest)| Flutter, Supabase, ChatGPT                      |
| Website Creation             | Create Website in Markdown with some HTML                    | Markdown, Obsidian                              |
| AdaptiveSpec Logistics       | Web scraper and data storage (Startup Sprint)                | Scrapy, Python, Supabase                        |
| Archimedes                   | Microsoft Imagine Cup                                        | Flutter                                         |
| SeeFood                      | AI Cooking Assistant in Unity MR (VTHacks12)                 | Unity, MR, ChatGPT                              |
| CS50                         | Harvard's Intro to CS                                        | C, Python, SQL                                  |
| Planes SWE                   | RPA (Cloud+Desktop), Python Scripting + APIs, Power Platform | RPA, Python, APIs, Power Platform               |
| Sprklii LLC                  | Date ideas personalized                                      | Flutter, Supabase                               |
| Robot-X                      | FTC Robotics                                                 | OpenCV, Java, Odometry                          |
| Planes IT Intern             | WTT App and SOP Sharepoint                                   | Power Platform, MS Administration               |
| Automatic Garage Closer      | Arduino                                                      | C++                                             |
| Kids Like Food 2             | Food Blog                                                    | HTML, CSS, JS                                   |
</center>

