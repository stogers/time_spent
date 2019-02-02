var eventColorCat = {
    7: "social",
    3: "work",
    4: "exercise",
    9: "eating",
    2: "personal growth"
}

// note: changed from project id (found in toggl) to 0 for security
var catToId = {
  "exercise": 0,
  "eating": 0,
  "meetings": 0,
  "social": 0,
  "mental health": 0,
  "personal growth": 0,
  "work": 0
}

var notation = "yyyy-mm-ddThh:mm:ss.nnnnnn+|-hh:mm"

function getCalendarEvents() {
  var calen = CalendarApp.getDefaultCalendar();
  var end = new Date("2019-02-17");
  var start = new Date(end.getTime() - (1 * 7 * 24 * 60 * 60 * 1000));
  var events = calen.getEvents(start, end);
  return events;
}

function processEvent(event) {
  var eventTitle = event.getTitle();
  var eventLength = getSeconds(event);
  var eventCat = getCategory(event);
  var eventStart = event.getStartTime().toISOString().replace("Z","");
  if (validateEvent(event, eventLength)) {
    logEvent(eventTitle, eventCat, eventLength, eventStart);
  }
}

function validateEvent(event, eventLength) {
  return (eventLength > 0 && eventLength < 60*60*24) && (event.getMyStatus() == "YES" || event.getMyStatus() == "OWNER"); // less than a day long
}

// note: changed apiToken to 'XXXX' replace with apiToken from Toggl
function logEvent(eventTitle, eventCat, eventLength, eventStart) {
  var apiToken = 'XXXX'
  var unamepass = apiToken + ":api_token"; 
  var digest = Utilities.base64Encode(unamepass);
  var digestfull = "Basic " + digest;
  var url = "https://www.toggl.com/api/v8/time_entries";
  var data = {"time_entry":{"pid":catToId[eventCat], "description": eventTitle,"created_with":"API example code","start": eventStart + "-08:00","duration":eventLength,"wid":3216280}};
  var options = { 
                   "contentType": "application/json",
                   "method": "post",
                   "headers": {"Authorization": digestfull},
                   "payload": JSON.stringify(data)
                 };
  var response = UrlFetchApp.fetch(url, options);
}

function getCategory(event) {
  Logger.log(event.getColor());
  if(event.getColor()) {
    return eventColorCat[event.getColor()];
  }
  return "meetings"; // default color (light purple) is a meeting
}

function getSeconds(event) {
  var start = event.getStartTime();
  var end = event.getEndTime();
  var diff = end - start;
  return diff/(1000);
}

function main() {
  var events = getCalendarEvents();
  for (var i = 0; i < events.length; i++) {
    processEvent(events[i]);
  }
}
