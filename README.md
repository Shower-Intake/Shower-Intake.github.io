# Shower Intake

A comprehensive React-based web application for managing shower intake, real-time shower tracking, and analytics for homeless shelters and community centers.

## Features

### 🚿 Intake Management
- **Guest Registration**: Complete intake form with personal information, service needs, and demographics
- **Queue Management**: Automatic queue numbering and status tracking with timezone-aware filtering
- **Ban Management**: Track and manage banned guests with temporary or permanent restrictions
- **Real-time Status**: Color-coded status indicators (Green: Showering, Yellow: Queued, Red: Overflow, Gray: Left)
- **Search Functionality**: Quick search by first or last name
- **Timezone Support**: Browser timezone detection with manual override options

### ⏰ Real-time Shower Tracking
- **Live Timers**: Real-time countdown timers for active showers
- **Status Management**: Track shower status (Ready, Showering, Cleaning, Waiting)
- **Guest Assignment**: Assign queued guests to available showers
- **Automatic Transitions**: Automatic status changes based on time limits
- **Queue Overview**: Real-time queue status and statistics

### 📊 Comprehensive Logs
- **Complete History**: Detailed logs of all showered guests with timezone-aware date filtering
- **Sortable Data**: Sort by any column (date, name, status, etc.)
- **Duration Tracking**: Calculate shower duration and time between showers
- **Service Tracking**: Track shower, clothing, and other service usage
- **Export Ready**: Data formatted for reporting and analysis
- **Current Date Focus**: Automatically shows only today's data based on selected timezone

### 📈 Analytics & Metrics
- **Daily Trends**: Line charts showing daily shower counts with timezone support
- **Duration Distribution**: Pie charts showing shower duration patterns
- **Hourly Usage**: Bar charts showing peak usage hours
- **Demographics**: Race/ethnicity distribution analysis
- **Service Types**: Breakdown of service usage patterns
- **Real-time Stats**: Live statistics and summary cards
- **Timezone-Aware Data**: All metrics respect the selected timezone for accurate reporting

## Technology Stack

- **Frontend**: React 18 with Bootstrap 5
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns for date manipulation with Intl.DateTimeFormat for timezone support
- **Storage**: LocalStorage for data persistence
- **Icons**: Bootstrap Icons
- **Styling**: Custom CSS with Bootstrap 5 components
- **Notifications**: React-Toastify for user feedback

## Installation & Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/shower-intake/shower-intake.github.io.git
   cd shower-intake.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Testing CI/CD Locally

Before deploying, test the CI/CD pipeline locally:

```bash
# Test individual steps
npm ci          # Install dependencies
npm run lint    # Run linting
npm test        # Run tests
npm run build   # Build application

# Or run a complete verification
npm ci && npm run lint && npm test && npm run build
```

### Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

## CI/CD Pipeline

### GitHub Actions Workflow

The project includes a complete CI/CD pipeline that automatically:

- **Builds** the application on every push/PR
- **Tests** code quality with ESLint
- **Runs** automated tests
- **Deploys** to GitHub Pages on main/master branch

### Workflow File

Located at `.github/workflows/deploy.yml`, the workflow:
- Triggers on push/PR to main/master branches
- Uses Node.js 18 with npm caching
- Runs linting, tests, and builds
- Deploys to GitHub Pages using official actions

### Manual Deployment

For manual deployment without CI/CD:

```bash
# Build and deploy
npm run deploy

# Or step by step
npm run build
npx gh-pages -d build
```

### Environment Setup

To enable GitHub Pages deployment:
1. Go to repository Settings → Pages
2. Set source to "GitHub Actions"
3. Ensure repository has Pages permissions

## Usage Guide

### Intake Process

1. **Set Location**: Enter the facility location at the top of the intake page
2. **Configure Timezone**: Set timezone in Settings for accurate date/time display
3. **Add New Guest**: Fill out the intake form with guest information
   - Required: First Name, Last Name
   - Optional: Date of Birth, Race/Ethnicity, Service needs
   - Checkboxes: Shower, Clothing, Homeless, New, Veteran, Valeo
4. **Submit**: Click "Add Guest" to add to the queue
5. **Manage Queue**: Use action dropdowns to update guest status
   - **Shower Next**: Move guest to front of shower queue
   - **Standby**: Place guest on standby
   - **Ban Guest**: Add guest to banned list
   - **Guest Left**: Mark guest as left

### Shower Management

1. **Monitor Status**: View real-time shower status on the Shower Times tab
2. **Assign Guests**: Click "Assign Guest" on available showers
3. **Track Progress**: Monitor countdown timers and status changes
4. **Manual Override**: Use buttons to manually change shower status

### Data Management

- **Search**: Use search boxes to find specific guests
- **Sort**: Click column headers to sort data
- **Filter**: Use time range selectors in metrics
- **Export**: Data is stored locally and can be exported
- **Timezone Settings**: Configure timezone for accurate date/time display
- **Location Management**: Set and update facility location across all views

## Data Structure

### Guest Object
```javascript
{
  id: "uuid",
  number: 1,
  action: "move_to_next",
  status: "Queued",
  first_name: "John",
  last_name: "Doe",
  dob: "1990-01-01",
  race_ethnicity: "W",
  shower: true,
  clothing: false,
  homeless: true,
  new: false,
  veteran: false,
  valeo: false,
  comment: "Additional notes",
  checkin_at: "2024-01-01T10:00:00Z",
  shower_started_at: "2024-01-01T10:30:00Z",
  shower_ended_at: "2024-01-01T10:50:00Z",
  shower_name: "Shower 1"
}
```

### Shower Object
```javascript
{
  id: "1",
  name: "Shower 1",
  status: "ready", // ready, showering, cleaning, waiting
  startTime: "2024-01-01T10:30:00Z",
  expectedEndTime: "2024-01-01T10:50:00Z",
  currentGuestId: "guest-uuid"
}
```

## Configuration

### Constants
Edit `src/utils/constants.js` to modify:
- Action options (Shower Next, Standby, Ban Guest, Guest Left)
- Race/ethnicity options
- Status values
- Default shower duration (20 minutes)
- Cleaning duration (5 minutes)

### Timezone Configuration
- **Automatic**: Browser timezone is detected automatically
- **Manual Override**: Set custom timezone in Settings
- **Global Impact**: Timezone affects all date/time displays and filtering

### Styling
Customize appearance in:
- `src/index.css` - Main styles
- `src/App.css` - App-specific styles

## Recent Updates

### Latest Features (v1.1.0)
- **Timezone Awareness**: Full timezone support with browser detection and manual override
- **Current Date Filtering**: Queue and logs automatically show only today's data
- **Enhanced UI**: Improved navbar layout and responsive design
- **Action Labels**: Updated action dropdown labels for clarity (Shower Next, Ban Guest)
- **Location Management**: Location can be set from any view with toast notifications
- **Code Cleanup**: Removed unused imports and improved code quality

## Future Enhancements

### Planned Features
- **Network Communication**: Real-time communication with shower timer apps
- **Mobile App**: Native Android application
- **Cloud Storage**: Database integration for multi-location support
- **Reporting**: Advanced reporting and export capabilities
- **Notifications**: Real-time alerts and notifications
- **Multi-language**: Internationalization support
- **Advanced Timezone**: Support for multiple timezone presets
- **Data Export**: CSV/Excel export functionality

### Shower App Integration
The system is designed to communicate with shower timer apps over local WiFi:
- **Connection Protocol**: Apps will seek to connect to the intake system
- **Real-time Feed**: Bidirectional communication for status updates
- **Guest Status**: Shower apps can send guest status information
- **Network Discovery**: Automatic discovery of connected shower devices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## Acknowledgments

- Bootstrap 5 for the UI framework
- Recharts for data visualization
- React community for the excellent ecosystem
- Homeless shelters and community centers for the inspiration
