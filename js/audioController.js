'use strict';

const request = require('request');
const constants = require('./constants');
const utils = require('./utils');
const endpoint = 'http://fiveqstaging.ligonier.org/podcasts/rym-minute/alexa.json';

const controller = {
    play: function() {
        /*
         *  Using the function to begin playing audio when:
         *      Play Audio intent invoked.
         *      Resuming audio when stopped/paused.
         *      Next/Previous commands issued.
         */
        this.handler.state = constants.states.PLAY_MODE;

        if (this.attributes.playbackFinished) {
            // Reset to top of the playlist when reached end.
            this.attributes.index = 0;
            this.attributes.offsetInMilliseconds = 0;
            this.attributes.playbackIndexChanged = true;
            this.attributes.playbackFinished = false;

            // Update audioData
            let today = new Date();
            let dataRefresh = new Date(this.attributes.dataRefresh);
            if ((today - dataRefresh) >= 86400000) {
                request(endpoint, function(error, response, body) {
                    this.attributes.audioData = JSON.parse(body);
                    this.attributes.dataRefresh = today.toString();
                    this.attributes.playOrder = Array.apply(null, {
                        length: this.attributes.audioData.length
                    }).map(Number.call, Number);

                    let token = String(this.attributes.playOrder[this.attributes.index]);
                    let playBehavior = 'REPLACE_ALL';
                    let podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                    let offsetInMilliseconds = this.attributes.offsetInMilliseconds;
                    // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
                    this.attributes.enqueuedToken = null;

                    if (utils.canThrowCard.call(this)) {
                        let cardTitle = 'Playing ' + podcast.title;
                        let cardContent = 'Playing ' + podcast.title + '.\n audioData = ' + this.attributes.audioData;
                        this.response.cardRenderer(cardTitle, cardContent, null);
                    }

                    this.response.audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
                    this.emit(':responseReady');
                }.bind(this));
            } else {
                let token = String(this.attributes.playOrder[this.attributes.index]);
                let playBehavior = 'REPLACE_ALL';
                let podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                let offsetInMilliseconds = this.attributes.offsetInMilliseconds;
                // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
                this.attributes.enqueuedToken = null;

                if (utils.canThrowCard.call(this)) {
                    let cardTitle = 'Playing ' + podcast.title;
                    let cardContent = 'Playing ' + podcast.title;
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }

                this.response.audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
                this.emit(':responseReady');
            }
        } else {
            let token = String(this.attributes.playOrder[this.attributes.index]);
            let playBehavior = 'REPLACE_ALL';
            let podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
            let offsetInMilliseconds = this.attributes.offsetInMilliseconds;
            // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
            this.attributes.enqueuedToken = null;

            if (utils.canThrowCard.call(this)) {
                let cardTitle = 'Playing ' + podcast.title;
                let cardContent = 'Playing ' + podcast.title;
                this.response.cardRenderer(cardTitle, cardContent, null);
            }

            this.response.audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
            this.emit(':responseReady');
        }
    },
    stop: function() {
        /*
         *  Issuing AudioPlayer.Stop directive to stop the audio.
         *  Attributes already stored when AudioPlayer.Stopped request received.
         */
        this.response.audioPlayerStop();
        this.emit(':responseReady');
    },
    playNext: function() {
        /*
         *  Called when AMAZON.NextIntent or PlaybackController.NextCommandIssued is invoked.
         *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
         *  If reached at the end of the playlist, choose behavior based on "loop" flag.
         */
        let index = this.attributes.index;
        index += 1;
        // Check for last audio file.
        if (index === this.attributes.audioData.length) {
            if (this.attributes.loop) {
                index = 0;
            } else {
                // Reached at the end. Thus reset state to start mode and stop playing.
                this.handler.state = constants.states.START_MODE;

                if (utils.canThrowCard.call(this)) {
                    let cardTitle = 'Playing ' + podcast.title;
                    let cardContent = 'Playing ' + podcast.title + '.\n audioData = ' + this.attributes.audioData;
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }

                let message = 'You have reached at the end of the playlist.';
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
    playPrevious: function() {
        /*
         *  Called when AMAZON.PreviousIntent or PlaybackController.PreviousCommandIssued is invoked.
         *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
         *  If reached at the end of the playlist, choose behavior based on "loop" flag.
         */
        let index = this.attributes.index;
        index -= 1;
        // Check for last audio file.
        if (index === -1) {
            if (this.attributes.loop) {
                index = this.attributes.audioData.length - 1;
            } else {
                // Reached at the end. Thus reset state to start mode and stop playing.
                this.handler.state = constants.states.START_MODE;

                let message = 'You have reached at the start of the playlist.';
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
    loopOn: function() {
        // Turn on loop play.
        this.attributes.loop = true;
        let message = 'Loop turned on.';
        this.response.speak(message);
        this.emit(':responseReady');
    },
    loopOff: function() {
        // Turn off looping
        this.attributes.loop = false;
        let message = 'Loop turned off.';
        this.response.speak(message);
        this.emit(':responseReady');
    },
    shuffleOn: function() {
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
    shuffleOff: function() {
        // Turn off shuffle play.
        if (this.attributes.shuffle) {
            this.attributes.shuffle = false;
            // Although changing index, no change in audio file being played as the change is to account for reordering playOrder
            this.attributes.index = this.attributes.playOrder[this.attributes.index];
            this.attributes.playOrder = Array.apply(null, {
                length: this.attributes.audioData.length
            }).map(Number.call, Number);
        }
        controller.play.call(this);
    },
    startOver: function() {
        // Start over the current audio file.
        this.attributes.offsetInMilliseconds = 0;
        controller.play.call(this);
    },
    reset: function() {
        // Reset to top of the playlist.
        this.attributes.index = 0;
        this.attributes.offsetInMilliseconds = 0;
        this.attributes.playbackIndexChanged = true;

        // Update audioData
        let today = new Date();
        let dataRefresh = new Date(this.attributes.dataRefresh);
        if ((today - dataRefresh) >= 86400000) {
            request(endpoint, function(error, response, body) {
                this.attributes.audioData = JSON.parse(body);
                this.attributes.dataRefresh = today.toString()
                this.attributes.playOrder = Array.apply(null, {
                    length: this.attributes.audioData.length
                }).map(Number.call, Number);

                let token = String(this.attributes.playOrder[this.attributes.index]);
                let playBehavior = 'REPLACE_ALL';
                let podcast = this.attributes.audioData[this.attributes.playOrder[this.attributes.index]];
                let offsetInMilliseconds = this.attributes.offsetInMilliseconds;
                // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
                this.attributes.enqueuedToken = null;

                controller.play.call(this);
            }.bind(this));
        } else {
            controller.play.call(this);
        }
    }
};

module.exports = controller;
