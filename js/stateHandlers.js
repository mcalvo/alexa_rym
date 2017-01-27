'use strict';

const Alexa = require('alexa-sdk');
const request = require('request');
const constants = require('./constants');
const utils = require('./utils');
const request_string = 'http://fiveqstaging.ligonier.org/podcasts/rym-minute/alexa.json';


const stateHandlers = {
    startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {
        /*
         *  All Intent Handlers for state : START_MODE
         */
        'LaunchRequest' : function () {
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
                this.attributes.dataRefresh = today.toString()
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
        'PlayAudio' : function () {
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
        'AMAZON.HelpIntent' : function () {
            var message = 'Welcome to the RYM Podcast. You can say, play the audio, to begin the podcast.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
            let message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            let message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            let message = 'Sorry, I could not understand. Please say, play the audio, to begin the audio.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    }),
    playModeIntentHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Intent Handlers for state : PLAY_MODE
         */
        'LaunchRequest' : function () {
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
        'PlayAudio' : function () { controller.play.call(this) },
        'AMAZON.NextIntent' : function () { controller.playNext.call(this) },
        'AMAZON.PreviousIntent' : function () { controller.playPrevious.call(this) },
        'AMAZON.PauseIntent' : function () { controller.stop.call(this) },
        'AMAZON.StopIntent' : function () { controller.stop.call(this) },
        'AMAZON.CancelIntent' : function () { controller.stop.call(this) },
        'AMAZON.ResumeIntent' : function () { controller.play.call(this) },
        'AMAZON.LoopOnIntent' : function () { controller.loopOn.call(this) },
        'AMAZON.LoopOffIntent' : function () { controller.loopOff.call(this) },
        'AMAZON.ShuffleOnIntent' : function () { controller.shuffleOn.call(this) },
        'AMAZON.ShuffleOffIntent' : function () { controller.shuffleOff.call(this) },
        'AMAZON.StartOverIntent' : function () { controller.startOver.call(this) },
        'AMAZON.HelpIntent' : function () {
            // This will called while audio is playing and a user says "ask <invocation_name> for help"
            let message = 'You are listening to the AWS Podcast. You can say, Next or Previous to navigate through the playlist. ' +
                'At any time, you can say Pause to pause the audio and Resume to resume.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            let message = 'Sorry, I could not understand. You can say, Next or Previous to navigate through the playlist.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    }),
    remoteControllerHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
         */
        'PlayCommandIssued' : function () { controller.play.call(this) },
        'PauseCommandIssued' : function () { controller.stop.call(this) },
        'NextCommandIssued' : function () { controller.playNext.call(this) },
        'PreviousCommandIssued' : function () { controller.playPrevious.call(this) }
    }),
    resumeModeIntentHandlers : Alexa.CreateStateHandler(constants.states.RESUME_MODE, {
        /*
         *  All Intent Handlers for state : RESUME_MODE
         */
        'LaunchRequest' : function () {
            let message = 'You were listening to ' + this.attributes.audioData[this.attributes.playOrder[this.attributes.index]].title +
                ' Would you like to resume?';
            let reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.YesIntent' : function () { controller.play.call(this) },
        'AMAZON.NoIntent' : function () {
                // We can do a feed refresh on reset
                controller.reset.call(this)
        },
        'AMAZON.HelpIntent' : function () {
            let message = 'You were listening to ' + this.attributes.audioData[this.attributes.index].title +
                ' Would you like to resume?';
            let reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
            let message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            let message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            let message = 'Sorry, this is not a valid command. Please say help to hear what you can say.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    })
};

module.exports = stateHandlers;

var controller = function () {
    return {
        play: function () {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */
            this.handler.state = constants.states.PLAY_MODE;

            if (this.attributes['playbackFinished']) {
                // Reset to top of the playlist when reached end.
                this.attributes.index = 0;
                this.attributes.offsetInMilliseconds = 0;
                this.attributes.playbackIndexChanged = true;
                this.attributes['playbackFinished'] = false;

                // Update audioData
                var today = new Date();
                var dataRefresh = new Date(this.attributes.dataRefresh);
                if ((today - dataRefresh) >= 86400000) {
                    request(request_string, function(error, response, body) {
                        this.attributes.audioData = JSON.parse(body);
                        this.attributes.dataRefresh = today.toString()
                        this.attributes.playOrder = Array.apply(null, {length: this.attributes.audioData.length}).map(Number.call, Number);

                        var token = String(this.attributes.playOrder[this.attributes.index]);
                        var playBehavior = 'REPLACE_ALL';
                        var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                        var offsetInMilliseconds = this.attributes.offsetInMilliseconds;
                        // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
                        this.attributes.enqueuedToken = null;

                        if (utils.canThrowCard.call(this)) {
                            var cardTitle = 'Playing ' + podcast.title;
                            var cardContent = 'Playing ' + podcast.title + '.\n audioData = ' + this.attributes.audioData;
                            this.response.cardRenderer(cardTitle, cardContent, null);
                        }

                        this.response.audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
                        this.emit(':responseReady');
                    }.bind(this));
                } else {
                    var token = String(this.attributes.playOrder[this.attributes.index]);
                    var playBehavior = 'REPLACE_ALL';
                    var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                    var offsetInMilliseconds = this.attributes.offsetInMilliseconds;
                    // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
                    this.attributes.enqueuedToken = null;

                    if (utils.canThrowCard.call(this)) {
                        var cardTitle = 'Playing ' + podcast.title;
                        var cardContent = 'Playing ' + podcast.title;
                        this.response.cardRenderer(cardTitle, cardContent, null);
                    }

                    this.response.audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
                    this.emit(':responseReady');
                }
            } else {
                var token = String(this.attributes.playOrder[this.attributes.index]);
                var playBehavior = 'REPLACE_ALL';
                var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                var offsetInMilliseconds = this.attributes.offsetInMilliseconds;
                // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
                this.attributes.enqueuedToken = null;

                if (utils.canThrowCard.call(this)) {
                    var cardTitle = 'Playing ' + podcast.title;
                    var cardContent = 'Playing ' + podcast.title;
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }

                this.response.audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
                this.emit(':responseReady');
            }
        },
        stop: function () {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        playNext: function () {
            /*
             *  Called when AMAZON.NextIntent or PlaybackController.NextCommandIssued is invoked.
             *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
             *  If reached at the end of the playlist, choose behavior based on "loop" flag.
             */
            var index = this.attributes.index;
            index += 1;
            // Check for last audio file.
            if (index === this.attributes.audioData.length) {
                if (this.attributes.loop) {
                    index = 0;
                } else {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    this.handler.state = constants.states.START_MODE;

                    if (utils.canThrowCard.call(this)) {
                        var cardTitle = 'Playing ' + podcast.title;
                        var cardContent = 'Playing ' + podcast.title + '.\n audioData = ' + this.attributes.audioData;
                        this.response.cardRenderer(cardTitle, cardContent, null);
                    }

                    var message = 'You have reached at the end of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes.index = index;
            this.attributes.offsetInMilliseconds = 0;
            this.attributes.playbackIndexChanged = true;

            controller.play.call(this);
        },
        playPrevious: function () {
            /*
             *  Called when AMAZON.PreviousIntent or PlaybackController.PreviousCommandIssued is invoked.
             *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
             *  If reached at the end of the playlist, choose behavior based on "loop" flag.
             */
            var index = this.attributes.index;
            index -= 1;
            // Check for last audio file.
            if (index === -1) {
                if (this.attributes.loop) {
                    index = this.attributes.audioData.length - 1;
                } else {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    this.handler.state = constants.states.START_MODE;

                    var message = 'You have reached at the start of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes.index = index;
            this.attributes.offsetInMilliseconds = 0;
            this.attributes.playbackIndexChanged = true;

            controller.play.call(this);
        },
        loopOn: function () {
            // Turn on loop play.
            this.attributes.loop = true;
            var message = 'Loop turned on.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        loopOff: function () {
            // Turn off looping
            this.attributes.loop = false;
            var message = 'Loop turned off.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        shuffleOn: function () {
            // Turn on shuffle play.
            this.attributes.shuffle = true;
            utils.shuffleOrder((newOrder) => {
                // Play order have been shuffled. Re-initializing indices and playing first song in shuffled order.
                this.attributes.playOrder = newOrder;
                this.attributes.index = 0;
                this.attributes.offsetInMilliseconds = 0;
                this.attributes.playbackIndexChanged = true;
                controller.play.call(this);
            });
        },
        shuffleOff: function () {
            // Turn off shuffle play.
            if (this.attributes.shuffle) {
                this.attributes.shuffle = false;
                // Although changing index, no change in audio file being played as the change is to account for reordering playOrder
                this.attributes.index = this.attributes.playOrder[this.attributes.index];
                this.attributes.playOrder = Array.apply(null, {length: this.attributes.audioData.length}).map(Number.call, Number);
            }
            controller.play.call(this);
        },
        startOver: function () {
            // Start over the current audio file.
            this.attributes.offsetInMilliseconds = 0;
            controller.play.call(this);
        },
        reset: function () {
            // Reset to top of the playlist.
            this.attributes.index = 0;
            this.attributes.offsetInMilliseconds = 0;
            this.attributes.playbackIndexChanged = true;

            // Update audioData
            var today = new Date();
            var dataRefresh = new Date(this.attributes.dataRefresh);
            if ((today - dataRefresh) >= 86400000) {
                request(request_string, function(error, response, body) {
                    this.attributes.audioData = JSON.parse(body);
                    this.attributes.dataRefresh = today.toString()
                    this.attributes.playOrder = Array.apply(null, {length: this.attributes.audioData.length}).map(Number.call, Number);

                    var token = String(this.attributes.playOrder[this.attributes.index]);
                    var playBehavior = 'REPLACE_ALL';
                    var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                    var offsetInMilliseconds = this.attributes.offsetInMilliseconds;
                    // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
                    this.attributes.enqueuedToken = null;

                    controller.play.call(this);
                }.bind(this));
            } else {
                controller.play.call(this);
            }
        }
    }
}();
