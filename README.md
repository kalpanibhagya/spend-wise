# SpendWise

![SpendWise App](spendwise-app.png)

SpendWise is a desktop application for managing and tracking personal expenses. Built with Angular 21 and Electron, it provides an intuitive interface for recording expenses, viewing monthly summaries, and receiving spending reminders.

## Features

- **Expense tracking**: Add and manage your daily expenses with an easy-to-use form
- **Monthly summary**: View comprehensive charts and statistics of your monthly spending including future spending (recurrring payments)
- **Yearly spending overview**: Yearly report with charts 
- **Reminders**: Set up reminders to help you stay on budget (To be implemented)
- **Desktop application**: Built with Electron for a native desktop experience
- **Responsive design**: Clean, modern UI with Font Awesome icons
- **Data Cleanup**: Delete all expenses for a selected month or an entire year from the Settings panel
- **Export**: Export expenses as CSV (selected month, selected year, or all data) from the Settings panel

## Tech Stack

- **Frontend**: Angular 21
- **Desktop**: Electron 39
- **Charts**: ECharts via ngx-echarts
- **Database**: SQLite (using `better-sqlite3`) 
- **Build Tool**: Angular CLI 21

## Getting Started

### Prerequisites

- Node.js (with npm)
- Angular CLI

### Installation

```bash
npm install
```

## Running the Application

To start the desktop application:

```bash
npm start
```

This command builds the Angular application and launches it in Electron.

## To be implemented

- Reminders
- Updated/Delete expense
- Yearly summary of the expenses