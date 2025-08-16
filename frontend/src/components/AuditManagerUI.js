import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const AuditManagerUI = () => {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    
    const [filterCompany, setFilterCompany] = useState('');
    const [filterSupervisor, setFilterSupervisor] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const [consecutiveShortCadre, setConsecutiveShortCadre] = useState([]);
    const [increasingShortCadre, setIncreasingShortCadre] = useState([]);
    const [decreasingRequestCadre, setDecreasingRequestCadre] = useState([]);
    
    // New state for detailed view
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    
    // New state for company analysis view
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'analysis'
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
    const [selectedCompanyForAnalysis, setSelectedCompanyForAnalysis] = useState('');
    const [companyHistoryData, setCompanyHistoryData] = useState([]);

    // Function to show message
    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    // Function to refresh all data
    const refreshAllData = async () => {
        setLoading(true);
        try {
            // Refresh records
            const recordsResponse = await api.get('/cadre-records/');
            setRecords(recordsResponse.data);
            setFilteredRecords(recordsResponse.data);

            // Refresh companies
            const companiesResponse = await api.get('/companies/');
            setCompanies(companiesResponse.data);
            const uniqueSupervisors = [...new Set(companiesResponse.data.map(item => item.supervisor_name))];
            setSupervisors(uniqueSupervisors);

            // Refresh highlights
            const consecutiveResponse = await api.get('/cadre-records/highlights/consecutive-short-cadre');
            setConsecutiveShortCadre(consecutiveResponse.data);
            
            const increasingResponse = await api.get('/cadre-records/highlights/increasing-short-cadre');
            setIncreasingShortCadre(increasingResponse.data);
            
            const decreasingResponse = await api.get('/cadre-records/highlights/decreasing-request-cadre');
            setDecreasingRequestCadre(decreasingResponse.data);

            // Refresh company analysis data if a company is selected
            if (selectedCompanyForAnalysis) {
                fetchCompanyHistory(selectedCompanyForAnalysis);
            }

            showMessage('All data refreshed successfully!', 'success');
            console.log('Manager UI - All data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
            showMessage('Error refreshing data. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch company history data
    const fetchCompanyHistory = async (companyId) => {
        if (!companyId) {
            setCompanyHistoryData([]);
            return;
        }
        
        try {
            setLoading(true);
            const response = await api.get('/cadre-records/');
            const companyData = response.data
                .filter(record => record.company._id === companyId)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            setCompanyHistoryData(companyData);
            console.log(`Fetched ${companyData.length} records for company analysis`);
        } catch (error) {
            console.error('Error fetching company history:', error);
            showMessage('Error fetching company data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        api.get('/cadre-records/')
            .then(response => {
                setRecords(response.data);
                setFilteredRecords(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

        api.get('/companies/')
            .then(response => {
                setCompanies(response.data);
                const uniqueSupervisors = [...new Set(response.data.map(item => item.supervisor_name))];
                setSupervisors(uniqueSupervisors);
            })
            .catch((error) => {
                console.log(error);
            });
        
        api.get('/cadre-records/highlights/consecutive-short-cadre')
            .then(res => setConsecutiveShortCadre(res.data));
        api.get('/cadre-records/highlights/increasing-short-cadre')
            .then(res => setIncreasingShortCadre(res.data));
        api.get('/cadre-records/highlights/decreasing-request-cadre')
            .then(res => setDecreasingRequestCadre(res.data));

    }, []);

    // Add keyboard shortcut for refresh (Ctrl+R or F5)
    useEffect(() => {
        const handleKeyPress = (event) => {
            if ((event.ctrlKey && event.key === 'r') || event.key === 'F5') {
                event.preventDefault();
                refreshAllData();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    useEffect(() => {
        let tempRecords = records;

        if (filterCompany) {
            tempRecords = tempRecords.filter(record => record.company._id === filterCompany);
        }
        if (filterSupervisor) {
            tempRecords = tempRecords.filter(record => record.company.supervisor_name === filterSupervisor);
        }
        if (filterStartDate) {
            tempRecords = tempRecords.filter(record => new Date(record.date) >= new Date(filterStartDate));
        }
        if (filterEndDate) {
            tempRecords = tempRecords.filter(record => new Date(record.date) <= new Date(filterEndDate));
        }

        setFilteredRecords(tempRecords);
    }, [filterCompany, filterSupervisor, filterStartDate, filterEndDate, records]);

    // Effect to fetch company history when selection changes
    useEffect(() => {
        if (selectedCompanyForAnalysis && activeTab === 'analysis') {
            fetchCompanyHistory(selectedCompanyForAnalysis);
        }
    }, [selectedCompanyForAnalysis, activeTab]);

    const isHighlighted = (record, type) => {
        switch(type) {
            case 'consecutive':
                return consecutiveShortCadre.some(h => h.company._id === record.company._id);
            case 'increasing':
                return increasingShortCadre.some(h => h.company._id === record.company._id);
            case 'decreasing':
                return decreasingRequestCadre.some(h => h.company._id === record.company._id);
            default:
                return false;
        }
    }

    const handleRowClick = (record) => {
        setSelectedRecord(record);
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
        setSelectedRecord(null);
    }

    // Function to render chart for company data
    const renderChart = () => {
        if (!companyHistoryData.length) {
            return (
                <div className="text-center py-4">
                    <p className="text-muted">No data available for chart</p>
                </div>
            );
        }

        // Sort data by date to ensure proper chronological order
        const sortedData = [...companyHistoryData].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Prepare chart data with only date and short cadre
        const chartData = {
            labels: sortedData.map(record => new Date(record.date).toLocaleDateString()),
            datasets: [
                {
                    label: 'Short Cadre',
                    data: sortedData.map(record => record.short_cadre),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.1
                }
            ]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Short Cadre Trend - ${companies.find(c => c._id === selectedCompanyForAnalysis)?.company_name || 'Company'}`,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    grid: {
                        display: true
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Short Cadre Count'
                    },
                    grid: {
                        display: true
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };

        return (
            <div className="chart-container">
                <div style={{ height: '400px', position: 'relative' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
                <div className="mt-3">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center">
                                    <h5>{sortedData.length}</h5>
                                    <small>Total Records</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center">
                                    <h5>{Math.max(...sortedData.map(d => d.short_cadre))}</h5>
                                    <small>Max Short Cadre</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center">
                                    <h5>{Math.min(...sortedData.map(d => d.short_cadre))}</h5>
                                    <small>Min Short Cadre</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center">
                                    <h5>{Math.round(sortedData.reduce((sum, d) => sum + d.short_cadre, 0) / sortedData.length)}</h5>
                                    <small>Avg Short Cadre</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Function to render table for company data
    const renderTable = () => {
        if (!companyHistoryData.length) {
            return (
                <div className="text-center py-4">
                    <p className="text-muted">No data available for this company</p>
                </div>
            );
        }

        return (
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th>Date</th>
                            <th>Active Cadre</th>
                            <th>Request Cadre</th>
                            <th>Short Cadre</th>
                            <th>Given Cadre</th>
                            <th>Permanent</th>
                            <th>Temporary</th>
                            <th>Absent</th>
                            <th>Leave</th>
                            <th>New Heads</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companyHistoryData.map(record => (
                            <tr key={record._id}>
                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                <td>{record.active_cadre}</td>
                                <td>{record.request_cadre}</td>
                                <td>
                                    <span className={`badge ${record.short_cadre > 0 ? 'bg-warning' : record.short_cadre < 0 ? 'bg-success' : 'bg-secondary'}`}>
                                        {record.short_cadre}
                                    </span>
                                </td>
                                <td>{record.given_cadre}</td>
                                <td>{record.permanent_cadre}</td>
                                <td>{record.temporary_cadre}</td>
                                <td>{record.absent}</td>
                                <td>{record.leave}</td>
                                <td>{record.new_heads}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="container-fluid mt-4">
            {/* Message Display */}
            {message && (
                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible`} role="alert">
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                </div>
            )}
            
            {/* Loading Overlay */}
            {loading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="card mb-3">
                <div className="card-header">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                📊 Overview Dashboard
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'analysis' ? 'active' : ''}`}
                                onClick={() => setActiveTab('analysis')}
                            >
                                📈 Company Analysis
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
                <div className="row">
                    <div className="col-md-9">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Filters</h4>
                                <button 
                                    onClick={refreshAllData} 
                                    className="btn btn-success btn-sm"
                                    disabled={loading}
                                    title="Refresh all data without re-login"
                                >
                                    <i className="fas fa-sync-alt me-1"></i>
                                    {loading ? 'Refreshing...' : 'Refresh All Data'}
                                </button>
                            </div>
                            <div className="card-body">
                                <form>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>Filter by Company</label>
                                                <select className="form-control" value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}>
                                                    <option value="">All Companies</option>
                                                    {companies.map(company => (
                                                        <option key={company._id} value={company._id}>{company.company_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>Filter by Supervisor</label>
                                                <select className="form-control" value={filterSupervisor} onChange={(e) => setFilterSupervisor(e.target.value)}>
                                                    <option value="">All Supervisors</option>
                                                    {supervisors.map(supervisor => (
                                                        <option key={supervisor} value={supervisor}>{supervisor}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>Start Date</label>
                                                <input type="date" className="form-control" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>End Date</label>
                                                <input type="date" className="form-control" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="card mt-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Daily-wise Company Details</h4>
                                <div className="d-flex gap-2">
                                    <span className="badge bg-info">
                                        {filteredRecords.length} records
                                    </span>
                                    <button 
                                        onClick={() => refreshAllData()} 
                                        className="btn btn-outline-secondary btn-sm"
                                        disabled={loading}
                                        title="Refresh table data"
                                    >
                                        {loading ? 'Refreshing...' : 'Refresh Table'}
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <table className="table table-striped table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th>Company</th>
                                            <th>Date</th>
                                            <th>Short Cadre</th>
                                            <th>Active Cadre</th>
                                            <th>Request Cadre</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.map(record => (
                                            <tr 
                                                key={record._id} 
                                                className={
                                                    isHighlighted(record, 'consecutive') ? 'table-warning' : 
                                                    isHighlighted(record, 'increasing') ? 'table-danger' :
                                                    isHighlighted(record, 'decreasing') ? 'table-info' : ''
                                                }
                                                onClick={() => handleRowClick(record)}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to view detailed information"
                                            >
                                                <td>{record.company.company_name}</td>
                                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                                <td>{record.short_cadre}</td>
                                                <td>{record.active_cadre}</td>
                                                <td>{record.request_cadre}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Notifications</h4>
                                <button 
                                    onClick={refreshAllData} 
                                    className="btn btn-outline-primary btn-sm"
                                    disabled={loading}
                                    title="Refresh notifications"
                                >
                                    {loading ? '...' : '🔄'}
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="alert alert-warning">
                                    <h5>Same Short Cadre (7+ Days)</h5>
                                    <ul className="list-unstyled">
                                        {consecutiveShortCadre.map(h => <li key={h.company._id}><strong>{h.company.company_name}</strong>: {h.message}</li>)}
                                    </ul>
                                </div>
                                <div className="alert alert-danger">
                                    <h5>Increasing Short Cadre</h5>
                                    <ul className="list-unstyled">
                                        {increasingShortCadre.map(h => <li key={h.company._id}><strong>{h.company.company_name}</strong>: {h.message}</li>)}
                                    </ul>
                                </div>
                                <div className="alert alert-info">
                                    <h5>Decreasing Request Cadre</h5>
                                    <ul className="list-unstyled">
                                        {decreasingRequestCadre.map(h => <li key={h.company._id}><strong>{h.company.company_name}</strong>: {h.message}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Company Analysis Tab Content */}
            {activeTab === 'analysis' && (
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Company Historical Analysis</h4>
                                <div className="d-flex gap-2">
                                    <button 
                                        onClick={refreshAllData} 
                                        className="btn btn-success btn-sm"
                                        disabled={loading}
                                        title="Refresh all data"
                                    >
                                        <i className="fas fa-sync-alt me-1"></i>
                                        {loading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label><strong>Select Company:</strong></label>
                                            <select 
                                                className="form-control" 
                                                value={selectedCompanyForAnalysis} 
                                                onChange={(e) => setSelectedCompanyForAnalysis(e.target.value)}
                                            >
                                                <option value="">Choose a company to analyze...</option>
                                                {companies.map(company => (
                                                    <option key={company._id} value={company._id}>
                                                        {company.company_name} ({company.supervisor_name})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label><strong>View Mode:</strong></label>
                                            <div className="btn-group w-100" role="group">
                                                <button 
                                                    type="button" 
                                                    className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => setViewMode('table')}
                                                >
                                                    📊 Table View
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className={`btn ${viewMode === 'chart' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => setViewMode('chart')}
                                                >
                                                    📈 Chart View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label><strong>Data Summary:</strong></label>
                                            <div className="p-2 bg-light rounded">
                                                {selectedCompanyForAnalysis ? (
                                                    <div>
                                                        <small className="text-muted">Records Found:</small> <strong>{companyHistoryData.length}</strong><br/>
                                                        <small className="text-muted">Date Range:</small> <strong>
                                                            {companyHistoryData.length > 0 ? 
                                                                `${new Date(companyHistoryData[0]?.date).toLocaleDateString()} - ${new Date(companyHistoryData[companyHistoryData.length - 1]?.date).toLocaleDateString()}` 
                                                                : 'No data'}
                                                        </strong>
                                                    </div>
                                                ) : (
                                                    <small className="text-muted">Select a company to see summary</small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedCompanyForAnalysis && (
                                    <div className="mt-4">
                                        <div className="card">
                                            <div className="card-header">
                                                <h5 className="mb-0">
                                                    {companies.find(c => c._id === selectedCompanyForAnalysis)?.company_name} - Historical Data
                                                    <span className="badge bg-secondary ms-2">{viewMode.toUpperCase()}</span>
                                                </h5>
                                            </div>
                                            <div className="card-body">
                                                {viewMode === 'table' ? renderTable() : renderChart()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!selectedCompanyForAnalysis && (
                                    <div className="text-center py-5">
                                        <div className="text-muted">
                                            <i className="fas fa-chart-line fa-3x mb-3 d-block"></i>
                                            <h5>Company Analysis</h5>
                                            <p>Select a company from the dropdown above to view its historical data in table or chart format.</p>
                                            <p><strong>Features Available:</strong></p>
                                            <ul className="list-unstyled">
                                                <li>📊 Complete historical data table</li>
                                                <li>📈 Interactive chart visualization</li>
                                                <li>📋 Data summary and statistics</li>
                                                <li>🔄 Real-time data refresh</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for detailed view */}
            {showModal && selectedRecord && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Detailed Cadre Information - {selectedRecord.company.company_name}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="card">
                                            <div className="card-header">
                                                <h6>Company Information</h6>
                                            </div>
                                            <div className="card-body">
                                                <p><strong>Company:</strong> {selectedRecord.company.company_name}</p>
                                                <p><strong>Supervisor:</strong> {selectedRecord.company.supervisor_name}</p>
                                                <p><strong>Date:</strong> {new Date(selectedRecord.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card">
                                            <div className="card-header">
                                                <h6>Cadre Summary</h6>
                                            </div>
                                            <div className="card-body">
                                                <p><strong>Active Cadre:</strong> {selectedRecord.active_cadre}</p>
                                                <p><strong>Request Cadre:</strong> {selectedRecord.request_cadre}</p>
                                                <p><strong>Short Cadre:</strong> {selectedRecord.short_cadre}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col-md-12">
                                        <div className="card">
                                            <div className="card-header">
                                                <h6>Detailed Cadre Breakdown</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <p><strong>Given Cadre:</strong> {selectedRecord.given_cadre}</p>
                                                        <p><strong>Permanent Cadre:</strong> {selectedRecord.permanent_cadre}</p>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <p><strong>Temporary Cadre:</strong> {selectedRecord.temporary_cadre}</p>
                                                        <p><strong>New Heads:</strong> {selectedRecord.new_heads}</p>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <p><strong>Absent:</strong> {selectedRecord.absent}</p>
                                                        <p><strong>Leave:</strong> {selectedRecord.leave}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AuditManagerUI;
