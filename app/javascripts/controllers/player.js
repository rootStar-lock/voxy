var voxyControllers = angular.module('voxyControllers');

voxyControllers.controller('PlayerCtrl', ['$scope', '$window', '$routeParams', '$localStorage', 'speakerService', 'navigationService', 'parseFileService',
function ($scope, $window, $routeParams, $localStorage, speakerService, navigationService, parseFileService) {
	speakerService.spawn();
	this.alerts = [];
	this.playerStyle = {};
	this.state = 'none';
	this.splitByChapters = true;
	this.selectedIndex = 0;
	this.chapterIndex = -1;
	this.bookmarkIndex = -1;

	this.loadFile = function(filename) {
		var self = this;
		parseFileService(filename, function(alerts, sentenses) {
			$scope.$apply(function() {
				self.state = 'loaded';
				self.alerts = alerts;
				self.sentenses = sentenses;	
			});
		});
	}

	if ($routeParams.bookId) {
		this.book = $localStorage.books.filter(function(book) { return book.id == $routeParams.bookId; }).shift();
		this.bookLoaded = true;
		this.state = 'loading';
		this.loadFile(this.book.file);
	} else {
		this.bookLoaded = false;
		this.book = $localStorage;
	}

	this.addBookmark = function(sentense) {
		this.book.bookmarks.push({ text: sentense.text, sentense: sentense.id, index: this.book.bookmarks.length });
	}

	this.deleteBookmark = function(index) {
		this.book.bookmarks = this.book.bookmarks.filter(function(bookmark) {
			return index !== bookmark.index;
		});
	}

	this.waitAndNavigate = function(index) {
		var self = this;
		var parent = document.getElementsByClassName('text-editor')[0];
		var checkExist = setInterval(function() {
			if ((child = document.getElementById('sentense-'+index))) {
				clearInterval(checkExist);
				if (self.autoscroll === 'top') {
					navigationService(parent, child, -self.scrollOffset);
				} else if (self.autoscroll === 'bottom') {
					navigationService(parent, child, -(parent.offsetHeight - self.scrollOffset));
				}
			}
		}, 100);
	}

	this.navigateTo = function(index, indexName) {
		this.selectedIndex = index;
		this[indexName] = index;
		this.waitAndNavigate(index);
	}

	this.getDangerAlerts = function() {
		return this.alerts.filter(function(alert){ 
			return alert.type === 'danger';
		});
	}

	this.closeAlert = function(index) {
		this.alerts.splice(index, 1);
	}

	this.openFile = function() {
		$('#input-file').click();
	}

	this.humanizeState = function() {
		if (this.state === 'loaded') {
			return "Listen";
		} else if (this.state === 'loading') {
			return "Loading file...";
		} else if (this.state === 'plays') {
			return "Pause reading";
		} else if (this.state === 'frozen') {
			return "Resume reading";
		} else if (this.state === 'none') {
			return "Wait file...";
		} else if (this.state === 'error') {
			return "Restart after error...";
		}
	}

	this.speak = function() {
		var self = this;

		function play() {
			self.state = 'plays';
			if (self.autoscroll !== 'disabled') {
				self.waitAndNavigate(self.selectedIndex);
			}
			speakerService.say("voice_msu_ru_nsh_clunits", self.sentenses[self.selectedIndex].text, function(error) {
				if (error) {
					$scope.$apply(function () {
						self.state = 'error';
						self.alerts.push({
							type: 'danger',
							head: 'Reading',
							text: error.toString()
						});
					});
				} else {
					$scope.$apply(function () {
						if (++self.selectedIndex < self.sentenses.length && self.state === 'plays') {
							play();
						}
					});
				}
			});
		}
		
		this.chapterIndex = -1;
		this.bookmarkIndex = -1;

		if (this.state === 'loaded') {
			play();
		} else if (this.state === 'plays') {
			this.state = 'frozen';
		} else if (this.state === 'frozen') {
			play();
		} else if (this.state === 'error') {
			play();
		}
	}
}]);
