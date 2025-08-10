import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Alert } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QueueSection from './components/QueueSection';
import ClockSection from './components/ClockSection';
import LogSection from './components/LogSection';
import MetricSection from './components/MetricSection';
import SettingSection from './components/SettingSection';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

function AppContent() {
  const currentLocation = useLocation();
  const [guests, setGuests] = useLocalStorage('guests', []);
  const [showers, setShowers] = useLocalStorage('showers', []);
  const [bannedGuests, setBannedGuests] = useLocalStorage('bannedGuests', []);
  const [location, setLocation] = useLocalStorage('location', '');
  const [timezone, setTimezone] = useLocalStorage('timezone', '');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  // Initialize with some sample data for demonstration
  useEffect(() => {
    if (showers.length === 0) {
      setShowers([
        {
          id: '1',
          name: 'Shower 1',
          status: 'ready',
          startTime: null,
          expectedEndTime: null,
          currentTime: null
        },
        {
          id: '2',
          name: 'Shower 2',
          status: 'ready',
          startTime: null,
          expectedEndTime: null,
          currentTime: null
        },
        {
          id: '3',
          name: 'Shower 3',
          status: 'ready',
          startTime: null,
          expectedEndTime: null,
          currentTime: null
        }
      ]);
    }
  }, [showers.length, setShowers]);

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const showToastMessage = (message, type = 'info') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleOpenIntakeModal = () => {
    setShowIntakeModal(true);
  };

  // Seed sample guests with completed showers if none exist
  useEffect(() => {
    if (guests.length === 0) {
      const now = new Date();
      const minutes = (m) => m * 60 * 1000;

      const makeGuest = (
        queueNumber,
        firstName,
        lastName,
        dobISO,
        raceEthnicity,
        minutesAgoStart,
        durationMinutes,
        status = 'Showered',
        flags = {}
      ) => {
        const showerStart = new Date(now.getTime() - minutes(minutesAgoStart));
        const showerEnd = new Date(showerStart.getTime() + minutes(durationMinutes));
        const checkinAt = new Date(showerStart.getTime() - minutes(15));

        return {
          id: `seed-${queueNumber}`,
          number: queueNumber,
          action: '',
          status,
          first_name: firstName,
          last_name: lastName,
          dob: dobISO,
          race_ethnicity: raceEthnicity,
          shower: true,
          clothing: !!flags.clothing,
          homeless: !!flags.homeless,
          new: !!flags.newGuest,
          veteran: !!flags.veteran,
          valeo: !!flags.valeo,
          comment: flags.comment || '',
          checkin_at: checkinAt.toISOString(),
          expected_start_time_at: null,
          expected_end_time_at: null,
          shower_started_at: showerStart.toISOString(),
          shower_ended_at: showerEnd.toISOString(),
          showered_at: showerEnd.toISOString(),
          left_at: status === 'Done' ? showerEnd.toISOString() : null,
          returned_at: null,
          shower_name: flags.shower_name || 'Shower 1',
        };
      };

      const sampleGuests = [
        makeGuest(1, 'John', 'Doe', '1985-04-12', 'W', 120, 18, 'Showered', {
          clothing: true,
          homeless: true,
          newGuest: true,
          shower_name: 'Shower 1',
        }),
        makeGuest(2, 'Maria', 'Gonzalez', '1990-09-05', 'H', 90, 20, 'Done', {
          valeo: true,
          veteran: false,
          comment: 'Very polite',
          shower_name: 'Shower 2',
        }),
        makeGuest(3, 'Darnell', 'Smith', '1978-01-22', 'AA', 60, 22, 'Showered', {
          veteran: true,
          shower_name: 'Shower 3',
        }),
        makeGuest(4, 'Aiko', 'Tanaka', '1995-12-03', 'A', 45, 19, 'Showered', {
          shower_name: 'Shower 1',
        }),
        makeGuest(5, 'Robert', 'Whitefeather', '1982-07-19', 'NA', 30, 21, 'Done', {
          homeless: true,
          shower_name: 'Shower 2',
        }),
      ];

      setGuests(sampleGuests);
    }
  }, [guests.length, setGuests]);



  return (
    <div className="App">
      <ToastContainer />
      <Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
        <Container fluid className="g-0">
          <Navbar.Brand>
            <i className="bi bi-droplet-fill me-2"></i>
            Shower Intake
          </Navbar.Brand>
          <div id="basic-navbar-nav" className="d-flex align-items-center justify-content-between w-100 mt-0">
            <Nav className="mx-auto my-0 navbar-nav">
              <Nav.Link as={Link} to="/" className={currentLocation.pathname === '/' ? 'active' : ''}>
                <i className="bi bi-clipboard-data me-1"></i>
                Queue
              </Nav.Link>
              <Nav.Link as={Link} to="/logs" className={currentLocation.pathname === '/logs' ? 'active' : ''}>
                <i className="bi bi-journal-text me-1"></i>
                Logs
              </Nav.Link>
              <Nav.Link as={Link} to="/shower-times" className={currentLocation.pathname === '/shower-times' ? 'active' : ''}>
                <i className="bi bi-clock me-1"></i>
                Clocks
              </Nav.Link>
              <Nav.Link as={Link} to="/metrics" className={currentLocation.pathname === '/metrics' ? 'active' : ''}>
                <i className="bi bi-graph-up me-1"></i>
                Metrics
              </Nav.Link>
            </Nav>
            <Nav className="my-0">
              <Nav.Link as={Link} to="/settings" className={currentLocation.pathname === '/settings' ? 'active' : ''}>
                <i className="bi bi-gear me-1"></i>
                Settings
              </Nav.Link>
            </Nav>
            {/* Add Guest button moved into Queue view header */}
          </div>
        </Container>
      </Navbar>

      <Container fluid className="g-0 p-0">
        {showAlert && (
          <Alert
            variant="info"
            dismissible
            onClose={() => setShowAlert(false)}
            className="mb-3"
          >
            {alertMessage}
          </Alert>
        )}

        <Routes>
          <Route path="/" element={
            <QueueSection
              guests={guests}
              setGuests={setGuests}
              bannedGuests={bannedGuests}
              setBannedGuests={setBannedGuests}
              location={location}
              setLocation={setLocation}
              timezone={timezone}
              showAlertMessage={showAlertMessage}
              showIntakeModal={showIntakeModal}
              setShowIntakeModal={setShowIntakeModal}
              handleOpenIntakeModal={handleOpenIntakeModal}
              showToastMessage={showToastMessage}
            />
          } />
          <Route path="/shower-times" element={
                    <ClockSection
          showers={showers}
          setShowers={setShowers}
          guests={guests}
          setGuests={setGuests}
          location={location}
          setLocation={setLocation}
          timezone={timezone}
          showToastMessage={showToastMessage}
        />
          } />
          <Route path="/logs" element={
                    <LogSection
          guests={guests}
          showers={showers}
          location={location}
          setLocation={setLocation}
          timezone={timezone}
          showToastMessage={showToastMessage}
        />
          } />
          <Route path="/metrics" element={
                    <MetricSection
          guests={guests}
          showers={showers}
          location={location}
          setLocation={setLocation}
          timezone={timezone}
          showToastMessage={showToastMessage}
        />
          } />
           <Route path="/settings" element={
                     <SettingSection
          guests={guests}
          setGuests={setGuests}
          showers={showers}
          setShowers={setShowers}
          bannedGuests={bannedGuests}
          setBannedGuests={setBannedGuests}
          location={location}
          setLocation={setLocation}
          timezone={timezone}
          setTimezone={setTimezone}
          showToastMessage={showToastMessage}
        />
           } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
