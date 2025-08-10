import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Badge,
  Modal,
  Button
} from 'react-bootstrap';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { calculateShowerDuration, formatDate, formatTime } from '../utils/helpers';
import { RACE_ETHNICITY_OPTIONS } from '../utils/constants';

const MetricSection = ({ guests, showers, location, setLocation, timezone, showToastMessage }) => {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationText, setLocationText] = useState(location);

  useEffect(() => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const filtered = guests.filter(guest => 
      guest.shower_ended_at && new Date(guest.shower_ended_at) >= startDate
    );
    setFilteredGuests(filtered);
  }, [guests, timeRange]);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Shower Intake Metrics');
    const body = encodeURIComponent('Please find attached or view the current metrics.');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
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

  // Daily shower count data
  const getDailyShowerData = () => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const showersOnDay = filteredGuests.filter(guest => {
        const showerDate = new Date(guest.shower_ended_at);
        return showerDate >= dayStart && showerDate <= dayEnd;
      });
      
      return {
        date: format(day, 'MM/dd'),
        showers: showersOnDay.length,
        totalDuration: showersOnDay.reduce((sum, guest) => {
          if (guest.shower_started_at && guest.shower_ended_at) {
            return sum + calculateShowerDuration(guest.shower_started_at, guest.shower_ended_at);
          }
          return sum;
        }, 0)
      };
    });
  };

  // Shower duration distribution
  const getDurationDistribution = () => {
    const durations = filteredGuests
      .filter(guest => guest.shower_started_at && guest.shower_ended_at)
      .map(guest => calculateShowerDuration(guest.shower_started_at, guest.shower_ended_at));
    
    const distribution = {
      '0-10 min': 0,
      '11-20 min': 0,
      '21-30 min': 0,
      '31+ min': 0
    };
    
    durations.forEach(duration => {
      if (duration <= 10) distribution['0-10 min']++;
      else if (duration <= 20) distribution['11-20 min']++;
      else if (duration <= 30) distribution['21-30 min']++;
      else distribution['31+ min']++;
    });
    
    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count
    }));
  };

  // Race/Ethnicity distribution
  const getRaceEthnicityData = () => {
    const raceCounts = {};
    
    filteredGuests.forEach(guest => {
      const race = guest.race_ethnicity || 'Unknown';
      raceCounts[race] = (raceCounts[race] || 0) + 1;
    });
    
    return Object.entries(raceCounts).map(([race, count]) => ({
      race: RACE_ETHNICITY_OPTIONS.find(opt => opt.value === race)?.label || race,
      count
    }));
  };

  // Shower usage by hour
  const getHourlyData = () => {
    const hourlyCounts = Array(24).fill(0);
    
    filteredGuests.forEach(guest => {
      if (guest.shower_started_at) {
        const hour = new Date(guest.shower_started_at).getHours();
        hourlyCounts[hour]++;
      }
    });
    
    return hourlyCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      count
    }));
  };

  // Service type distribution
  const getServiceTypeData = () => {
    const services = {
      'Shower Only': 0,
      'Shower + Clothing': 0,
      'Clothing Only': 0
    };
    
    filteredGuests.forEach(guest => {
      if (guest.shower && guest.clothing) {
        services['Shower + Clothing']++;
      } else if (guest.shower) {
        services['Shower Only']++;
      } else if (guest.clothing) {
        services['Clothing Only']++;
      }
    });
    
    return Object.entries(services).map(([service, count]) => ({
      service,
      count
    }));
  };

  // Calculate summary statistics
  const totalShowers = filteredGuests.length;
  const totalDuration = filteredGuests.reduce((sum, guest) => {
    if (guest.shower_started_at && guest.shower_ended_at) {
      return sum + calculateShowerDuration(guest.shower_started_at, guest.shower_ended_at);
    }
    return sum;
  }, 0);
  const avgDuration = totalShowers > 0 ? Math.round(totalDuration / totalShowers) : 0;
  const homelessCount = filteredGuests.filter(guest => guest.homeless).length;
  const veteranCount = filteredGuests.filter(guest => guest.veteran).length;
  const newGuestCount = filteredGuests.filter(guest => guest.new).length;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
        {/* Time Range and Actions */}
        <Row className="mb-4">
          <Col md={4} sm={6} xs={12} className="mb-2 mb-sm-0">
            <Form.Group>
              <Form.Label>Time Range</Form.Label>
              <Form.Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={8} sm={6} xs={12} className="d-flex align-items-end justify-content-end gap-2">
            <Button size="sm" variant="outline-secondary" onClick={handlePrint}>
              <i className="bi bi-printer me-1"></i> Print
            </Button>
            <Button size="sm" variant="outline-primary" onClick={handleEmail}>
              <i className="bi bi-envelope me-1"></i> Email
            </Button>
          </Col>
        </Row>

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-primary">{totalShowers}</h4>
                <p>Total Showers</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-success">{avgDuration}</h4>
                <p>Avg Duration (min)</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-info">{homelessCount}</h4>
                <p>Homeless Guests</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-warning">{veteranCount}</h4>
                <p>Veterans</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-danger">{newGuestCount}</h4>
                <p>New Guests</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-secondary">{totalDuration}</h4>
                <p>Total Time (min)</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row 1 */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card>
              <Card.Header>
                <h5>Daily Shower Count</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getDailyShowerData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="showers" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Showers"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card>
              <Card.Header>
                <h5>Shower Duration Distribution</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getDurationDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percent }) => `${range} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {getDurationDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row 2 */}
        <Row className="mb-4">
          <Col lg={6}>
            <Card>
              <Card.Header>
                <h5>Hourly Shower Usage</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getHourlyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6}>
            <Card>
              <Card.Header>
                <h5>Service Type Distribution</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getServiceTypeData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ffc658" />
                </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row 3 */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card>
              <Card.Header>
                <h5>Race/Ethnicity Distribution</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getRaceEthnicityData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="race" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card>
              <Card.Header>
                <h5>Shower Status</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Available Showers</span>
                    <Badge bg="success">{showers.filter(s => s.status === 'ready').length}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>In Use</span>
                    <Badge bg="primary">{showers.filter(s => s.status === 'showering').length}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Cleaning</span>
                    <Badge bg="warning">{showers.filter(s => s.status === 'cleaning').length}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Maintenance</span>
                    <Badge bg="danger">{showers.filter(s => s.status === 'waiting').length}</Badge>
                  </div>
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
    </div>
  );
};

export default MetricSection;
