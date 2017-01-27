'use strict';

const Alexa = require('alexa-sdk');
const request = require('request');
const constants = require('./constants');
const controller = require('./audioController');
const utils = require('./utils');
const request_string = 'http://fiveqstaging.ligonier.org/podcasts/rym-minute/alexa.json';


const stateHandlers = {
    startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {
        /*
         *  All Intent Handlers for state : START_MODE
         */
        'LaunchRequest': function () {
            let message = 'Welcome to the RYM Podcast. You can say, play the audio to begin the podcast.';
            let reprompt = 'You can say, play the audio, to begin.';

            // Initialize Attributes
            this.attributes.index = 0;
            this.attributes.offsetInMilliseconds = 0;
            this.attributes.loop = true;
            this.attributes.shuffle = false;
            this.attributes.playbackIndexChanged = true;
            //  Change state to START_MODE
            this.handler.state = constants.states.START_MODE;

            // Initialize audioData
            let today = new Date();
            request(request_string, function(error, response, body) {
                this.attributes.audioData = JSON.parse(body);
                this.attributes.dataRefresh = today.toString();
                this.attributes.playOrder = Array.apply(null, {length: this.attributes.audioData.length}).map(Number.call, Number);

                message += ' The feed has been refreshed.'

                if (utils.canThrowCard.call(this)) {
                    let cardTitle = 'Playing ' + podcast.title;
                    let cardContent = 'Playing ' + podcast.title + '.\n audioData = ' + this.attributes.audioData;
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }

                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');

            }.bind(this));
        },
        'PlayAudio': function () {
            if (!this.attributes.playOrder) {
                // Initialize Attributes if undefined.
                this.attributes.index = 0;
                this.attributes.offsetInMilliseconds = 0;
                this.attributes.loop = true;
                this.attributes.shuffle = false;
                this.attributes.playbackIndexChanged = true;
                //  Change state to START_MODE
                this.handler.state = constants.states.START_MODE;

                // Initialize audioData
                let today = new Date();
                request(request_string, function(error, response, body) {
                    this.attributes.audioData = JSON.parse(body);
                    this.attributes.dataRefresh = today.toString();
                    this.attributes.playOrder = Array.apply(null, {length: this.attributes.audioData.length}).map(Number.call, Number);

                    controller.play.call(this);
                }.bind(this));
            } else {
            controller.play.call(this);
            }
        },
        'AMAZON.HelpIntent': function () {
            var message = 'Welcome to the RYM Podcast. You can say, play the audio, to begin the podcast.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent': function () {
            let message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent': function () {
            let message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest': function () {
            // No session ended logic
        },
        'Unhandled': function () {
            let message = 'Sorry, I could not understand. Please say, play the audio, to begin the audio.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    }),
    playModeIntentHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Intent Handlers for state : PLAY_MODE
         */
        'LaunchRequest': function () {
            /*
             *  Session resumed in PLAY_MODE STATE.
             *  If playback had finished during last session :
             *      Give welcome message.
             *      Change state to START_STATE to restrict user inputs.
             *  Else :
             *      Ask user if he/she wants to resume from last position.
             *      Change state to RESUME_MODE
             */
            let message;
            let reprompt;
            if (this.attributes['playbackFinished']) {
                this.handler.state = constants.states.START_MODE;
                message = 'Welcome to the AWS Podcast. You can say, play the audio to begin the podcast.';
                reprompt = 'You can say, play the audio, to begin.';
            } else {
                this.handler.state = constants.states.RESUME_MODE;
                message = 'You were listening to ' + this.attributes.audioData[this.attributes.playOrder[this.attributes.index]].title +
                    ' Would you like to resume?';
                reprompt = 'You can say yes to resume or no to play from the top.';
            }

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'PlayAudio': controller.play.bind(this),
        'AMAZON.NextIntent': controller.playNext.bind(this),
        'AMAZON.PreviousIntent': controller.playPrevious.bind(this),
        'AMAZON.PauseIntent': controller.stop.bind(this),
        'AMAZON.StopIntent': controller.stop.bind(this),
        'AMAZON.CancelIntent': controller.stop.bind(this),
        'AMAZON.ResumeIntent': controller.play.bind(this),
        'AMAZON.LoopOnIntent': controller.loopOn.bind(this),
        'AMAZON.LoopOffIntent': controller.loopOff.bind(this),
        'AMAZON.ShuffleOnIntent': controller.shuffleOn.call(this),
        'AMAZON.ShuffleOffIntent': controller.shuffleOff.call(this),
        'AMAZON.StartOverIntent': controller.startOver.call(this),
        'AMAZON.HelpIntent': function () {
            // This will called while audio is playing and a user says "ask <invocation_name> for help"
            let message = 'You are listening to the AWS Podcast. You can say, Next or Previous to navigate through the playlist. At any time, you can say Pause to pause the audio and Resume to resume.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest': function () {
            // No session ended logic
        },
        'Unhandled': function () {
            let message = 'Sorry, I could not understand. You can say, Next or Previous to navigate through the playlist.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    }),
    remoteControllerHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
         */
        'PlayCommandIssued': controller.play.bind(this),
        'PauseCommandIssued': controller.stop.bind(this),
        'NextCommandIssued': controller.playNext.bind(this),
        'PreviousCommandIssued': controller.playPrevious.bind(this)
    }),
    resumeModeIntentHandlers : Alexa.CreateStateHandler(constants.states.RESUME_MODE, {
        /*
         *  All Intent Handlers for state : RESUME_MODE
         */
        'LaunchRequest': function () {
            let message = 'You were listening to ' + this.attributes.audioData[this.attributes.playOrder[this.attributes.index]].title +
                ' Would you like to resume?';
            let reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.YesIntent': controller.play.bind(this),
        'AMAZON.NoIntent': controller.reset.bind(this), // We can do a feed refresh on reset
        'AMAZON.HelpIntent': function () {
            let message = 'You were listening to ' + this.attributes.audioData[this.attributes.index].title +
                ' Would you like to resume?';
            let reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent': function () {
            let message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent': function () {
            let message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest': function () {
            // No session ended logic
        },
        'Unhandled': function () {
            let message = 'Sorry, this is not a valid command. Please say help to hear what you can say.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    })
};

module.exports = stateHandlers;
