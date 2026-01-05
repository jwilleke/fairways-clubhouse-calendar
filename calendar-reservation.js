/**
 * Calendar Reservation System
 * some code and concepts  stolen from Kurt Kaiser, 2018
 * The request object is created by function Submission(row)
 * This object is presented to:
 * function getConflicts(request) - where if there is a conflict an email is snet and no event is created.
 */
const calendarID = "c527h0vfni1e1cibsf97pht1ak@group.calendar.google.com";
const aSheet = SpreadsheetApp.getActiveSheet(); //sheet is some sheet within the spreadsheet.
const spreadSheet = aSheet.getParent(); // this is the entrie spreadsheet.
const calendarSheetName = spreadSheet.getSheetByName("Form Responses 1"); // sheetName we are using  Calendar to output requests
const eventCal = CalendarApp.getCalendarById(calendarID); // calendar we are populating
const eventLocation = "The Fairways Condominiums, 89 Fairway Dr, Mt Vernon, OH 43050, USA";
const monitoredAddressStr = "fairwayscondos-clubhouse@googlegroups.com";
const timeZone = Session.getScriptTimeZone();
const SENDMAIL=true;

function testLastRow() {
  rowAddedFromForm();
}

function testTimeZone(){
  var timeZone = Session.getScriptTimeZone();
  Logger.log(timeZone);
}

function testARow() {
  const row = 203;
  var request = new Submission(row);
  Logger.log(request);
  // Checks for conflicts and if none 
  getConflicts(request);
  Logger.log(request);
}


/**
 * On form submission triggers this function
 * I think this is all we need to do.
 */
function rowAddedFromForm(e) {
  // Use the event object if available (triggered by form submit), otherwise use the last row (manual run)
  const row = e ? e.range.getRow() : calendarSheetName.getLastRow();
  //createEventFromRow(row);
  // create a request object
  var request = new Submission(row);
  // check times
  if (request.endTimestamp <= request.startTimestamp) {
    request.status = "EndBeforeStart";
    // update sheet
    upDateSheetWithStatus(request);
    // create email message
    draftEmail(request);
    //send email
    if (SENDMAIL===true) {
      sendEmail(request);
    }else{
      Logger.log(`Emails were not sent: SENDMAIL=${SENDMAIL}`);
    }
    Logger.log(`FAILED: ${request.status} the Clubhouse Reservation for: 
    ${request.eventDescription} starts at: ${Utilities.formatDate(new Date(request.startTimestamp), Session.getScriptTimeZone(), 'h:mm a')} and ends at: ${Utilities.formatDate(new Date(request.endTimestamp), Session.getScriptTimeZone(), 'h:mm a')} 
    FAILED as The End Time is before the Start Time of the event!`)
    return; // do not call check for conflicts.
  }
  // check for conflicts which then calls updatesheet and sendemail
  getConflicts(request);
}


/**
 * Creates an object from the provided row
 */
function Submission(row) {
  this.row = row;
  // when reservation form was filled out
  this.timestamp = aSheet.getRange(row, 1).getValue();
  // email who filled out form
  this.email = aSheet.getRange(row, 2).getValue();
  // Displayed Description
  this.eventDisplayed = aSheet.getRange(row, 3).getValue();
  // data of event
  var eventDate = new Date(aSheet.getRange(row, 4).getValue());
  // fix event start
  var startTime = aSheet.getRange(row, 5).getValue();
  this.startTimestamp = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startTime.getHours(), startTime.getMinutes());
  //use this for formatting
  this.dateString = Utilities.formatDate(this.startTimestamp, 'America/New_York', 'MMMM dd, yyyy');
  //this.timeString = this.startTimestamp.toLocaleTimeString();
  // fix endtime
  var eventTimeEnd = calendarSheetName.getRange(row, 6).getValue(); // eventTimeEnd(F)
  this.endTimestamp = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), eventTimeEnd.getHours(), eventTimeEnd.getMinutes());
  // Displayed Description
  this.eventDescription = aSheet.getRange(row, 7).getValue();
  // contact phone
  this.name = aSheet.getRange(row, 9).getValue();
  // contacts name
  this.name = aSheet.getRange(row, 10).getValue();
}

// Check for conflicting events
/**
 * Submit a request object to getConflicts() and it will 
 * - create the event if there are no conflicts
 * - send an email
 */
function getConflicts(request) {
  var conflicts = eventCal.getEvents(request.startTimestamp, request.endTimestamp);
  if (conflicts.length < 1) {
    request.status = "Approve";
    // update sheet
    upDateSheetWithStatus(request);
    createEventFromRequest(request);
    // create email message
    draftEmail(request);
    // send email
    //send email
    if (SENDMAIL===true) {
      sendEmail(request);
    }else{
      Logger.log(`Emails were not sent: SENDMAIL=${SENDMAIL}`);
    }
  } else {
    request.status = "Conflict";
    Logger.log(request);
    // update sheet
    upDateSheetWithStatus(request);
    // create email message
    draftEmail(request);
    // send email
        //send email
    if (SENDMAIL===true) {
      sendEmail(request);
    }else{
      Logger.log(`Emails were not sent: SENDMAIL=${SENDMAIL}`);
    }
  }
  Logger.log(request);
}

// Convert data of status and notified columns into array
function StatusObject() {
  this.statusArray = sheet.getRange(1, lastColumn - 1, lastRow, 1).getValues();
  this.notifiedArray = sheet.getRange(1, lastColumn, lastRow, 1).getValues();
  this.statusArray = [].concat.apply([], this.statusArray);
  this.notifiedArray = [].concat.apply([], this.notifiedArray);
}

// Get the index of the row that has had a status change
function getChangeIndex(statusChange) {
  statusChange.index = statusChange.notifiedArray.indexOf("");
  statusChange.row = statusChange.index + 1;
  if (statusChange.index == -1) {
    return;
  } else if (statusChange.statusArray[statusChange.index] != "") {
    statusChange.status = statusChange.statusArray[statusChange.index];
    sheet.getRange(statusChange.row, lastColumn).setValue("Sent: " + statusChange.status);
    statusChange.notifiedArray[statusChange.index] = "update";
  } else {
    statusChange.status = statusChange.statusArray[statusChange.index];
    statusChange.notifiedArray[statusChange.index] = "no update";
  }
}

// Draft contents for emails depending on needed message
function draftEmail(request) {
  //request.buttonLink = "https://goo.gl/forms/c9pVUbeUYaA3tQ0A2"
  //request.buttonText = "New Request";
  switch (request.status) {
    case "New":
      request.subject = "Request for " + request.dateString + " Appointment Received";
      request.header = "Request Received";
      request.message = "Once the request has been reviewed you will receive an email updating you on it.";
      break;
    case "EndBeforeStart":
      request.subject = `ERROR: Clubhouse Reservation for: ${request.dateString} FAILED`;
      request.header = "Request Received";
      request.header = "Clubhouse Reservation";
      request.message = `Your Clubhouse Reservation for:
      ${request.eventDescription} starts at: ${Utilities.formatDate(new Date(request.startTimestamp), Session.getScriptTimeZone(), 'h:mm a')} and ends at: ${Utilities.formatDate(new Date(request.endTimestamp), Session.getScriptTimeZone(), 'h:mm a')} 
      FAILED as The End Time is before the Start Time of the event!
      Please Reschedule!`
      break;
    case "Approve":
      //request.email = already set from Submission(row)
      request.subject = "Confirmation: Clubhouse Reservation for " + request.dateString + " has been scheduled";
      request.header = "Confirmation: Clubhouse Reservation";
      request.message = "Your Clubhouse Reservation for\n"
        + request.eventDescription + " starts at: " + Utilities.formatDate(new Date(request.startTimestamp), Session.getScriptTimeZone(), 'h:mm a')
        + " and ends at: " + Utilities.formatDate(new Date(request.endTimestamp), Session.getScriptTimeZone(), 'h:mm a')
        + "\r\n Check the calendar at: "
        + "https://www.fairwayscondos.org/clubhouse-calendar";
      break;
    case "Conflict":
      request.subject = "Conflict with " + request.dateString + " Clubhouse Reservation Request";
      request.header = "Conflict: Clubhouse Reservation";
      request.message = "There was a scheduling conflict for your Clubhouse Reservation."
        + "Please reschedule."
        + "\r\nCheck the calendar at: "
        + "https://www.fairwayscondos.org/clubhouse-calendar";;
      //request.buttonText = "Reschedule";
      break;
    case "Reject":
      request.subject = "Update on Appointment Requested for " + request.dateString;
      request.header = "Reschedule: Clubhouse Reservation";
      request.message = "Unfortunately the request times does not work. Could " +
        "we reschedule?";
      //request.buttonText = "Reschedule";
      break;
    case "ERROR":
      request.email = "jim@willeke.com";
      request.subject = "ERROR: Clubhouse Reservation for " + request.dateString + " FAILED";
      request.header = "Confirmation: Clubhouse Reservation";
      request.message = "Your Clubhouse Reservation for\n"
        + request.eventDescription + " starts at: " + Utilities.formatDate(new Date(request.startTimestamp), Session.getScriptTimeZone(), 'h:mm a')
        + " and ends at: " + Utilities.formatDate(new Date(request.endTimestamp), Session.getScriptTimeZone(), 'h:mm a');
      + "\n\n FAILED!"
      // 
      // create email message
      draftEmail(request);
      sendEmail(request);
      break;
  }
}

/**
 * Create Clubhouse Calendar event from a row with the calendarSheetName
 */
function createEventFromRequest(request) {
  console.log(`createEventFromRow: ${request.row}`);
  var options = {
    location: 'The Fairways Condominiums, 89 Fairway Dr, Mt Vernon, OH 43050, USA',
    guests: request.email,
    description: request.eventDisplayed,
    sendInvites: true
  }; // make it true when prod
  // create event
  try {
    // Ok create the event
    var event = eventCal.createEvent(request.eventDisplayed, new Date(request.startTimestamp), new Date(request.endTimestamp), options);
    console.log('calID: ' + event.getId());
    var eventId = event.getId().split("@")[0].toString();
    console.log(`eventId: ${eventId}`);
  } catch (err) {
    responseStatus = err.message;
    request.status = "ERROR";
    request.error = responseStatus;
    Logger.log('Failed with error %s', responseStatus);
    upDateSheetWithStatus(request);
  }
  console.log(`createEventFromRow: ${request.row} End`);
}


// Creates a calendar event using the submitted data
function updateCalendar(request) {
  var event = eventCal.createEvent(
    request.reason,
    request.date,
    request.endTime
  )
}

// Send Email
function sendEmail(request) {
  if (request.email) { // if NOT empty and not null use value
    emailAddressStr = request.email;
  }
  else {
    emailAddressStr = monitoredAddressStr;
  }
  MailApp.sendEmail({
    to: emailAddressStr,
    subject: request.subject,
    body: request.message,
    cc: monitoredAddressStr
  })
}

/**
 * Updates the sheet with the current status.
 */
function upDateSheetWithStatus(request) {
  // update sheet
  var myCell = "N" + request.row;
  calendarSheetName.getRange(myCell).setValue(request.status);
}

// --------------------  Main Functions ---------------------
function onFormSubmission() {
  var request = new Submission(lastRow);
  Logger.log(request);
  getConflicts(request);
  //draftEmail(request);
  Logger.log(request.status);
  //sendEmail(request);
  //if (request.status == "New"){
  //  request.status = "New2";
  //  draftEmail(request);
  //  sendEmail(request);
  //}
}

// Triggered function to check if any status has changed
function onEdit() {
  var statusChange = new StatusObject();
  while (true) {
    getChangeIndex(statusChange);
    if (statusChange.index == -1) {
      return;
    } else {
      var request = new Submission(statusChange.row);
      if (statusChange.status) {
        request.status = statusChange.status;
        if (statusChange.status == "Approve") {
          updateCalendar(request);
        }
        draftEmail(request);
        sendEmail(request);
      }
    }
  }
}
