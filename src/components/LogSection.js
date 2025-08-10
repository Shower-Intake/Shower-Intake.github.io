import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  InputGroup,
  FormControl,
  Card,
  Badge,
  Form,
  Button,
  Modal
} from 'react-bootstrap';
import { formatDate, formatTime, calculateShowerDuration, calculateTimeBetween, filterGuestsBySearch, calculateAge, getBrowserTimezone } from '../utils/helpers';
import { RACE_ETHNICITY_OPTIONS } from '../utils/constants';

const LogSection = ({ guests, showers, location, setLocation, timezone, showToastMessage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [sortField, setSortField] = useState('shower_ended_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedGuestForComment, setSelectedGuestForComment] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationText, setLocationText] = useState(location);

  // Filter guests who have showered
  const showeredGuests = guests.filter(guest => 
    guest.shower_ended_at || guest.status === 'Showered' || guest.status === 'Done'
  );

  // Filter to only show logs from the current date (timezone aware)
  const currentTimezone = timezone || getBrowserTimezone();
  
  // Get current date in the selected timezone
  const now = new Date();
  const currentDateInTimezone = now.toLocaleDateString("en-US", { timeZone: currentTimezone });
  
  const currentDateShoweredGuests = showeredGuests.filter(guest => {
    if (!guest.shower_ended_at) return false;
    
    // Convert guest shower end time to the selected timezone and get just the date
    const guestDateInTimezone = new Date(guest.shower_ended_at).toLocaleDateString("en-US", { timeZone: currentTimezone });
    
    // Only show guests who showered today in the selected timezone
    return guestDateInTimezone === currentDateInTimezone;
  });

  useEffect(() => {
    let filtered = filterGuestsBySearch(currentDateShoweredGuests, searchTerm);
    
    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      // Handle calculated fields
      if (sortField === 'duration') {
        aValue = a.shower_started_at && a.shower_ended_at ? calculateShowerDuration(a.shower_started_at, a.shower_ended_at) : 0;
        bValue = b.shower_started_at && b.shower_ended_at ? calculateShowerDuration(b.shower_started_at, b.shower_ended_at) : 0;
      } else if (sortField === 'time_between') {
        // For time between, we'll sort by shower start time since it's relative to previous showers
        aValue = a.shower_started_at ? new Date(a.shower_started_at) : new Date(0);
        bValue = b.shower_started_at ? new Date(b.shower_started_at) : new Date(0);
      } else if (sortField === 'shower_name') {
        aValue = a.shower_name || '';
        bValue = b.shower_name || '';
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
        
        // Handle date sorting
        if (sortField.includes('_at') || sortField.includes('dob')) {
          aValue = aValue ? new Date(aValue) : new Date(0);
          bValue = bValue ? new Date(bValue) : new Date(0);
        }
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredGuests(filtered);
  }, [currentDateShoweredGuests, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <i className="bi bi-chevron-expand"></i>;
    return sortDirection === 'asc' ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>;
  };

  const getStatusBadge = (guest) => {
    if (guest.status === 'Showered') return <Badge bg="success">Showered</Badge>;
    if (guest.status === 'Done') return <Badge bg="info">Done</Badge>;
    if (guest.status === 'Left') return <Badge bg="secondary">Left</Badge>;
    return <Badge bg="secondary">{guest.status}</Badge>;
  };

  const getShowerDuration = (guest) => {
    if (!guest.shower_started_at || !guest.shower_ended_at) return '-';
    const duration = calculateShowerDuration(guest.shower_started_at, guest.shower_ended_at);
    return `${duration} min`;
  };

  const getTimeBetween = (guest) => {
    if (!guest.shower_started_at) return '-';
    
    // Find the previous shower for this guest (only from current date)
    const previousShowers = currentDateShoweredGuests
      .filter(g => g.id !== guest.id && g.shower_ended_at)
      .sort((a, b) => new Date(b.shower_ended_at) - new Date(a.shower_ended_at));
    
    if (previousShowers.length === 0) return 'First shower';
    
    const lastShower = previousShowers[0];
    const timeBetween = calculateTimeBetween(guest.shower_started_at, lastShower.shower_ended_at);
    
    if (timeBetween < 60) return `${timeBetween} min`;
    if (timeBetween < 1440) return `${Math.floor(timeBetween / 60)}h ${timeBetween % 60}m`;
    return `${Math.floor(timeBetween / 1440)}d ${Math.floor((timeBetween % 1440) / 60)}h`;
  };

  // Calculate summary statistics (only for current date)
  const totalShowers = currentDateShoweredGuests.length;
  const totalDuration = currentDateShoweredGuests.reduce((sum, guest) => {
    if (guest.shower_started_at && guest.shower_ended_at) {
      return sum + calculateShowerDuration(guest.shower_started_at, guest.shower_ended_at);
    }
    return sum;
  }, 0);
  const avgDuration = totalShowers > 0 ? Math.round(totalDuration / totalShowers) : 0;

    // Note: todayShowers is now the same as currentDateShoweredGuests since we're already filtering by current date
  const todayShowers = currentDateShoweredGuests.length;

  const handleOpenCommentModal = (guest) => {
    setSelectedGuestForComment(guest);
    setCommentText(guest.comment || '');
    setShowCommentModal(true);
  };

  const handleSaveComment = () => {
    if (selectedGuestForComment) {
      // Note: In a real app, you'd update the parent state here
      // For now, we'll just close the modal
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
        {/* Summary Statistics */}
        <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">{totalShowers}</h4>
              <p>Total Showers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">{todayShowers}</h4>
              <p>Today's Showers</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info">{avgDuration}</h4>
              <p>Avg Duration (min)</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">{totalDuration}</h4>
              <p>Total Time (min)</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Logs Table */}
      <Row className="m-0">
        <Col className="p-0">
          <div className="excel-table-container">
            {/* Search Header */}
            <div className="table-search-header">
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
            
            <div className="table-body-scroll">
              <table className="excel-table">
                <thead>
                  <tr>
                    <th className="fixed-column fixed-column-1" style={{ minWidth: '50px', cursor: 'pointer' }} onClick={() => handleSort('number')}>
                      # {getSortIcon('number')}
                    </th>
                    <th className="name-cell fixed-column fixed-column-2" style={{ cursor: 'pointer' }} onClick={() => handleSort('first_name')}>
                      First Name {getSortIcon('first_name')}
                    </th>
                    <th className="name-cell fixed-column fixed-column-3" style={{ cursor: 'pointer' }} onClick={() => handleSort('last_name')}>
                      Last Name {getSortIcon('last_name')}
                    </th>
                    <th className="comment-cell fixed-column fixed-column-4">Comment</th>
                    <th className="status-cell" style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                      Status {getSortIcon('status')}
                    </th>
                    <th className="date-cell" style={{ cursor: 'pointer' }} onClick={() => handleSort('dob')}>
                      DOB {getSortIcon('dob')}
                    </th>
                    <th className="race-ethnicity-cell" style={{ minWidth: '110px', cursor: 'pointer' }} onClick={() => handleSort('race_ethnicity')}>
                      Race/Ethnicity {getSortIcon('race_ethnicity')}
                    </th>
                    <th className="name-cell" style={{ cursor: 'pointer' }} onClick={() => handleSort('shower_name')}>
                      Shower Name {getSortIcon('shower_name')}
                    </th>
                    <th className="time-cell" style={{ cursor: 'pointer' }} onClick={() => handleSort('checkin_at')}>
                      Check-in Time {getSortIcon('checkin_at')}
                    </th>
                    <th className="time-cell" style={{ cursor: 'pointer' }} onClick={() => handleSort('shower_started_at')}>
                      Shower Started {getSortIcon('shower_started_at')}
                    </th>
                    <th className="time-cell" style={{ cursor: 'pointer' }} onClick={() => handleSort('shower_ended_at')}>
                      Shower Ended {getSortIcon('shower_ended_at')}
                    </th>
                    <th className="time-cell" style={{ cursor: 'pointer' }} onClick={() => handleSort('duration')}>
                      Duration {getSortIcon('duration')}
                    </th>
                    <th className="time-cell" style={{ cursor: 'pointer' }} onClick={() => handleSort('time_between')}>
                      Time Between {getSortIcon('time_between')}
                    </th>
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
                    <tr key={guest.id}>
                      <td className="fixed-column fixed-column-1">{guest.number}</td>
                      <td className="fixed-column fixed-column-2">{guest.first_name}</td>
                      <td className="fixed-column fixed-column-3">{guest.last_name}</td>
                      <td className="text-center fixed-column fixed-column-4">
                        <button
                          onClick={() => handleOpenCommentModal(guest)}
                          className="comment-btn"
                          aria-label={`View or add comment for ${guest.first_name} ${guest.last_name}`}
                          title="Comment"
                        >
                          <i className={`bi ${guest.comment ? 'bi-chat-dots-fill text-primary' : 'bi-chat-dots text-muted'}`}></i>
                        </button>
                      </td>
                      <td>{getStatusBadge(guest)}</td>
                      <td>
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
                      <td>{guest.shower_name || '-'}</td>
                      <td>{guest.checkin_at ? formatTime(guest.checkin_at) : ''}</td>
                      <td>{guest.shower_started_at ? formatTime(guest.shower_started_at) : ''}</td>
                      <td>{guest.shower_ended_at ? formatTime(guest.shower_ended_at) : ''}</td>
                      <td>{getShowerDuration(guest)}</td>
                      <td>{getTimeBetween(guest)}</td>
                      <td className="text-center">
                        <div className="table-checkbox">
                          <div className={`table-checkbox-circle ${guest.shower ? 'checked' : 'unchecked'}`}>
                            {guest.shower ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="table-checkbox">
                          <div className={`table-checkbox-circle ${guest.clothing ? 'checked' : 'unchecked'}`}>
                            {guest.clothing ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="table-checkbox">
                          <div className={`table-checkbox-circle ${guest.homeless ? 'checked' : 'unchecked'}`}>
                            {guest.homeless ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="table-checkbox">
                          <div className={`table-checkbox-circle ${guest.new ? 'checked' : 'unchecked'}`}>
                            {guest.new ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="table-checkbox">
                          <div className={`table-checkbox-circle ${guest.veteran ? 'checked' : 'unchecked'}`}>
                            {guest.veteran ? <i className="bi bi-check"></i> : <i className="bi bi-x"></i>}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
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
                        {searchTerm ? 'No guests found matching your search.' : 'No shower logs available.'}
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

export default LogSection;
