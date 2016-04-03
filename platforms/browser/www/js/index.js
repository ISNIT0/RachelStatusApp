/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        var fail = function (e) {
            $('body').removeClass('success').addClass('fail');
            $('.status').text(e || 'There was an error connecting');
        };
        var pass = function () {
            $('body').removeClass('fail').addClass('success');
            $('.status').text('Success!');
        };

        var connect = function (ssid, handler) {
            WifiWizard.getCurrentSSID(function (currentssid) {
                if (ssid != currentssid)
                    WifiWizard.connectNetwork(ssid, handler, fail);
                else
                    handler();
            }, fail);
        };

        var checkRachel = function () {
            getrouteripaddress.getRouterIPAddress(function (ip) {
                cordovaHTTP.get('http://' + ip, {}, {},
                    function (response) {
                        pass();
                    },
                    function (response) {
                        fail('Cannot connect to server');
                        setTimeout(function () {
                            checkRachel();
                        }, 10000);
                    });
            }, function () {
                fail('Cannot connect to WiFi network');
                setTimeout(function () {
                    checkRachel();
                }, 5000);
            });
        };

        try {

            var defaultSSID = 'ReeveHome';
            var defaultPass = 'bcf4c9c396';

            WifiWizard.listNetworks(function (networks) {
                var defaultExists = networks.filter(function (network) {
                    return network == defaultSSID;
                }).length > 0;

                if (!defaultExists) //Network not yet added
                    WifiWizard.addNetwork(WifiWizard.formatWPAConfig(defaultSSID, defaultPass), function () {
                    connect(defaultSSID, checkRachel);
                }, fail);
                else
                    connect(defaultSSID, checkRachel);
            }, fail);

        } catch (e) {
            alert(e);
            fail();
        }
    }
};

app.initialize();