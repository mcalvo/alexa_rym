# RYM Audio App

This skill is based off of the Alexa Skills Kit audio player example. The content below is derived from their README, with a few notable changes.

## How it Works

A few important concepts to get familiar with:

* **AudioPlayer directives** are used by your skill to start and stop audio playback from content hosted at a publicly accessible secure URL.  You  send AudioPlayer directives in response to the intents you've configured for your skill, or new events you'll receive when a user controls their device with a dedicated controller (see PlaybackController events below).
* **PlaybackController events** are sent to your skill when a user selects play/next/prev/pause on dedicated hardware controls on the Alexa device, such as on the Amazon Tap or the Voice Remote for Amazon Echo and Echo Dot.  Your skill receives these events if your skill is currently controlling audio on the device (i.e., you were the last to send an AudioPlayer directive).
* **AudioPlayer events** are sent to your skill at key changes in the status of audio playback, such as when audio has begun playing, been stopped or has finished.  You can use them to track what's currently playing or queue up more content.  Unlike intents, when you receive an AudioPlayer event, you may only respond with appropriate AudioPlayer directives to control playback.

This project pings an API for a JSON containing a list of content, updating automatically when necessary. By storing this response, we allow the user to control playback with a range of custom and built-in intents.  It's organized into several modules:

* `index.js` is the main module that handles events from Alexa.  Skill and register handlers defined in seperate modules.
* `constants.js` contains constants: Amazon Application ID, DynamoDB table to track sessions, and the secure url we retrieve our content from.
* `stateHandlers.js` is where the skill handles voice intent and playback control commands.  It registers handlers for each of the input events in different states the skill can be in, and defines a `controller` that centralizes the handler code since we perform the same action for several different input events (e.g., we do the same thing when the user tells the skill to stop or if the stop button is pressed on the device).  This project has three states:
    * **START_MODE** is the default state of the skill, such as when it's invoked without an intent for the first time.
    * **PLAY_MODE** is used when audio is currently being played by the skill.
    * **RESUME_MODE** is used when resuming from a stopped state.

You can learn more about the new [AudioPlayer interface](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference) and [PlaybackController interface](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-playbackcontroller-interface-reference).

## Special Behavior

The following are quirks of this particular design:

* **VoiceInsights**: We use VoiceInsights to monitor skill usage. To get this code working, you'll need to update `constants.js` with your key.
* **Playback Order**: The project expects the JSON from requestString to be passed in from newest to oldest. It then __reverses__ the order, so that usage of `PreviousIntent` play the older episodes. You can see this reversal in line 20 of `stateHandlers.js`.
* **Playback Functionality**: Shuffle and Loop have been disabled for this implementation of the skill, but the mechanics are still present. Autoplay has also been disabled, forcing the skill to stop after completing an episode. If you wish to enable any of this functionality, further development may be required.
* **Unique Intents**: There are two unique intents in this skill. `TodayIntent` forces a refresh of the JSON and plays the most recent episode. `AboutIntent` provides information about the skill beyond what is provided by `HelpIntent`.
