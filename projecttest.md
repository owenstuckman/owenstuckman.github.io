
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            padding: 20px;
        }
        .card {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            transition: transform 0.3s;
        }
        .card:hover {
            transform: scale(1.05);
        }
        .card h2 {
            margin-top: 0;
        }
        .card p {
            margin: 10px 0;
        }
        .card a {
            color: #3498db;
            text-decoration: none;
        }
        .card a:hover {
            text-decoration: underline;
        }
    </style>
    <title>Project Cards</title>
</head>
<body>
    <div class="container">
        <!-- Extended Information -->
<div class="card">
    <h2>Extended Information</h2>
    <p><strong>Date of Project:</strong> October 2024</p>
    <p><strong>Skills:</strong> Markdown, Obsidian</p>
    <p><strong>Link:</strong> <a href="https://github.com/owenstuckman/owenstuckman.github.io">GitHub Repo</a></p>
    <p>Played around with a bunch of different options to make the website. Tried out jekyll, which I did not like, used Weebly on Porkbun to make it no-code (which felt clunky), and considered using Hugo. In the end, I decided to just go with plain old markdown, and maybe add a nicer looking theme at the completion of writing the raw markdown.</p>
    <p>Done as a Personal Project.</p>
</div>

<!-- AdaptiveSpec Logistics -->
<div class="card">
    <h2>AdaptiveSpec Logistics</h2>
    <p><strong>Date of Project:</strong> October 2024</p>
    <p><strong>Skills:</strong> Web Scraping: Scrapy, Cloud Database: Supabase, Language: Python</p>
    <p><strong>Link:</strong> Private since I may monetize this software in the future.</p>
    <p>Created a web scraping tool specifically for specialized logistics. Built framework where selected companies were added to a personal/company wide database, which then pushed those selections to the top of the searches. Did not complete but want to add an ML model to learn through user interaction with the application and push certain traits up further on results, which will end up being a future project.</p>
    <p>Did it solo in a competition with teams of up to four.</p>
</div>

<!-- Archimedes -->
<div class="card">
    <h2>Archimedes</h2>
    <p><strong>Date of Project:</strong> September 2024 (Ongoing)</p>
    <p><strong>Skills:</strong> Flutter</p>
    <p><strong>Link:</strong> Still in problem ideation!</p>
    <p>Design Team at Virginia Tech. Competing in Microsoft's Imagine Cup. Our team is still in problem ideation, so we are yet to determine what project and frameworks we will use!</p>
    <p>Group - Team of Four</p>
</div>

<!-- SeeFood -->
<div class="card">
    <h2>SeeFood</h2>
    <p><strong>Date of Project:</strong> September 2024</p>
    <p><strong>Skills:</strong> AR/VR: Unity, Cloud Database: Azure, Language: C#, Backend: Node.js, AI: OpenAI ChatGPT 4o, Dictation: Meta XR Voice</p>
    <p><strong>Link:</strong> <a href="https://github.com/JacobMartinage/SeeFood">GitHub Repo</a></p>
    <p>Worked in a team of four to make a tool which was an AI cooking assistant. It provided feedback on a wide variety of inputs, such as cooking time, and if items were spoiled or not. I primarily worked on the UI in Unity and made the dictation tool to enable voice commands, which then communicated with our backend to provide the requested service.</p>
    <p>Group - Team of Four: Focused on UI + dictation work.</p>
</div>

<!-- Harvard's CS50 -->
<div class="card">
    <h2>Harvard's CS50</h2>
    <p><strong>Date of Project:</strong> August 2024 (Ongoing)</p>
    <p><strong>Skills:</strong> C, Python, SQL, General CS topics</p>
    <p><strong>Link:</strong> Check CS50/owenstuckman</p>
    <p>Personal Development. Working to strengthen foundational Computer Science concepts. Following along with the phenomenal lectures from David J. Malan, and completing the problem sets to earn my CS50 completion certificate.</p>
</div>

<!-- Mover's Suite API Connection -->
<div class="card">
    <h2>Mover's Suite API Connection</h2>
    <p><strong>Date of Project:</strong> Summer 2024</p>
    <p><strong>Skills:</strong> Python, TKinter, APIs & http requests</p>
    <p><strong>Link:</strong> <a href="https://github.com/owenstuckman/PlanesReferences/tree/main/References-24/References-24/MSAPI">GitHub Repo</a></p>
    <p>Connect to Mover's Suites outdated API so data can be passed back and forth in an automated manner. Previously had no way to pass data between Mover's Suite and company SQL Server, so this was major in data control and automation for Planes.</p>
</div>

<!-- Mover's Suite Automated Status Updates -->
<div class="card">
    <h2>Mover's Suite Automated Status Updates</h2>
    <p><strong>Date of Project:</strong> Summer 2024</p>
    <p><strong>Skills:</strong> Power Automate Desktop</p>
    <p><strong>Link:</strong> On Physical Device</p>
    <p>Created a desktop RPA using Power Automate Desktop to automate the manual task of changing statuses in Mover's Suite. Prior to this RPA, this was a task that had to be done manually.</p>
</div>

<!-- Employee Education -->
<div class="card">
    <h2>Employee Education</h2>
    <p><strong>Date of Project:</strong> Summer 2024</p>
    <p><strong>Skills:</strong> Various topics including ALM, Microsoft Dataverse, Git, Power BI, Power Platform, SQL</p>
    <p><strong>Link:</strong> Contact me for the particular presentations.</p>
    <p>Taught peers about multiple topics: Application Lifecycle Management, Microsoft Dataverse, Git and Github, Exporting from Power BI, Power Platform, SQL Server and SQL, Cloud Based Storage. Worked to generally educate peers to form citizen developers, and to have a better understanding of computer science topics.</p>
</div>

<!-- XPM to Smartsheet Data Connection -->
<div class="card">
    <h2>XPM to Smartsheet Data Connection</h2>
    <p><strong>Date of Project:</strong> Summer 2024</p>
    <p><strong>Skills:</strong> Smartsheet, Power Automate Cloud</p>
    <p><strong>Link:</strong> <a href="https://github.com/owenstuckman/PlanesReferences/blob/main/References-24/References-24/Screenshot%202024-08-12%20145246.png">GitHub Screenshot</a></p>
    <p>Created a cloud automation to pass data between two of our systems, XPM and smartsheet. Prior to this Project Coordinators would have to manually copy and paste data over, and the automation saved them from having to do so.</p>
</div>

<!-- Project Manager Time Tracking -->
<div class="card">
    <h2>Project Manager Time Tracking</h2>
    <p><strong>Date of Project:</strong> Summer 2024</p>
    <p><strong>Skills:</strong> Power Automate, Power Apps, Excel, Legacy systems</p>
    <p><strong>Link:</strong> <a href="https://github.com/owenstuckman/PlanesReferences/blob/main/References-24/References-24/PMTimeTracking_20240731185821.zip">GitHub Repo</a></p>
    <p>Project Manager Time Tracker was a time tracking system to replace our previous system built into XPM. This project recreated the functionality of the previous system so it could be accessed in mobile form, and we also automated and simplified the process while developing the new application.</p>
</div>

<!-- SmartSheet Supplier Information -->
<div class="card">
    <h2>SmartSheet Supplier Information</h2>
    <p><strong>Date of Project:</strong> Summer 2024</p>
    <p><strong>Skills:</strong> Smartsheet, Power Automate, Network Drives</p>
    <p><strong>Link:</strong> <a href="https://github.com/owenstuckman/PlanesReferences/blob/main/References-24/References-24/SupplierInformationDashboard_20240731185711.zip">GitHub Repo</a></p>
    <p>Smart Sheet Supplier Information was a project to better centralize all of our supplier information in the microsoft ecosystem. Prior to this project everything was in smartsheet and scattered to multiple files and sheets, and this project centralized all of this information, and automated some of the steps in the process of adding information to the database.</p>
</div>

<!-- Apple Remittance Automation -->
<div class="card">
    <h2>Apple Remittance Automation</h2>
    <p><strong>Date of Project:</strong> Summer 2024</p>
    <p><strong>Skills:</strong> Text Parsing, Regex, Power Automate, CSV File Structure</p>
    <p><strong>Link:</strong> <a href="https://github.com/owenstuckman/PlanesReferences/blob/main/References-24/References-24/AppleExtract_20240812163255.zip">GitHub Repo</a></p>
    <p>This project involved automating the extraction of information from our apple remittances. Apple sends their remittances as text embedded in email, so I had to write an automate to parse the text and save it into a csv so our accounting department could more easily work with it. This way accountants did not need to manually compile this data.</p>
</div>

<!-- Sprklii LLC -->
<div class="card">
    <h2>Sprklii LLC</h2>
    <p><strong>Date of Project:</strong> January 2023 (Ongoing)</p>
    <p><strong>Skills:</strong> Flutter: Dart, Cloud DB: Supabase- PostgreSQL</p>
    <p><strong>Link:</strong> Repo is private</p>
    <p>Founded a LLC with the idea of bringing personalization to the date ideas scene. Google and other competitors serve people very generalized and blank ideas, and we serve personalized and customized ideas to keep the Spark Alive! I worked as the only developer to get our MVP + alpha product released, and now lead a team with two other developers as we enter our beta phase.</p>
    <p>Business: Co-Founder, CTO, Primary Developer</p>
</div>

<!-- Robot-X Computer Vision -->
<div class="card">
    <h2>Robot-X Computer Vision</h2>
    <p><strong>Date of Project:</strong> August 2023 to January 2024</p>
    <p><strong>Skills:</strong> OpenCV, Java</p>
    <p><strong>Link:</strong> Repo is private</p>
    <p>Revamped our vision system using OpenCV. This was a pretty widespread project that I did on my own to implement two channels of input rather than just using a single channel of input. Took a huge portion of competition season to complete, but resulted in extremely accurate vision by comparing the channels of input.</p>
</div>

<!-- Robot-X Software Lead -->
<div class="card">
    <h2>Robot-X Software Lead</h2>
    <p><strong>Date of Project:</strong> August 2021 - May 2024</p>
    <p><strong>Skills:</strong> Java, Agile Methodology</p>
    <p><strong>Link:</strong> All repos are private, some samples are on my github.</p>
    <p>Lead software team at Robot-X for three years, with around three members working for me on the subteam. Worked to introduce agile practices into our workflow, and saw efficiency increases due to it. Got a large amount of experience working as both a PM and working directly on some of the more challenging software we needed to write.</p>
</div>

<!-- Warehouse Time Tracking App -->
<div class="card">
    <h2>Warehouse Time Tracking App</h2>
    <p><strong>Date of Project:</strong> Summer 2022</p>
    <p><strong>Skills:</strong> Power Apps, Power Automate, SQL Server</p>
    <p><strong>Link:</strong> Not provided</p>
    <p>Revamped out warehouse time tracking system, to both modernize and make the process easier on the data entry and data audit endpoints. Provided a set of data auditing tools so those performing the audit had better tools than going row by row.</p>
</div>

<!-- SOP Sharepoint -->
<div class="card">
    <h2>SOP Sharepoint</h2>
    <p><strong>Date of Project:</strong> Summer 2022</p>
    <p><strong>Skills:</strong> SOP, Process Automation, Lean Six Sigma Principles</p>
    <p><strong>Link:</strong> Not provided</p>
    <p>Created a sharepoint site and created many Standard Operating Procedures to ensure that employees were on the same page on how processes are supposed to go. Prior to this there was no standard procedures, and assisting in this process helped to improve communication between employees and departments.</p>
</div>

<!-- Automatic Garage Door Closer -->
<div class="card">
    <h2>Automatic Garage Door Closer</h2>
    <p><strong>Date of Project:</strong> Summer 2021</p>
    <p><strong>Skills:</strong> Arduino IDE, C++, Basic Circuitry and Radio Communication</p>
    <p><strong>Link:</strong> Contact me for the specific files</p>
    <p>Created an automatic garage door closing system that physically pressed the garage door button when the garage door was left open for too long. I kept leaving the garage door open while leaving home, so this was a fun project to correct the issue rather than having to fix my memory to close the garage door. Used two radio transceivers, an ultrasonic sensor, and a servo to put together the physical product to accompany the software I made.</p>
</div>

<!-- Kids Like Food 2 (KLF2) -->
<div class="card">
    <h2>Kids Like Food 2 (KLF2)</h2>
    <p><strong>Date of Project:</strong> 2019</p>
    <p><strong>Skills:</strong> HTML, CSS, JS</p>
    <p><strong>Link:</strong> Lost in old google accounts</p>
    <p>Learned the basics to html and css as a great starting project to make a food blog with a friend. I had a ton of fun, and it taught me a lot about basic programming practices. Used google docs as version control, and I made a ton of mistakes but learned a lot!</p>
</div>