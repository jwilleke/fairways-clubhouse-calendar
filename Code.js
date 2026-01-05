// Most of the working code is in calendar-reservation.gs

/**
 * Constants
 * 
 */
// moved to calendar-reservation.gs const calendarID = "c527h0vfni1e1cibsf97pht1ak@group.calendar.google.com";
// moved to calendar-reservation.gs const aSheet = SpreadsheetApp.getActiveSheet(); //sheet is some sheet within the spreadsheet.
// moved to calendar-reservation.gs const spreadSheet = aSheet.getParent(); // this is the entrie spreadsheet.
// moved to calendar-reservation.gs const calendarSheetName = spreadSheet.getSheetByName("Form Responses 1"); // sheetName we are using
// moved to calendar-reservation.gs const eventCal = CalendarApp.getCalendarById(calendarID); // calendar we are populating
// moved to calendar-reservation.gs const eventLocation = "The Fairways Condominiums, 89 Fairway Dr, Mt Vernon, OH 43050, USA";
// moved to calendar-reservation.gs const monitoredAddressStr = "fairwayscondos-clubhouse@googlegroups.com";

function myFunction() {
  const row = 198;
  createEventFromRow(row);
  //createEvent(row);
}

/**
 * I think this is all we need to do.
 */
function OLDrowAddedFromForm() {
  const row = calendarSheetName.getLastRow();
  //createEventFromRow(row);
  // create a request object
  var request = new Submission(row);
  // check for conflicts
  getConflicts(request); 
  
//  var request = new Submission(row);
//  Logger.log(`request: ${request}`);
}




/**
 * OLD System
 * Create Clubhouse Calendar event from a row with the calendarSheetName
 */
function OLDcreateEventFromRow(row) {
  console.log(`createEventFromRow: ${row}`);
  var responseStatus = "Calendar event successfully created."; // responseStatus(N)
  // Get response values
  var eventName = calendarSheetName.getRange(row, 3).getValue(); // eventName (C)
  console.log(`eventName: ${eventName}`);
  var eventDate = calendarSheetName.getRange(row, 4).getValue(); // eventDate(D)
  console.log(`eventDate: ${eventDate}`);
  var eventTimeStart = calendarSheetName.getRange(row, 5).getValue(); //eventTimeStart(E)
  console.log(`eventTimeStart: ${eventTimeStart}`);
  var startTimestamp = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), eventTimeStart.getHours(), eventTimeStart.getMinutes());
  console.log(`startTimestamp: ${startTimestamp}`);
  var eventTimeEnd = calendarSheetName.getRange(row, 6).getValue(); // eventTimeEnd(F)
  var endTimestamp = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), eventTimeEnd.getHours(), eventTimeEnd.getMinutes());
  Logger.log(`endTimestamp: ${endTimestamp}`);
  var eventDescripotion = calendarSheetName.getRange(row, 7).getValue(); // eventTimeEnd(G)
  var eventguests = calendarSheetName.getRange(row, 2).getValue(); // eventTimeEnd(B)
  var options = {
    location: 'The Fairways Condominiums, 89 Fairway Dr, Mt Vernon, OH 43050, USA',
    guests: eventguests,
    description: eventDescripotion, sendInvites: false
  }; // make it true when prod
  // create event
  try {
    var myCell = "N" + row;
    var event = eventCal.createEvent(eventName, startTimestamp, endTimestamp, options);
    calendarSheetName.getRange(myCell).setValue(responseStatus);
    console.log('calID: ' + event.getId());
    var eventId = event.getId().split("@")[0].toString();
    console.log(`eventId: ${eventId}`);
  } catch (err) {
    responseStatus = err.message
    Logger.log('Failed with error %s', responseStatus);
    calendarSheetName.getRange(myCell).setValue(responseStatus);
  }
  console.log(`createEventFromRow: ${row} End`);
}


/**
 * OLD
 * Creates an event in the user's default calendar.
 * @see https://developers.google.com/calendar/api/v3/reference/events/insert
 */
function OLDcreateEvent(row) {
  // NO WORK
  console.log(`createEvent Start`);
  var responseStatus = "Calendar event successfully created."; // responseStatus(N)
  // Get response values
  var eventName = calendarSheetName.getRange(row, 3).getValue(); // eventName (C)
  console.log(`eventName: ${eventName}`);
  var eventDate = calendarSheetName.getRange(row, 4).getValue(); // eventDate(D)
  console.log(`eventDate: ${eventDate}`);
  var eventTimeStart = calendarSheetName.getRange(row, 5).getValue(); //eventTimeStart(E)
  console.log(`eventTimeStart: ${eventTimeStart}`);
  var startTimestamp = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), eventTimeStart.getHours(), eventTimeStart.getMinutes());
  console.log(`startTimestamp: ${startTimestamp}`);
  var eventTimeEnd = calendarSheetName.getRange(row, 6).getValue(); // eventTimeEnd(F)
  var endTimestamp = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), eventTimeEnd.getHours(), eventTimeEnd.getMinutes());
  console.log(`endTimestamp: ${endTimestamp}`);
  var eventDescripotion = calendarSheetName.getRange(row, 7).getValue(); // eventTimeEnd(G)
  var eventguests = calendarSheetName.getRange(row, 2).getValue(); // eventTimeEnd(B)
  // event details for creating event.
  let event = {
    summary: eventName,
    location: eventLocation,
    description: eventDescripotion,
    start: {
      dateTime: startTimestamp.toISOString()
    },
    end: {
      dateTime: endTimestamp.toISOString()
    },
    attendees: [
      { email: eventguests },
    ]
  };
  try {
    // call method to insert/create new event in provided calandar
    event = eventCal.Event.insert(event, calendarId);
    Logger.log('Event ID: ' + event.id);
  } catch (err) {
    Logger.log('Failed with error %s', err.message);
  }
}