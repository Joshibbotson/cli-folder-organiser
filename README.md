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

The main menu:
![Screenshot 2024-04-28 at 16 09 53](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/c86192e0-9fd2-44f6-909a-bcf54f1d96a0)

Existing Rules, heres one I made earlier, we'll be adding an extra one:
![Screenshot 2024-04-28 at 16 10 02](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/ed92c61f-1fc9-4dba-bf4b-0b55d96649fc)

Stats for nerds, heres some of the stats of that rule you just saw:
![Screenshot 2024-04-28 at 16 10 17](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/debeee57-8c58-4db2-b67b-f46995da8125)

First select add rule, then type out your chosen rule name:
![Screenshot 2024-04-28 at 16 10 54](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/0c58630e-b478-49b7-9d7f-15088aa98ad8)

Enter the directory path we want to watch for file changes, note how cli-folder-organiser checks if the path exists or not: 
![Screenshot 2024-04-28 at 16 11 08](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/2f22644b-1659-4629-a28f-812f62fffc01)
![Screenshot 2024-04-28 at 16 11 15](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/0af1df1b-b0c6-4b0d-b976-f571a4e99ac2)

Input any extensions you want to target, here we use .png as screenshots are saved as .png:
![Screenshot 2024-04-28 at 16 11 22](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/6aa966b6-af19-444c-808a-28d25c4bb4cd)

Input any strings you want to target, here we want to target the key word 'Screenshot':
![Screenshot 2024-04-28 at 16 11 29](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/56034e31-9748-400d-b44a-fd3f98310b95)

In this case as we only have one key word, either ALL or ANY will work:
![Screenshot 2024-04-28 at 16 11 33](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/93c523ba-af2a-4caf-a238-2f2b86cc190e)

Here we can specify to match by Both the keyword 'Screenshot' and .png
![Screenshot 2024-04-28 at 16 11 35](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/554ca295-3f88-4437-b924-26483eb7d5db)

Specify the directory to output our target files, note cli-folder-organiser will validate against using the same input directory here:
![Screenshot 2024-04-28 at 16 11 48](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/60c086ec-89c5-4664-809b-bba49846d50d)
![Screenshot 2024-04-28 at 16 11 56](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/59a1b912-6900-49c2-8bc8-0088c9185dce)

Optionally we can choose to ignore directories so anything in these directories won't be processed against the rule,
this is particularly useful if we utilise a recursive rule, not again cli-folder-orgainserwill validate against using a directory that is not a sub directory:
![Screenshot 2024-04-28 at 16 12 25](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/300e09ac-d585-4746-985f-a18f251fbe20)
![Screenshot 2024-04-28 at 16 12 48](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/6918e360-f743-4197-ae77-7479d2b0ab36)

We've toggled recursive here and we will also toggle yes the rule is active, inactive rules will not be used.
![Screenshot 2024-04-28 at 16 13 04](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/1ed338ef-1349-49a4-b88e-300f5c2c0bc2)

That's it the rule is made, now we can check it exists:
![Screenshot 2024-04-28 at 16 13 11](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/dcf3a8a2-a81e-46e8-bfb6-06b0f0d449bf)
![Screenshot 2024-04-28 at 16 14 26](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/31da00fd-973e-4c79-adf0-6d8f333ce5fa)
![Screenshot 2024-04-28 at 16 14 39](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/f894493e-07e1-4323-81b8-5c8f70c541bd)

Now lets run it by selecting 'Start Folder Organiser':
![Screenshot 2024-04-28 at 16 17 58](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/3994f103-7b18-4dd3-b72b-785628e8ce64)

Here's a gif of it in action, lovely:\
![2024-04-2816-17-08-ezgif com-video-to-gif-converter](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/4db046c3-2c54-4249-804e-0cc421d8440e)

And we can check it's updated stats:
![Screenshot 2024-04-28 at 16 18 09](https://github.com/Joshibbotson/cli-folder-organiser/assets/95958816/8270d6f2-4ba9-4d3b-a5f2-6fda7b260756)


