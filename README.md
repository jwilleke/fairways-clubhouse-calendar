# Fairways Clubhouse Calendar Reservation System

Automated reservation system for The Fairways Clubhouse using Google Apps Script, Google Sheets, and Google Calendar.

## Overview

This system processes clubhouse reservation requests submitted via a Google Form. It automatically:
1. Validates the submission (e.g., checks if end time is after start time).
2. Checks for scheduling conflicts in the designated Google Calendar.
3. Creates a calendar event if no conflicts exist.
4. Sends confirmation or conflict notification emails to the requester and a monitored group address.
5. Updates the Google Sheet with the status of the reservation.

## Project Structure

- `Code.js`: Contains entry points and older logic (preserved for reference).
- `calendar-reservation.js`: The primary logic for the reservation system, including conflict detection, email drafting, and event creation.
- `appsscript.json`: Manifest file for the Google Apps Script project.
- `.clasp.json`: Configuration for `clasp` (ignored by Git for security).

## Development with `clasp`

This project is managed using [clasp](https://github.com/google/clasp) (Command Line Apps Script Projects).

### Prerequisites

- Node.js installed.
- `clasp` installed globally:
  ```bash
  npm install -g @google/clasp
  ```
- Google Apps Script API enabled in your [Google Account settings](https://script.google.com/home/usersettings).

### Setup

1. **Login to clasp:**
   ```bash
   clasp login
   ```

2. **Clone the project:**
   If you are setting up for the first time in a new directory:
   ```bash
   clasp clone <scriptId>
   ```
   (The `scriptId` can be found in `.clasp.json` or the script settings on the Apps Script dashboard.)

3. **Ignore `.clasp.json`:**
   Ensure `.clasp.json` is not committed to version control as it contains project-specific identifiers.

### Commands

- **Pull changes from Google:**
  ```bash
  clasp pull
  ```

- **Push changes to Google:**
  ```bash
  clasp push
  ```

- **Open the project in the browser:**
  ```bash
  clasp open
  ```

- **Watch for changes and push automatically:**
  ```bash
  clasp push --watch
  ```

## Configuration

The system uses several constants defined at the top of `calendar-reservation.js`:

- `calendarID`: The ID of the Google Calendar where events are created.
- `calendarSheetName`: The name of the sheet within the spreadsheet containing form responses.
- `eventLocation`: The physical address added to calendar events.
- `monitoredAddressStr`: The email address (usually a group) that receives copies of all notifications.
- `SENDMAIL`: A boolean flag to enable/disable email sending during testing.

## Deployment

1. Push the code using `clasp push`.
2. In the Google Apps Script editor, set up an "On form submit" trigger for the `rowAddedFromForm` function.
