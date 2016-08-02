// Options
var SOON_TIME = 5 * 60 * 1000;

// Parse a time string and return a date object
function parseTimeString(timeString) {
	var time = new Date();
	
	time.setHours(timeString.substring(0, timeString.indexOf(':')));
	time.setMinutes(timeString.substring(timeString.indexOf(':') + 1));
	time.setSeconds(0);
	
	return time;
}

function formatDuration(milliseconds) {
	var seconds = Math.floor(milliseconds / 1000);

	var hours = Math.floor(seconds / (60 * 60));
	seconds -= hours * (60 * 60);

	var minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	
	return hours										+ ":"
		+ ((minutes < 10) ? "0" + minutes : minutes)	+ ":"
		+ ((seconds < 10) ? "0" + seconds : seconds);
}

// KnockoutJS
function School(name, breaks) {
	var self = this;

	self.name = name;
	self.breaks = _.map(breaks, function(aBreak) {
		return parseTimeString(aBreak);
	});
}

function SchoolsViewModel() {
	var self = this;

	// Schools
	self.schools = _.map(schools, function(school) {
		return new School(school.name, school.breaks);
	});
	self.chosenSchool = ko.observable(self.schools[0]);

	// Hash-based navigation
	self.chosenSchool.subscribe(function (newValue) {
		window.location.hash = "#" + newValue.name;
	});
	window.onhashchange = function() {
		var school = _.findWhere(self.schools, { name: location.hash.substring(1) });
		if (school != undefined) {
			self.chosenSchool(school);
		}
	}
	window.onhashchange();

	// Timekeeping
	self.now = ko.observable(new Date());
	setInterval(function() {
		self.now(new Date());
	}, 1000);

	// Calculations
	self.nextBreak = ko.computed(function() {
		while(true) {
			// Find next break today
			var nextBreak = _.find(self.chosenSchool().breaks, function(aBreak) {
				return self.now() < aBreak;
			});

			// Return a break if any
			if (nextBreak != undefined) {
				return nextBreak;
			}

			// If none were found, look tomorrow
			_.each(self.chosenSchool().breaks, function (aBreak) {
				aBreak.setDate(aBreak.getDate() + 1);
			});
		}
	});

	self.timeUntilNextBreak = ko.computed(function() {
		return self.nextBreak() - self.now();
	});

	// Display
	self.displayTime = ko.computed(function() {
		return formatDuration(self.timeUntilNextBreak());
	});

	self.breakSoon = ko.computed(function() {
		return self.timeUntilNextBreak() < SOON_TIME;
	});
}

window.onload = function() {
	ko.applyBindings(new SchoolsViewModel());
};