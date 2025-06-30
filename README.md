# 🎭 pw-educamos-notifier 🎭

pw-educamos-notifier is a server-based application that connects to CLM "Educamos" platform, retrieves all the unread messages and sends them to a given Telegram chat.

## Description

_CLM Educamos_ is a communication platform for schools in Castilla-La Mancha (Spain). One of its purposes is sending and receiving messages from/to the teachers of your children. 

An email is received each time a message is sent to the platform, but only the subject of the message is included, forcing you to access the platform in order to read the content of those notifications, as well as getting the attachments, if any.

This program makes use of 🎭 Playwright 🎭 to simulate user interaction with Educamos, retrieves all the unread messages, downloads the attachments and sends them to a given Telegram chat. You can fork and/or adapt the bot in order to send notifications to other services, if needed.

**Update June 2025**: Educamos platform was finally updated and it changed its architecture, providing a frontend and a backend. Therefore, Playwright is now used just for authentication purposes (Educamos uses Keycloack for authentication).

## Disclaimer

There is no warranty for this software, so use it at your own risk. Remember that once a message has been opened, it will be removed from the inbox default view, so any issue related to the notification can lead in missing important information related to the Educamos platform if you're not paying enough attention.

## Installation
To install all necessary dependencies run the command:
```
npm run setup
```
Then, rename the `env.sample` file to `.env` and fill the provided variables:
```
EDUCAMOS_USERNAME="myuser"
EDUCAMOS_PASSWORD="mypassword"
NOTIFICATION_ENDPOINT="http://localhost:7887/sendmessage"
CRON_SCHEDULE="53 8-23 * * 1-5"
HEADLESS="true"
LOG_LEVEL="info"
```

You must provide your Educamos credentials, as well as the endpoint for sending the messages to Telegram. There's a basic Telegram notification service that you can use by providing your own Telegram Bot in the following repo: [https://github.com/GarciaDan/simple-telegram-server](https://github.com/GarciaDan/simple-telegram-server).

If you're running the application with its service version, you should also provide a cron configuration. If you don't know how to do so, check some examples [here](https://www.man7.org/linux/man-pages/man5/crontab.5.html#EXAMPLE_CRON_FILE).

Setting `HEADLESS` variable to `"true"` will execute Playwright in headless mode, and `LOG_LEVEL` will set the verbosity of the logger.

## Execution

### Single execution
You can run the notifier just once:

```
npm run once
```

Add a manual cron job to your system in case you want it to be scheduled in your system in a regular basis. A Raspberry Pi is useful for that :smile:

### Built-in service via node-cron
You can also run it as a service, polling the Educamos platform based on the cron configuration stored in the `CRON_SCHEDULE` environment variable.
```
npm run start-service
```

### Run as a service using pm2
Another way to schedule a polling for the application is using pm2. To do so, install it in your system:
```
npm install pm2 -g
```

It's advisable to configure logging to avoid logs to fill your disk space:
```
pm2 install pm2-logrotate
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:retain 2
```

By default, the script `once` triggers a single polling operation.
```
   "scripts": {
     ...
     "once": "NODE_PATH=./src ts-node app.ts",
     ...
   }
```

However, pm2 is configured by default to re-trigger every 30 minutes. You can change this value changing the parameter `cron_restart` in the file `ecosystem.config.js`:
```
{
  ...
  cron_restart: "*/30 * * * *",
}
```

Then start the service and save it into pm2 configuration:
```
pm2 start ecosystem.config.js --only pw-educamos-notifier
pm2 save
```

As a last step, you can configure pm2 to be triggered on system start
```
pm2 startup
```

To check pm2 logs and resource consumption, just type as follows:
```
pm2 logs my-app
pm2 logs monit
```


Made with ❤️ by [Daniel García](https://danigarcia.org)