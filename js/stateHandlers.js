'use strict';

const Alexa = require('alexa-sdk');
const request = require('request');
const constants = require('./constants');
const utils = require('./utils');
const request_string = 'http://fiveqstaging.ligonier.org/podcasts/renewing-your-mind/alexa.json';

function initializeSession(body) {
    let today = new Date();
    this.attributes.index = 0;
    this.attributes.offsetInMilliseconds = 0;
    this.attributes.loop = false;
    this.attributes.shuffle = false;
    this.attributes.playbackIndexChanged = true;
    this.handler.state = constants.states.START_MODE;
    this.attributes.audioData = JSON.parse(body);
    this.attributes.dataRefresh = today.toString();
    this.attributes.playOrder = Array.apply(null, {
        length: this.attributes.audioData.length
    }).map(Number.call, Number);
}

const stateHandlers = {
    startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {
        /*
         *  All Intent Handlers for state : START_MODE
         */
        'LaunchRequest' : function () {
            let today = new Date();
            if (this.attributes.dataRefresh){
                let dr = new Date(this.attributes.dataRefresh);
                if (dr < today) {
                    request(request_string, function(error, response, body) {
                        initializeSession.call(this, body);

                        var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                        let message = 'Welcome to Renewing Your Mind. Today\'s broadcast is titled ' + podcast.title;

                        this.response.speak(message);
                        controller.play.call(this);
                    }.bind(this));
                } else {
                    var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                    let message = 'Welcome to Renewing Your Mind. Today\'s broadcast is titled ' + podcast.title;
                    controller.play.call(this);
                }
            } else {
                request(request_string, function(error, response, body) {
                    initializeSession.call(this, body);

                    var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                    let message = 'Welcome to Renewing Your Mind. Today\'s broadcast is titled ' + podcast.title;

                    this.response.speak(message);
                    controller.play.call(this);
                }.bind(this));
            }
        },
        'PlayAudio' : function () {
            if (!this.attributes.playOrder) {
                request(request_string, function(error, response, body) {
                    initializeSession.call(this, body);
                    controller.play.call(this);
                }.bind(this));
            } else {
                controller.play.call(this);
            }
        },
        'AMAZON.HelpIntent' : function () {
            var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];

            var message = 'You\'re listening to Renewing Your Mind for ' + podcast.date + ' titled ' + podcast.title + '. You can say Pause, or, Resume, to control playback. To listen to an earlier broadcast, say Next. To return to the most recent broadcast, say Today\'s Broadcast. To learn more about Renewing Your Mind, say About. What can I help you with?'
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'AboutIntent': function() {
            var message = 'Renewing Your Mind is an outreach of Ligonier Ministries, an international Christian discipleship organization founded in 1971 by Dr. R.C. Sprole. We know that God uses his Word to change lives. In Romans 12:2, Paul tells Christians to \"be transformed by the renewal of your mind\". That is our aim. We\'re committed to faithfully presenting the unvarnished truth of Scripture, helping you to know what you believe, why you believe it, how to live it and how to share it.'
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'TodayIntent': function() {
            request(request_string, function(error, response, body) {
                initializeSession.call(this, body);

                var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                controller.play.call(this);
            }.bind(this));
        },
        'AMAZON.StopIntent' : function () {
            controller.stop.call(this);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            controller.stop.call(this);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            let message = 'Sorry, I could not understand.';
            this.response.speak(message);
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
            let today = new Date();
            if (this.attributes['playbackFinished']) {
                if (this.attributes.dataRefresh){
                    let dr = new Date(this.attributes.dataRefresh);
                    if (dr != today) {
                        request(request_string, function(error, response, body) {
                            initializeSession.call(this, body);

                            var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                            let message = 'Welcome to Renewing Your Mind. Today\'s broadcast is titled ' + podcast.title;

                            this.response.speak(message);
                            controller.play.call(this);
                        }.bind(this));
                    } else {
                        var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                        let message = 'Welcome to Renewing Your Mind. Today\'s broadcast is titled ' + podcast.title;
                        controller.play.call(this);
                    }
                } else {
                    request(request_string, function(error, response, body) {
                        initializeSession.call(this, body);

                        var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                        let message = 'Welcome to Renewing Your Mind. Today\'s broadcast is titled ' + podcast.title;

                        this.response.speak(message);
                        controller.play.call(this);
                    }.bind(this));
                }
            } else {
                this.handler.state = constants.states.RESUME_MODE;
                var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                message = 'Welcome back to Renewing Your Mind. Previously you were listening to the broadcast from ' + podcast.date + ' titled ' + podcast.title + '. Would you like to resume that broadcast? Say yes to resume, or no to play today\'s broadcast.';
                reprompt = 'Say yes to resume the broadcast from ' + podcast.date + ' titled ' + podcast.title + ', or say no to play today\'s broadcast.';

                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            }
        },
        'PlayAudio' : function () { controller.play.call(this) },
        'AMAZON.NextIntent' : function () { controller.playNext.call(this) },
        'AMAZON.PreviousIntent' : function () { controller.playPrevious.call(this) },
        'AMAZON.PauseIntent' : function () { controller.stop.call(this) },
        'AMAZON.StopIntent' : function () { controller.stop.call(this) },
        'AMAZON.CancelIntent' : function () { controller.stop.call(this) },
        'AMAZON.ResumeIntent' : function () { controller.play.call(this) },
        'AMAZON.LoopOnIntent': function() {
            var message = 'Sorry. This skill does not support looping.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.LoopOffIntent' : function () {
            var message = 'Sorry. This skill does not support looping.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.ShuffleOnIntent' : function () {
            var message = 'Sorry. This skill does not support shuffling.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.ShuffleOffIntent' : function () {
            var message = 'Sorry. This skill does not support shuffling.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.StartOverIntent' : function () {
            controller.startOver.call(this)
        },
        'AMAZON.HelpIntent' : function () {
            var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];

            var message = 'You\'re listening to Renewing Your Mind for ' + podcast.date + ' titled ' + podcast.title + '. You can say Pause, or, Resume, to control playback. To listen to an earlier broadcast, say Next. To Return to the most recent broadcast, say Today\'s Broadcast. To learn more about Renewing Your Mind, say About. What can I help you with?'
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'AboutIntent': function() {
            var message = 'Renewing Your Mind is an outreach of Ligonier Ministries, an international Christian discipleship organization founded in 1971 by Dr. R.C. Sprole. We know that God uses his Word to change lives. In Romans 12:2, Paul tells Christians to \"be transformed by the renewal of your mind\". That is our aim. We\'re committed to faithfully presenting the unvarnished truth of Scripture, helping you to know what you believe, why you believe it, how to live it and how to share it.'
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'TodayIntent': function() {
            if (this.attributes.dataRefresh){
                let dr = new Date(this.attributes.dataRefresh);
                if (dr != today) {
                    request(request_string, function(error, response, body) {
                        initializeSession.call(this, body);

                        var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                        let message = 'Welcome to Renewing Your Mind. Today\'s broadcast is titled ' + podcast.title;

                        this.response.speak(message);
                        controller.play.call(this);
                    }.bind(this));
                } else {
                    var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                    let message = 'Welcome to Renewing Your Mind. Today\'s broadcast is titled ' + podcast.title;
                    controller.play.call(this);
                }
            } else {
                request(request_string, function(error, response, body) {
                    initializeSession.call(this, body);

                    var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                    let message = 'Welcome to Renewing Your Mind. Today\'s broadcast is titled ' + podcast.title;

                    this.response.speak(message);
                    controller.play.call(this);
                }.bind(this));
            }
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            let message = 'Sorry, I could not understand.';
            this.response.speak(message);
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
            let reprompt = 'You can say, yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
            controller.stop.call(this);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            controller.stop.call(this);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            let message = 'Sorry, I could not understand.';
            this.response.speak(message);
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
                request(request_string, function(error, response, body) {
                    initializeSession.call(this, body);

                    var token = String(this.attributes.playOrder[this.attributes.index]);
                    var playBehavior = 'REPLACE_ALL';
                    var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                    var offsetInMilliseconds = this.attributes.offsetInMilliseconds;
                    // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
                    this.attributes.enqueuedToken = null;

                    if (utils.canThrowCard.call(this)) {
                        var cardTitle = podcast.title + '(' + podcast.date + ')';
                        var cardContent = podcast.description + 'The feed has been refreshed.' + '\n' + this.attributes.dataRefresh;
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
                    var cardTitle = podcast.title + '(' + podcast.date + ')';
                    var cardContent = podcast.description + '\n' + this.attributes.dataRefresh;
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
                        var cardTitle = podcast.title + '(' + podcast.date + ')';
                        var cardContent = podcast.description;
                        this.response.cardRenderer(cardTitle, cardContent, null);
                    }

                    var message = 'You have reached the last available broadcast. Visit Renewing Your Mind dot org to access older broadcasts';
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

                    var message = 'You are listening to the most recent broadcast.';
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
            // Update audioData
            request(request_string, function(error, response, body) {
                initializeSession.call(this, body);
                var token = String(this.attributes.playOrder[this.attributes.index]);
                var playBehavior = 'REPLACE_ALL';
                var podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                var offsetInMilliseconds = this.attributes.offsetInMilliseconds;
                this.attributes.playbackIndexChanged = true;
                // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
                this.attributes.enqueuedToken = null;

                controller.play.call(this);
            }.bind(this));
        }
    }
}();
