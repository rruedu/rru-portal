# 1. Static GitHub Pages Frontend with Google Apps Script Backend

We decided to host the public portal UI as a static responsive single-page application on GitHub Pages, backed by a Google Apps Script Web App providing REST API endpoints connected to a Google Spreadsheet database. This avoids Google Apps Script web app URL limitations (iframe constraints, authorization warning banners, and slow cold-start UI rendering) while leveraging Google Sheets as a familiar, zero-maintenance database for school administrators.
