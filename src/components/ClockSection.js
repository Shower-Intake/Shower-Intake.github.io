import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  Modal,
  Alert
} from 'react-bootstrap';
import { formatTime, formatDate } from '../utils/helpers';
import { SHOWER_STATUS_VALUES, SHOWER_STATUS_COLORS, DEFAULT_SHOWER_DURATION, CLEANING_DURATION } from '../utils/constants';
import { addMinutes, differenceInSeconds } from 'date-fns';

const ClockSection = ({ showers, setShowers, guests, setGuests, location, setLocation, timezone, showToastMessage }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShower, setSelectedShower] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState('');
  const [availableGuests, setAvailableGuests] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationText, setLocationText] = useState(location);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update available guests when guests or showers change
  useEffect(() => {
    const queuedGuests = guests.filter(guest => 
      guest.status === 'Queued' || guest.status === 'Next up'
    );
    setAvailableGuests(queuedGuests);
  }, [guests, showers]);

  // Auto-update shower statuses based on time
  useEffect(() => {
    const updatedShowers = showers.map(shower => {
      if (shower.status === SHOWER_STATUS_VALUES.SHOWERING && shower.expectedEndTime) {
        const endTime = new Date(shower.expectedEndTime);
        if (currentTime >= endTime) {
          // Shower time is up, move to cleaning
          return {
            ...shower,
            status: SHOWER_STATUS_VALUES.CLEANING,
            cleaningStartTime: currentTime.toISOString(),
            expectedCleaningEndTime: addMinutes(currentTime, CLEANING_DURATION).toISOString()
          };
        }
      } else if (shower.status === SHOWER_STATUS_VALUES.CLEANING && shower.expectedCleaningEndTime) {
        const cleaningEndTime = new Date(shower.expectedCleaningEndTime);
        if (currentTime >= cleaningEndTime) {
          // Cleaning is done, shower is ready
          return {
            ...shower,
            status: SHOWER_STATUS_VALUES.READY,
            cleaningStartTime: null,
            expectedCleaningEndTime: null,
            startTime: null,
            expectedEndTime: null,
            currentGuestId: null
          };
        }
      }
      return shower;
    });

    if (JSON.stringify(updatedShowers) !== JSON.stringify(showers)) {
      setShowers(updatedShowers);
    }
  }, [currentTime, showers, setShowers]);

  const getTimeRemaining = (endTime) => {
    if (!endTime) return '';
    const end = new Date(endTime);
    const diff = differenceInSeconds(end, currentTime);
    
    if (diff <= 0) return '00:00';
    
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case SHOWER_STATUS_VALUES.READY:
        return 'success';
      case SHOWER_STATUS_VALUES.SHOWERING:
        return 'primary';
      case SHOWER_STATUS_VALUES.CLEANING:
        return 'warning';
      case SHOWER_STATUS_VALUES.WAITING:
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const handleAssignGuest = (showerId) => {
    setSelectedShower(showerId);
    setShowAssignModal(true);
  };

  const confirmAssignGuest = () => {
    if (!selectedGuest) return;

    const guest = guests.find(g => g.id === selectedGuest);
    const shower = showers.find(s => s.id === selectedShower);

    if (!guest || !shower) return;

    // Update shower
    const updatedShower = {
      ...shower,
      status: SHOWER_STATUS_VALUES.SHOWERING,
      startTime: currentTime.toISOString(),
      expectedEndTime: addMinutes(currentTime, DEFAULT_SHOWER_DURATION).toISOString(),
      currentGuestId: guest.id
    };

    // Update guest
    const updatedGuest = {
      ...guest,
      status: 'Showering',
      shower_started_at: currentTime.toISOString(),
      shower_name: shower.name
    };

    setShowers(prev => prev.map(s => s.id === selectedShower ? updatedShower : s));
    setGuests(prev => prev.map(g => g.id === selectedGuest ? updatedGuest : g));

    setShowAssignModal(false);
    setSelectedShower(null);
    setSelectedGuest('');
  };

  const handleStartCleaning = (showerId) => {
    const shower = showers.find(s => s.id === showerId);
    if (!shower) return;

    const updatedShower = {
      ...shower,
      status: SHOWER_STATUS_VALUES.CLEANING,
      cleaningStartTime: currentTime.toISOString(),
      expectedCleaningEndTime: addMinutes(currentTime, CLEANING_DURATION).toISOString(),
      startTime: null,
      expectedEndTime: null,
      currentGuestId: null
    };

    setShowers(prev => prev.map(s => s.id === showerId ? updatedShower : s));
  };

  const handleMarkReady = (showerId) => {
    const shower = showers.find(s => s.id === showerId);
    if (!shower) return;

    const updatedShower = {
      ...shower,
      status: SHOWER_STATUS_VALUES.READY,
      cleaningStartTime: null,
      expectedCleaningEndTime: null,
      startTime: null,
      expectedEndTime: null,
      currentGuestId: null
    };

    setShowers(prev => prev.map(s => s.id === showerId ? updatedShower : s));
  };

  const getCurrentGuestName = (shower) => {
    if (!shower.currentGuestId) return '';
    const guest = guests.find(g => g.id === shower.currentGuestId);
    return guest ? `${guest.first_name} ${guest.last_name}` : '';
  };

  const handleSaveLocation = () => {
    setLocation(locationText);
    setShowLocationModal(false);
    showToastMessage('Location updated successfully!', 'success');
  };

  const handleCloseLocationModal = () => {
    setShowLocationModal(false);
    setLocationText(location);
  };

  return (
    <div>
      {/* Header with Date and Location */}
      <Row className="mx-0 mt-0 mb-4 full-bleed">
        <Col className="p-0">
          <Card className="text-center border-0 shadow-none header-card">
            <Card.Body className="p-2">
              <h4 className="mb-1">{formatDate(new Date(), timezone)} - {formatTime(new Date(), timezone)}</h4>
              <div className="d-flex justify-content-center align-items-center gap-2">
                {location ? (
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold">{location}</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowLocationModal(true)}
                      className="location-edit-btn"
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowLocationModal(true)}
                    className="location-set-btn"
                  >
                    <i className="bi bi-geo-alt me-2"></i>
                    Set Location
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Content with padding */}
      <div className="px-3 px-md-4">
        <Row>
        {showers.map(shower => (
          <Col key={shower.id} lg={4} md={6} className="mb-3">
            <Card className={`shower-timer ${SHOWER_STATUS_COLORS[shower.status]}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{shower.name}</h5>
                <Badge bg={getStatusBadgeVariant(shower.status)}>
                  {shower.status.charAt(0).toUpperCase() + shower.status.slice(1)}
                </Badge>
              </Card.Header>
              <Card.Body>
                {shower.status === SHOWER_STATUS_VALUES.SHOWERING && (
                  <div>
                    <div className="timer-display mb-2">
                      {getTimeRemaining(shower.expectedEndTime)}
                    </div>
                    <p className="mb-2">
                      <strong>Guest:</strong> {getCurrentGuestName(shower)}
                    </p>
                    <p className="mb-2">
                      <strong>Started:</strong> {shower.startTime ? formatTime(shower.startTime) : ''}
                    </p>
                    <p className="mb-2">
                      <strong>Ends:</strong> {shower.expectedEndTime ? formatTime(shower.expectedEndTime) : ''}
                    </p>
                  </div>
                )}

                {shower.status === SHOWER_STATUS_VALUES.CLEANING && (
                  <div>
                    <div className="timer-display mb-2">
                      {getTimeRemaining(shower.expectedCleaningEndTime)}
                    </div>
                    <p className="mb-2">
                      <strong>Cleaning started:</strong> {shower.cleaningStartTime ? formatTime(shower.cleaningStartTime) : ''}
                    </p>
                    <p className="mb-2">
                      <strong>Ready at:</strong> {shower.expectedCleaningEndTime ? formatTime(shower.expectedCleaningEndTime) : ''}
                    </p>
                  </div>
                )}

                {shower.status === SHOWER_STATUS_VALUES.READY && (
                  <div>
                    <div className="text-center">
                      <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                      <p className="mt-2">Ready for next guest</p>
                    </div>
                  </div>
                )}

                {shower.status === SHOWER_STATUS_VALUES.WAITING && (
                  <div>
                    <div className="text-center">
                      <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
                      <p className="mt-2">Waiting for maintenance</p>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  {shower.status === SHOWER_STATUS_VALUES.READY && availableGuests.length > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAssignGuest(shower.id)}
                      className="w-100"
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Assign Guest
                    </Button>
                  )}

                  {shower.status === SHOWER_STATUS_VALUES.SHOWERING && (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleStartCleaning(shower.id)}
                      className="w-100"
                    >
                      <i className="bi bi-brush me-2"></i>
                      Start Cleaning
                    </Button>
                  )}

                  {shower.status === SHOWER_STATUS_VALUES.CLEANING && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleMarkReady(shower.id)}
                      className="w-100"
                    >
                      <i className="bi bi-check me-2"></i>
                      Mark Ready
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      </div>

      {/* Assign Guest Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Guest to Shower</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {availableGuests.length === 0 ? (
            <Alert variant="info">
              No guests are currently in the queue.
            </Alert>
          ) : (
            <Form.Group>
              <Form.Label>Select Guest</Form.Label>
              <Form.Select
                value={selectedGuest}
                onChange={(e) => setSelectedGuest(e.target.value)}
              >
                <option value="">Choose a guest...</option>
                {availableGuests.map(guest => (
                  <option key={guest.id} value={guest.id}>
                    #{guest.number} - {guest.first_name} {guest.last_name} ({guest.status})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmAssignGuest}
            disabled={!selectedGuest}
          >
            Assign Guest
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Location Modal */}
      <Modal show={showLocationModal} onHide={handleCloseLocationModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-geo-alt me-2"></i>
            Update Location
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Location Name</Form.Label>
            <Form.Control
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Enter location name..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLocationModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveLocation}>
            <i className="bi bi-check-circle me-2"></i>
            Save Location
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClockSection;
