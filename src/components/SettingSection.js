import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import { formatDate, formatTime, calculateAge, getBrowserTimezone } from '../utils/helpers';

const SettingSection = ({
  guests,
  setGuests,
  showers,
  setShowers,
  bannedGuests,
  setBannedGuests,
  location,
  setLocation,
  timezone,
  setTimezone,
  showToastMessage
}) => {
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  const [showConfirmClearBanned, setShowConfirmClearBanned] = useState(false);
  const [showAddBannedModal, setShowAddBannedModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [locationText, setLocationText] = useState(location);
  const [timezoneText, setTimezoneText] = useState(timezone || getBrowserTimezone());
  const [newBanned, setNewBanned] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    banned_until_date: '',
    is_permanently_banned: false
  });

  const handleClearAllData = () => {
    setGuests([]);
    setShowers([]);
    setShowConfirmClearAll(false);
    showToastMessage('All data cleared successfully!', 'success');
  };

  const handleClearBannedList = () => {
    setBannedGuests([]);
    setShowConfirmClearBanned(false);
    showToastMessage('Banned list cleared successfully!', 'success');
  };

  const handleAddBanned = () => {
    if (!newBanned.first_name.trim() || !newBanned.last_name.trim()) return;
    setBannedGuests(prev => [
      ...prev,
      {
        first_name: newBanned.first_name.trim(),
        last_name: newBanned.last_name.trim(),
        dob: newBanned.dob || '',
        banned_until_date: newBanned.is_permanently_banned ? '' : newBanned.banned_until_date || '',
        is_permanently_banned: !!newBanned.is_permanently_banned,
        banned_at: new Date().toISOString()
      }
    ]);
    setNewBanned({ first_name: '', last_name: '', dob: '', banned_until_date: '', is_permanently_banned: false });
    setShowAddBannedModal(false);
    showToastMessage('Guest added to banned list successfully!', 'success');
  };

  const handleCloseAddBannedModal = () => {
    setShowAddBannedModal(false);
    setNewBanned({ first_name: '', last_name: '', dob: '', banned_until_date: '', is_permanently_banned: false });
  };

  const handleRemoveBannedAtIndex = (index) => {
    setBannedGuests(prev => prev.filter((_, i) => i !== index));
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

  const handleSaveTimezone = () => {
    setTimezone(timezoneText);
    setShowTimezoneModal(false);
    showToastMessage('Timezone updated successfully!', 'success');
  };

  const handleCloseTimezoneModal = () => {
    setShowTimezoneModal(false);
    setTimezoneText(timezone || getBrowserTimezone());
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
        <Row className="mb-3">
          <Col md={10} className="mx-auto mb-4">
            <Card>
              <Card.Header>
                <strong>Data Management</strong>
              </Card.Header>
              <Card.Body className="text-center">
                <p className="mb-2">Clear all operational data while keeping the banned list intact.</p>
                <Button variant="danger" onClick={() => setShowConfirmClearAll(true)}>
                  <i className="bi bi-trash me-2"></i>
                  Clear All Data
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={10} className="mx-auto mb-4">
            <Card>
              <Card.Header>
                <strong>Timezone Management</strong>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
                  <span className="text-muted">Current Timezone:</span>
                  <span className="fw-bold">{timezone || getBrowserTimezone()}</span>
                </div>
                <Button variant="outline-primary" onClick={() => setShowTimezoneModal(true)}>
                  <i className="bi bi-clock me-2"></i>
                  Change Timezone
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={10} className="mx-auto mb-4">
            <Card>
              <Card.Header>
                <strong>Banned List Controls</strong>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2">
                  <strong className="mb-2 mb-md-0">Current Banned List</strong>
                  <div className="d-flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => setShowAddBannedModal(true)}>
                      <i className="bi bi-person-dash me-1"></i>
                      Add Banned Guest
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => setShowConfirmClearBanned(true)}>
                      <i className="bi bi-x-octagon me-1"></i>
                      Clear All Entries
                    </Button>
                  </div>
                </div>
                <div className="excel-table-container">
                  <table className="excel-table table-body-scroll">
                    <thead>
                      <tr>
                        <th className="name-cell">First Name</th>
                        <th className="name-cell">Last Name</th>
                        <th className="date-cell">DOB</th>
                        <th className="date-cell">Banned Until</th>
                        <th className="status-cell">Permanent</th>
                        <th className="action-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bannedGuests.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">No banned guests</td>
                        </tr>
                      )}
                      {bannedGuests.map((b, idx) => (
                        <tr key={`${b.first_name}-${b.last_name}-${idx}`}>
                          <td className="name-cell">{b.first_name}</td>
                          <td className="name-cell">{b.last_name}</td>
                          <td className="date-cell">
                            {b.dob ? (
                              <>
                                {formatDate(b.dob, timezone)}
                                {calculateAge(b.dob) !== null && (
                                  <span className="text-muted ms-1">({calculateAge(b.dob)})</span>
                                )}
                              </>
                            ) : ''}
                          </td>
                          <td className="date-cell">{b.banned_until_date ? formatDate(b.banned_until_date, timezone) : (b.is_permanently_banned ? '-' : '')}</td>
                          <td className="status-cell">{b.is_permanently_banned ? <Badge bg="danger">Yes</Badge> : 'No'}</td>
                          <td className="action-cell">
                            <Button variant="outline-danger" size="sm" onClick={() => handleRemoveBannedAtIndex(idx)}>
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Location Modal */}
      <Modal show={showLocationModal} onHide={handleCloseLocationModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-geo-alt me-2"></i>
            {location ? 'Edit Location' : 'Set Location'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Location Name</Form.Label>
            <Form.Control
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Enter facility location..."
              autoFocus
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

      {/* Timezone Modal */}
      <Modal show={showTimezoneModal} onHide={handleCloseTimezoneModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-clock me-2"></i>
            Edit Timezone
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Timezone</Form.Label>
            <Form.Select
              value={timezoneText}
              onChange={(e) => setTimezoneText(e.target.value)}
              autoFocus
            >
              <option value="">Use Browser Timezone</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Australia/Sydney">Sydney (AEDT)</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Select a timezone or leave empty to use your browser's timezone
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTimezoneModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveTimezone}>
            <i className="bi bi-check-circle me-2"></i>
            Save Timezone
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Modals */}
      <Modal show={showConfirmClearAll} onHide={() => setShowConfirmClearAll(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Clear All Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will remove all guests and showers. The banned list will be preserved.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmClearAll(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleClearAllData}>Clear Data</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmClearBanned} onHide={() => setShowConfirmClearBanned(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Clear Banned List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will remove all entries from the banned list.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmClearBanned(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleClearBannedList}>Clear Banned List</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Banned User Modal */}
      <Modal show={showAddBannedModal} onHide={handleCloseAddBannedModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Banned User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    placeholder="First name"
                    value={newBanned.first_name}
                    onChange={(e) => setNewBanned(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    placeholder="Last name"
                    value={newBanned.last_name}
                    onChange={(e) => setNewBanned(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={newBanned.dob}
                    onChange={(e) => setNewBanned(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Banned Until</Form.Label>
                  <Form.Control
                    type="date"
                    value={newBanned.banned_until_date}
                    onChange={(e) => setNewBanned(prev => ({ ...prev, banned_until_date: e.target.value }))}
                    disabled={newBanned.is_permanently_banned}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <div className="fancy-checkbox">
                    <input
                      type="checkbox"
                      id="ban-perm"
                      checked={newBanned.is_permanently_banned}
                      onChange={(e) => setNewBanned(prev => ({ 
                        ...prev, 
                        is_permanently_banned: e.target.checked, 
                        banned_until_date: e.target.checked ? '' : prev.banned_until_date 
                      }))}
                    />
                    <label htmlFor="ban-perm">Permanently Banned</label>
                  </div>
                  <Form.Text className="text-muted">
                    Check this if the user should be permanently banned (banned until date will be ignored)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddBannedModal}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleAddBanned}
            disabled={!newBanned.first_name.trim() || !newBanned.last_name.trim()}
          >
            <i className="bi bi-person-dash me-2"></i>
            Add to Banned List
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SettingSection;
