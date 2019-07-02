/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
define(['ojs/ojcore', 'jquery', 'knockout'], function (oj, $, ko) {
  function connectionMessageViewModel(app) {
    var self = this;

    // connection change event
    // cordova-plugin-network-information plugin is needed for hybrid app
    window.addEventListener('online',  onlineHandler);
    window.addEventListener('offline', offlineHandler);

    var MESSAGES = {
      'online': 'You are connected to network.',
      'offline': 'You are not connected to network.'
    };

    self.online = ko.observable(true);
    self.message = ko.observable()

    var currentTimer;

    // toggle between primary message and secondary message
    self.toggleMessageContent = function(firstText, secondText) {
      self.message(firstText);
      currentTimer = window.setTimeout(function () {
        self.message(secondText);
        self.toggleMessageContent(secondText, firstText);
      }, 2000)
    }


    function onlineHandler() {
      document.body.classList.remove('offline');

      self.online(true);
      self.message(MESSAGES['online']);
      clearTimeout(currentTimer);

      // check if there is unsynced requests
      app.offlineController.getSyncLog().then(function (value) {
        if(value.length > 0) {
          app.offlineController.sync().then(function () {
            self.openDrawer('Your updates have been applied.');
          }).catch(function (e) {
            self.openDrawer('Failed to sync your updates.');
          })
        } else {
          self.openDrawer();
        }
      })

    }

    function offlineHandler() {
      document.body.classList.add('offline');

      self.online(false);
      self.message(MESSAGES['offline']);
      clearTimeout(currentTimer);

      var state = oj.Router.rootInstance.currentState().id;
      if(state === 'incidents' || state === 'createIncident')
        return self.openDrawer('You can create/edit incidents offline.')
      if(state === 'customers')
        return self.openDrawer('You can create/edit customers offline.')
      if(state === 'profile')
        return self.openDrawer('You can edit profile offline.')

      return self.openDrawer();

    }

    self.openDrawer = function (secondMessage) {
      oj.OffcanvasUtils.open({selector: '#connectionDrawer', modality: 'modaless', displayMode: 'overlay', content: '#pageContent' });
      clearTimeout(currentTimer);

      if(secondMessage)
        self.toggleMessageContent(self.message(), secondMessage)
    }

    self.showAfterUpdateMessage = function () {
      var state = oj.Router.rootInstance.currentState().id;
      self.message('Updates will be applied when online.');
      self.openDrawer();
    }


	self.showAfterNewEventCreate = function () {
      var state = oj.Router.rootInstance.currentState().id;
      self.message('New calendar event added.');
      self.openDrawer();
    }

	self.showNewEventCreateFailedMsg = function () {
      var state = oj.Router.rootInstance.currentState().id;
      self.message('New calendar could not be created.');
      self.openDrawer();
    }

    self.closeDrawer = function () {
      oj.OffcanvasUtils.close({selector: '#connectionDrawer' });
    };

    // clear timer when drawer is dismissed
    $("#connectionDrawer").on("ojclose", function(event, offcanvas) {
      clearTimeout(currentTimer);
    });

  }
  return connectionMessageViewModel;
})
