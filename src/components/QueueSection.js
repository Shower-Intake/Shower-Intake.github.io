import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Form,
  Button,
  Modal,
  Alert,
  InputGroup,
  FormControl,
  Card,
  Badge
} from 'react-bootstrap';
import Select from 'react-select';
import { generateId, getNextQueueNumber, determineStatus, sortGuestsByPriority, isGuestBanned, getBannedGuestInfo, calculateExpectedTimes, filterGuestsBySearch, calculateAge, getBrowserTimezone } from '../utils/helpers';
import { ACTION_OPTIONS, RACE_ETHNICITY_OPTIONS, STATUS_COLORS } from '../utils/constants';
import { formatDate, formatTime } from '../utils/helpers';

const QueueSection = ({
  guests,
  setGuests,
  bannedGuests,
  setBannedGuests,
  location,
  setLocation,
  timezone,
  showAlertMessage,
  showIntakeModal,
  setShowIntakeModal,
  handleOpenIntakeModal,
  showToastMessage
}) => {
  const [intakeForm, setIntakeForm] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    race_ethnicity: '',
    shower: false,
    clothing: false,
    homeless: false,
    new: false,
    veteran: false,
    valeo: false,
    comment: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [showBannedAlertModal, setShowBannedAlertModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedGuestForComment, setSelectedGuestForComment] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationText, setLocationText] = useState(location);
  const [banForm, setBanForm] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    race_ethnicity: '',
    banned_until_date: '',
    is_permanently_banned: false
  });
  const [bannedGuestInfo, setBannedGuestInfo] = useState(null);
  const [filteredGuests, setFilteredGuests] = useState([]);

  useEffect(() => {
    // Filter guests by search term first
    let filtered = filterGuestsBySearch(guests, searchTerm);
    
    // Filter to only show guests from the current date (timezone aware)
    const currentTimezone = timezone || getBrowserTimezone();
    
    // Get current date in the selected timezone
    const now = new Date();
    const currentDateInTimezone = now.toLocaleDateString("en-US", { timeZone: currentTimezone });
    
    filtered = filtered.filter(guest => {
      if (!guest.checkin_at) return false;
      
      // Convert guest checkin time to the selected timezone and get just the date
      const guestDateInTimezone = new Date(guest.checkin_at).toLocaleDateString("en-US", { timeZone: currentTimezone });
      
      // Only show guests from today in the selected timezone
      return guestDateInTimezone === currentDateInTimezone;
    });
    
    const sorted = sortGuestsByPriority(filtered);
    setFilteredGuests(sorted);
  }, [guests, searchTerm, timezone]);

  const handleIntakeFormChange = (field, value) => {
    setIntakeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitIntake = () => {
    if (!intakeForm.first_name || !intakeForm.last_name) {
      showAlertMessage('First name and last name are required');
      return;
    }

    // Check if guest is banned
    if (isGuestBanned(intakeForm.first_name, intakeForm.last_name, bannedGuests)) {
      const bannedInfo = getBannedGuestInfo(intakeForm.first_name, intakeForm.last_name, bannedGuests);
      setBannedGuestInfo(bannedInfo);
      setShowBannedAlertModal(true);
      return;
    }

    const newGuest = {
      id: generateId(),
      number: getNextQueueNumber(guests),
      action: '',
      status: 'Queued',
      ...intakeForm,
      checkin_at: new Date().toISOString(),
      expected_start_time_at: null,
      expected_end_time_at: null,
      shower_started_at: null,
      shower_ended_at: null,
      showered_at: null,
      left_at: null,
      returned_at: null
    };

    // Calculate expected times
    const expectedTimes = calculateExpectedTimes(
      newGuest.checkin_at,
      newGuest.number,
      guests.filter(g => g.status === 'Showering').length
    );
    newGuest.expected_start_time_at = expectedTimes.expected_start_time_at;
    newGuest.expected_end_time_at = expectedTimes.expected_end_time_at;

    setGuests(prev => [...prev, newGuest]);
    
    // Reset form
    setIntakeForm({
      first_name: '',
      last_name: '',
      dob: '',
      race_ethnicity: '',
      shower: false,
      clothing: false,
      homeless: false,
      new: false,
      veteran: false,
      valeo: false,
      comment: ''
    });

    showAlertMessage('Guest added successfully');
    setShowIntakeModal(false);
  };

  const handleActionChange = (guestId, action) => {
    if (action === 'guest_banned') {
      const guest = guests.find(g => g.id === guestId);
      setBanForm({
        first_name: guest.first_name,
        last_name: guest.last_name,
        dob: guest.dob,
        race_ethnicity: guest.race_ethnicity,
        banned_until_date: '',
        is_permanently_banned: false
      });
      setShowBanModal(true);
      return;
    }

    setGuests(prev => prev.map(guest => {
      if (guest.id === guestId) {
        return {
          ...guest,
          action,
          status: determineStatus({ ...guest, action })
        };
      }
      return guest;
    }));
  };

  const handleBanSubmit = () => {
    const newBannedGuest = {
      id: generateId(),
      ...banForm,
      banned_at: new Date().toISOString()
    };

    setBannedGuests(prev => [...prev, newBannedGuest]);
    setShowBanModal(false);
    setBanForm({
      first_name: '',
      last_name: '',
      dob: '',
      race_ethnicity: '',
      banned_until_date: '',
      is_permanently_banned: false
    });

    showAlertMessage('Guest has been banned');
  };

  const getStatusColor = (guest) => {
    const status = determineStatus(guest);
    return STATUS_COLORS[status] || '';
  };

  const handleCloseIntakeModal = () => {
    setShowIntakeModal(false);
    // Reset form when closing
    setIntakeForm({
      first_name: '',
      last_name: '',
      dob: '',
      race_ethnicity: '',
      shower: false,
      clothing: false,
      homeless: false,
      new: false,
      veteran: false,
      valeo: false,
      comment: ''
    });
  };

  const handleOpenCommentModal = (guest) => {
    setSelectedGuestForComment(guest);
    setCommentText(guest.comment || '');
    setShowCommentModal(true);
  };

  const handleSaveComment = () => {
    if (selectedGuestForComment) {
      setGuests(prev => prev.map(guest => {
        if (guest.id === selectedGuestForComment.id) {
          return {
            ...guest,
            comment: commentText
          };
        }
        return guest;
      }));
      showAlertMessage('Comment updated successfully');
      setShowCommentModal(false);
      setSelectedGuestForComment(null);
      setCommentText('');
    }
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedGuestForComment(null);
    setCommentText('');
  };

  const handleOpenLocationModal = () => {
    setLocationText(location);
    setShowLocationModal(true);
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
                      onClick={handleOpenLocationModal}
                      className="location-edit-btn"
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenLocationModal}
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
        {/* Guests Table */}
        <Row className="m-0">
          <Col className="p-0">
            <div className="excel-table-container">
              {/* Search Header */}
              <div className="table-search-header d-flex align-items-center justify-content-between">
                <div className="flex-grow-1" style={{ maxWidth: '600px' }}>
                  <InputGroup>
                    <InputGroup.Text>
                    <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <FormControl
                      placeholder="Search by first or last name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </div>
                <Button variant="primary" size="sm" className="ms-2" onClick={handleOpenIntakeModal}>
                  <i className="bi bi-clipboard-data me-2"></i>
                  Add Guest
                </Button>
              </div>
            
            <div className="table-body-scroll">
              <table className="excel-table">
                <thead>
                  <tr>
                    <th className="fixed-column fixed-column-1" style={{ minWidth: '50px' }}>#</th>
                    <th className="name-cell fixed-column fixed-column-2">First Name</th>
                    <th className="name-cell fixed-column fixed-column-3">Last Name</th>
                    <th className="action-cell fixed-column fixed-column-4">Action</th>
                    <th className="comment-cell fixed-column fixed-column-5">Comment</th>
                    <th className="status-cell">Status</th>
                    <th className="time-cell">Check-in Time</th>
                    <th className="date-cell">DOB</th>
                    <th style={{ minWidth: '110px' }}>Race/Ethnicity</th>
                    <th className="checkbox-cell">Shower</th>
                    <th className="checkbox-cell">Clothing</th>
                    <th className="checkbox-cell">Homeless</th>
                    <th className="checkbox-cell">New</th>
                    <th className="checkbox-cell">Veteran</th>
                    <th className="checkbox-cell">Valeo</th>
                  </tr>
                </thead>
                <tbody>
                {filteredGuests.map(guest => (
                  <tr key={guest.id} className={getStatusColor(guest)}>
                    <td className="fixed-column fixed-column-1">{guest.number}</td>
                    <td className="name-cell fixed-column fixed-column-2 text-center">{guest.first_name}</td>
                    <td className="name-cell fixed-column fixed-column-3 text-center">{guest.last_name}</td>
                    <td className="action-cell fixed-column fixed-column-4">
                      <Select
                        value={ACTION_OPTIONS.find(option => option.value === guest.action)}
                        onChange={(selectedOption) => handleActionChange(guest.id, selectedOption?.value || '')}
                        options={ACTION_OPTIONS}
                        placeholder="Select..."
                        isClearable
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                        menuPortalTarget={document.body}
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            minHeight: '28px',
                            fontSize: '0.8rem',
                            padding: '2px 4px'
                          }),
                          option: (provided) => ({
                            ...provided,
                            fontSize: '0.8rem'
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }),
                          menuPortal: (provided) => ({
                            ...provided,
                            zIndex: 9999
                          })
                        }}
                      />
                    </td>
                    <td className="comment-cell fixed-column fixed-column-5">
                      <button
                        onClick={() => handleOpenCommentModal(guest)}
                        className="comment-btn"
                        aria-label={`View or add comment for ${guest.first_name} ${guest.last_name}`}
                        title="Comment"
                      >
                        <i className={`bi ${guest.comment ? 'bi-chat-dots-fill text-primary' : 'bi-chat-dots text-muted'}`}></i>
                      </button>
                    </td>
                    <td className="status-cell">
                      <Badge bg={guest.status === 'Showering' ? 'success' : 
                                guest.status === 'Queued' ? 'warning' : 
                                guest.status === 'Left' ? 'secondary' : 'danger'}
                             style={{ fontSize: '0.75rem' }}>
                        {determineStatus(guest)}
                      </Badge>
                    </td>
                    <td className="time-cell">{guest.checkin_at ? formatTime(guest.checkin_at) : ''}</td>
                    <td className="date-cell">
                      {guest.dob ? (
                        <>
                          {formatDate(guest.dob, timezone)}
                          {calculateAge(guest.dob) !== null && (
                            <span className="text-muted ms-1">({calculateAge(guest.dob)})</span>
                          )}
                        </>
                      ) : ''}
                    </td>
                    <td>
                      {RACE_ETHNICITY_OPTIONS.find(opt => opt.value === guest.race_ethnicity)?.label || ''}
                    </td>
                    <td className="checkbox-cell">
                      <div className="table-checkbox">
                        <div className={`table-checkbox-circle ${guest.shower ? 'checked' : 'unchecked'}`}>
                          {guest.shower ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                        </div>
                      </div>
                    </td>
                    <td className="checkbox-cell">
                      <div className="table-checkbox">
                        <div className={`table-checkbox-circle ${guest.clothing ? 'checked' : 'unchecked'}`}>
                          {guest.clothing ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                        </div>
                      </div>
                    </td>
                    <td className="checkbox-cell">
                      <div className="table-checkbox">
                        <div className={`table-checkbox-circle ${guest.homeless ? 'checked' : 'unchecked'}`}>
                          {guest.homeless ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                        </div>
                      </div>
                    </td>
                    <td className="checkbox-cell">
                      <div className="table-checkbox">
                        <div className={`table-checkbox-circle ${guest.new ? 'checked' : 'unchecked'}`}>
                          {guest.new ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                        </div>
                      </div>
                    </td>
                    <td className="checkbox-cell">
                      <div className="table-checkbox">
                        <div className={`table-checkbox-circle ${guest.veteran ? 'checked' : 'unchecked'}`}>
                          {guest.veteran ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                        </div>
                      </div>
                    </td>
                    <td className="checkbox-cell">
                      <div className="table-checkbox">
                        <div className={`table-checkbox-circle ${guest.valeo ? 'checked' : 'unchecked'}`}>
                          {guest.valeo ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredGuests.length === 0 && (
                  <tr>
                    <td colSpan="19" className="text-center text-muted py-4">
                      {searchTerm ? 'No guests found matching your search.' : 'No queued guests available yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
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

      {/* Intake Modal */}
      <Modal show={showIntakeModal} onHide={handleCloseIntakeModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Add New Guest</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={intakeForm.first_name}
                  onChange={(e) => handleIntakeFormChange('first_name', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={intakeForm.last_name}
                  onChange={(e) => handleIntakeFormChange('last_name', e.target.value)}
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
                  value={intakeForm.dob}
                  onChange={(e) => handleIntakeFormChange('dob', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Race/Ethnicity</Form.Label>
                <Select
                  value={RACE_ETHNICITY_OPTIONS.find(option => option.value === intakeForm.race_ethnicity)}
                  onChange={(selectedOption) => handleIntakeFormChange('race_ethnicity', selectedOption?.value || '')}
                  options={RACE_ETHNICITY_OPTIONS}
                  placeholder="Select..."
                  isClearable
                  isSearchable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Services & Information</Form.Label>
                <div className="d-flex flex-wrap gap-4">
                  <div className="fancy-checkbox">
                    <input
                      type="checkbox"
                      id="shower-check"
                      checked={intakeForm.shower}
                      onChange={(e) => handleIntakeFormChange('shower', e.target.checked)}
                    />
                    <label htmlFor="shower-check">Shower</label>
                  </div>
                  <div className="fancy-checkbox">
                    <input
                      type="checkbox"
                      id="clothing-check"
                      checked={intakeForm.clothing}
                      onChange={(e) => handleIntakeFormChange('clothing', e.target.checked)}
                    />
                    <label htmlFor="clothing-check">Clothing</label>
                  </div>
                  <div className="fancy-checkbox">
                    <input
                      type="checkbox"
                      id="homeless-check"
                      checked={intakeForm.homeless}
                      onChange={(e) => handleIntakeFormChange('homeless', e.target.checked)}
                    />
                    <label htmlFor="homeless-check">Homeless</label>
                  </div>
                  <div className="fancy-checkbox">
                    <input
                      type="checkbox"
                      id="new-check"
                      checked={intakeForm.new}
                      onChange={(e) => handleIntakeFormChange('new', e.target.checked)}
                    />
                    <label htmlFor="new-check">New Guest</label>
                  </div>
                  <div className="fancy-checkbox">
                    <input
                      type="checkbox"
                      id="veteran-check"
                      checked={intakeForm.veteran}
                      onChange={(e) => handleIntakeFormChange('veteran', e.target.checked)}
                    />
                    <label htmlFor="veteran-check">Veteran</label>
                  </div>
                  <div className="fancy-checkbox">
                    <input
                      type="checkbox"
                      id="valeo-check"
                      checked={intakeForm.valeo}
                      onChange={(e) => handleIntakeFormChange('valeo', e.target.checked)}
                    />
                    <label htmlFor="valeo-check">Valeo</label>
                  </div>
                </div>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={intakeForm.comment}
                  onChange={(e) => handleIntakeFormChange('comment', e.target.value)}
                  placeholder="Enter any additional notes or comments..."
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseIntakeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitIntake}>
            <i className="bi bi-plus-circle me-2"></i>
            Add Guest
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Comment Modal */}
      <Modal show={showCommentModal} onHide={handleCloseCommentModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-chat-dots me-2"></i>
            Guest Comment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedGuestForComment && (
            <div>
              <p className="mb-3">
                <strong>Guest:</strong> {selectedGuestForComment.first_name} {selectedGuestForComment.last_name}
              </p>
              <Form.Group>
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Enter or update comment for this guest..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCommentModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveComment}>
            <i className="bi bi-check-circle me-2"></i>
            Save Comment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ban Modal */}
      <Modal show={showBanModal} onHide={() => setShowBanModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ban Guest</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={banForm.first_name}
                  onChange={(e) => setBanForm(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={banForm.last_name}
                  onChange={(e) => setBanForm(prev => ({ ...prev, last_name: e.target.value }))}
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
                  value={banForm.dob}
                  onChange={(e) => setBanForm(prev => ({ ...prev, dob: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Race/Ethnicity</Form.Label>
                <Select
                  value={RACE_ETHNICITY_OPTIONS.find(option => option.value === banForm.race_ethnicity)}
                  onChange={(selectedOption) => setBanForm(prev => ({ ...prev, race_ethnicity: selectedOption?.value || '' }))}
                  options={RACE_ETHNICITY_OPTIONS}
                  placeholder="Select..."
                  isClearable
                  isSearchable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Banned Until Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={banForm.banned_until_date}
                    onChange={(e) => setBanForm(prev => ({ ...prev, banned_until_date: e.target.value }))}
                    disabled={banForm.is_permanently_banned}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <div className="fancy-checkbox">
                    <input
                      type="checkbox"
                      id="permanent-ban-check"
                      checked={banForm.is_permanently_banned}
                      onChange={(e) => setBanForm(prev => ({ 
                        ...prev, 
                        is_permanently_banned: e.target.checked,
                        banned_until_date: e.target.checked ? '' : prev.banned_until_date
                      }))}
                    />
                    <label htmlFor="permanent-ban-check">Permanently Banned</label>
                  </div>
                </Form.Group>
              </Col>
            </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBanModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBanSubmit}>
            Ban Guest
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Banned Guest Alert Modal */}
      <Modal show={showBannedAlertModal} onHide={() => setShowBannedAlertModal(false)}>
        <Modal.Header closeButton className="alert-banned">
          <Modal.Title>Ban Guest</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>{bannedGuestInfo?.first_name} {bannedGuestInfo?.last_name}</strong> is currently banned.
            {bannedGuestInfo?.is_permanently_banned ? (
              <p>This guest is permanently banned.</p>
            ) : (
                              <p>Banned until: {bannedGuestInfo?.banned_until_date ? formatDate(bannedGuestInfo.banned_until_date, timezone) : 'Unknown'}</p>
            )}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBannedAlertModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueueSection;
