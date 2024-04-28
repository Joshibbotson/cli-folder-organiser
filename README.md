# Why Cli Folder Organiser

My Downloads folder was getting painful to say the least. I thought I'd exercise some of the nodejs skills I'd picked up at my job and write a cli app where anyone can add rules to monitor directories and move files about.

# What does it do?

-   Watches chosen directories and moves files that match user made rule sets.
-   Enables users to create their own rule sets and saves them into a lightweight rules.json file.
-   Tracks statistics for how many files are moved by a rule.

# Tech stack used:

-   Nodejs
-   Typescript

# Libraries used:

-   Chokidar
-   Inquiror

# Getting started:

Clone the repository:

```bash
git clone git@github.com:Joshibbotson/cli-folder-organiser.git
```

cd into repository:

```bash
cd cli-folder-organiser
```

### Optional: Docker compose up to test cli-folder-organiser out in a contained environment

```bash
docker-compose run --rm cli-folder-organiser
```

### To use cli-folder-organiser on your local system:

Install dependencies:

```bash
npm install
```

Start cli-folder-organiser:

```bash
npm run start
```

You're all set! Everything else is self explantory, however, see below for a step by step guide on how add rules and what each menu option does.
