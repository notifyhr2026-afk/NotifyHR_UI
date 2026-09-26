import React, { useState, useEffect, useMemo } from 'react';
import { Container, Accordion, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import EmployeeDetails from '../../components/Employee/EmployeeDetails';
import EmployeePositionHistory from '../../components/Employee/EmployeePositionHistory';
import EmployeeExitDetails from '../../components/Employee/EmployeeExitDetails';
import ProbationDetails from '../../components/Employee/ProbationDetails';
import EmployeeAsset from '../../components/Employee/EmployeeAsset';
import EmployeeRoles from '../../components/Employee/EmployeeRoles';
import EmployeeProjects from '../../components/Employee/EmployeeProjects';
import EmployeeShifts from '../../components/Employee/EmployeeShifts';
import EmployeeProfileView from '../../components/Employee/EmployeeProfileView';
import { useEmployee } from '../../context/EmployeeContext';
import '../../css/ManageEmployee.css';

interface SectionItem {
  id: string;
  label: string;
  shortLabel: string;
  category: 'identity' | 'work' | 'assignments' | 'lifecycle';
  icon: string;
  iconBg: string;
  iconColor: string;
  description: string;
  component: React.ReactNode;
}

const ManageEmployee: React.FC = () => {
  const { employeeID } = useParams<{ employeeID: string }>();
  const { getEmployeeDetails } = useEmployee();

  // Employee Profile Meta State
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // View Controls
  const [viewMode, setViewMode] = useState<'tabs' | 'accordion'>('tabs');
  const [activeTab, setActiveTab] = useState<string>('details');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Accordion open state (supports multi-expand)
  const allSectionKeys = useMemo(
    () => ['details', 'profile', 'shifts', 'positions', 'projects', 'assets', 'roles', 'probation', 'exit'],
    []
  );
  const [expandedSections, setExpandedSections] = useState<string[]>(['details']);

  // Fetch employee basic details for header showcase
  useEffect(() => {
    if (!employeeID) return;
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const orgId = user?.organizationID || 0;
    const id = parseInt(employeeID, 10);

    if (isNaN(id)) return;

    setLoadingInfo(true);
    getEmployeeDetails(id, orgId)
      .then((res: any) => {
        const emp = res?.Table?.[0];
        if (emp) {
          setEmployeeInfo(emp);
        }
      })
      .catch((err) => {
        console.error('Failed to load employee info for hero banner:', err);
      })
      .finally(() => {
        setLoadingInfo(false);
      });
  }, [employeeID, getEmployeeDetails]);

  // Copy employee ID to clipboard
  const handleCopyEmployeeId = () => {
    if (!employeeID) return;
    navigator.clipboard.writeText(employeeID);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // 9 Modules Definition
  const sections: SectionItem[] = useMemo(
    () => [
      {
        id: 'details',
        label: 'Personal Details',
        shortLabel: 'Details',
        category: 'identity',
        icon: 'bi-person-vcard',
        iconBg: '#eef2ff',
        iconColor: '#4f46e5',
        description: 'Identity, contact details, date of birth & official email address',
        component: <EmployeeDetails />,
      },
      {
        id: 'profile',
        label: 'Personal & Professional Details',
        shortLabel: 'Profile Data',
        category: 'identity',
        icon: 'bi-person-lines-fill',
        iconBg: '#f3e8ff',
        iconColor: '#9333ea',
        description: 'Higher education records, prior experience, address & emergency family contacts',
        component: <EmployeeProfileView />,
      },
      {
        id: 'shifts',
        label: 'Shifts & Schedule',
        shortLabel: 'Shifts',
        category: 'work',
        icon: 'bi-calendar3',
        iconBg: '#e0f2fe',
        iconColor: '#0284c7',
        description: 'Assigned shift patterns, standard hours, rotation schedules & timing policy',
        component: <EmployeeShifts />,
      },
      {
        id: 'positions',
        label: 'Position History',
        shortLabel: 'Positions',
        category: 'work',
        icon: 'bi-diagram-3',
        iconBg: '#ede9fe',
        iconColor: '#7c3aed',
        description: 'Designation milestones, organizational hierarchy & career progression over time',
        component: <EmployeePositionHistory />,
      },
      {
        id: 'projects',
        label: 'Assigned Projects',
        shortLabel: 'Projects',
        category: 'assignments',
        icon: 'bi-kanban',
        iconBg: '#ecfdf5',
        iconColor: '#059669',
        description: 'Active client deliverables, team allocations & current project responsibilities',
        component: <EmployeeProjects />,
      },
      {
        id: 'assets',
        label: 'Assigned Assets',
        shortLabel: 'Assets',
        category: 'assignments',
        icon: 'bi-laptop',
        iconBg: '#cffafe',
        iconColor: '#0891b2',
        description: 'Company hardware equipment, serial tracking, allocation and return receipts',
        component: <EmployeeAsset />,
      },
      {
        id: 'roles',
        label: 'Assigned Roles & Access',
        shortLabel: 'Roles',
        category: 'assignments',
        icon: 'bi-shield-check',
        iconBg: '#fef3c7',
        iconColor: '#d97706',
        description: 'System roles, access permissions and administrative organizational authority',
        component: <EmployeeRoles />,
      },
      {
        id: 'probation',
        label: 'Probation Details',
        shortLabel: 'Probation',
        category: 'lifecycle',
        icon: 'bi-hourglass-split',
        iconBg: '#ffedd5',
        iconColor: '#ea580c',
        description: 'Probation period progress, evaluation milestones, extensions & confirmation status',
        component: <ProbationDetails />,
      },
      {
        id: 'exit',
        label: 'Exit & Offboarding',
        shortLabel: 'Exit Details',
        category: 'lifecycle',
        icon: 'bi-box-arrow-right',
        iconBg: '#ffe4e6',
        iconColor: '#e11d48',
        description: 'Resignation records, notice period, separation reasons and handover checklist',
        component: <EmployeeExitDetails />,
      },
    ],
    []
  );

  // Filter sections by category and search term
  const filteredSections = useMemo(() => {
    return sections.filter((sec) => {
      const matchesCategory = activeCategory === 'all' || sec.category === activeCategory;
      const matchesSearch =
        searchFilter.trim() === '' ||
        sec.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
        sec.description.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [sections, activeCategory, searchFilter]);

  // Current active section for Tab View
  const activeSectionObj = useMemo(() => {
    return sections.find((s) => s.id === activeTab) || sections[0];
  }, [sections, activeTab]);

  const activeIndex = sections.findIndex((s) => s.id === activeSectionObj.id);

  // Category summary counts
  const categoryCounts = useMemo(() => {
    return {
      all: sections.length,
      identity: sections.filter((s) => s.category === 'identity').length,
      work: sections.filter((s) => s.category === 'work').length,
      assignments: sections.filter((s) => s.category === 'assignments').length,
      lifecycle: sections.filter((s) => s.category === 'lifecycle').length,
    };
  }, [sections]);

  // Navigation handlers
  const handleAccordionSelect = (eventKey: string | string[] | null | undefined) => {
    setExpandedSections(
      eventKey ? (Array.isArray(eventKey) ? eventKey : [eventKey]) : []
    );
  };

  const handleNextSection = () => {
    if (activeIndex < sections.length - 1) {
      setActiveTab(sections[activeIndex + 1].id);
      window.scrollTo({ top: 220, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (activeIndex > 0) {
      setActiveTab(sections[activeIndex - 1].id);
      window.scrollTo({ top: 220, behavior: 'smooth' });
    }
  };

  // Helper for initials
  const displayName = employeeInfo
    ? `${employeeInfo.FirstName || ''} ${employeeInfo.LastName || ''}`.trim() || `Employee #${employeeID}`
    : `Employee #${employeeID || ''}`;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Container fluid className="manage-employee-page">
      {/* 1. TOP BREADCRUMB / BACK BAR */}
      <div className="manage-emp-top-nav">
        <Link to="/EmployeeList" className="manage-emp-back-btn">
          <i className="bi bi-arrow-left" aria-hidden="true" />
          <span>Back to Employee Directory</span>
        </Link>
        <div className="d-flex align-items-center gap-2">
          <span className="manage-emp-status-badge status-active">
            <i className="bi bi-patch-check-fill" aria-hidden="true" />
            Active Record
          </span>
        </div>
      </div>

      {/* 2. RICH EMPLOYEE PROFILE HERO CARD */}
      <div className="manage-emp-hero-card">
        <div className="manage-emp-hero-main">
          <div className="manage-emp-avatar">
            {employeeInfo?.ProfilePic ? (
              <img src={employeeInfo.ProfilePic} alt={displayName} />
            ) : (
              <span>{getInitials(displayName)}</span>
            )}
          </div>

          <div className="manage-emp-title-block">
            <div className="manage-emp-name-row">
              <h1 className="manage-emp-name">{displayName}</h1>
              <span className="manage-emp-code-pill">
                <i className="bi bi-hash" aria-hidden="true" />
                {employeeInfo?.EmployeeCode || `EMP-${employeeID}`}
              </span>
            </div>

            <div className="manage-emp-meta-row">
              {employeeInfo?.OfficialEmail ? (
                <span className="manage-emp-meta-item">
                  <i className="bi bi-envelope" aria-hidden="true" />
                  <a href={`mailto:${employeeInfo.OfficialEmail}`}>{employeeInfo.OfficialEmail}</a>
                </span>
              ) : (
                <span className="manage-emp-meta-item">
                  <i className="bi bi-envelope" aria-hidden="true" />
                  Official email not set
                </span>
              )}

              {(employeeInfo?.WorkPhone || employeeInfo?.PersonalPhone) && (
                <span className="manage-emp-meta-item">
                  <i className="bi bi-telephone" aria-hidden="true" />
                  <a href={`tel:${employeeInfo.WorkPhone || employeeInfo.PersonalPhone}`}>
                    {employeeInfo.WorkPhone || employeeInfo.PersonalPhone}
                  </a>
                </span>
              )}

              {employeeInfo?.DateOfJoining && (
                <span className="manage-emp-meta-item">
                  <i className="bi bi-calendar-check" aria-hidden="true" />
                  Joined {new Date(employeeInfo.DateOfJoining).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action tools on the hero right */}
        <div className="manage-emp-hero-tools">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="copy-tooltip">{copiedId ? 'Copied to Clipboard!' : 'Copy Employee ID'}</Tooltip>}
          >
            <button
              type="button"
              className="copy-id-btn"
              onClick={handleCopyEmployeeId}
              aria-label="Copy Employee ID"
            >
              <i className={copiedId ? 'bi bi-check2 text-success' : 'bi bi-clipboard'} aria-hidden="true" />
              <span>{copiedId ? 'Copied' : `ID: ${employeeID}`}</span>
            </button>
          </OverlayTrigger>

          {/* View Mode Switcher */}
          <div className="manage-emp-view-switch" role="group" aria-label="View mode switcher">
            <button
              type="button"
              className={`view-switch-btn ${viewMode === 'tabs' ? 'active' : ''}`}
              onClick={() => setViewMode('tabs')}
            >
              <i className="bi bi-layout-text-window-reverse" aria-hidden="true" />
              <span>Tabs</span>
            </button>
            <button
              type="button"
              className={`view-switch-btn ${viewMode === 'accordion' ? 'active' : ''}`}
              onClick={() => setViewMode('accordion')}
            >
              <i className="bi bi-view-stacked" aria-hidden="true" />
              <span>Accordion</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY FILTER & QUICK SEARCH BAR */}
      <div className="manage-emp-controls-bar">
        <div className="category-filter-group" role="tablist" aria-label="Section categories">
          <button
            type="button"
            className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <i className="bi bi-grid-fill" aria-hidden="true" />
            <span>All Sections</span>
            <span className="category-chip-count">{categoryCounts.all}</span>
          </button>
          <button
            type="button"
            className={`category-chip ${activeCategory === 'identity' ? 'active' : ''}`}
            onClick={() => setActiveCategory('identity')}
          >
            <i className="bi bi-person-badge" aria-hidden="true" />
            <span>Identity & Profile</span>
            <span className="category-chip-count">{categoryCounts.identity}</span>
          </button>
          <button
            type="button"
            className={`category-chip ${activeCategory === 'work' ? 'active' : ''}`}
            onClick={() => setActiveCategory('work')}
          >
            <i className="bi bi-briefcase" aria-hidden="true" />
            <span>Work & Schedule</span>
            <span className="category-chip-count">{categoryCounts.work}</span>
          </button>
          <button
            type="button"
            className={`category-chip ${activeCategory === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveCategory('assignments')}
          >
            <i className="bi bi-folder-check" aria-hidden="true" />
            <span>Assignments & Access</span>
            <span className="category-chip-count">{categoryCounts.assignments}</span>
          </button>
          <button
            type="button"
            className={`category-chip ${activeCategory === 'lifecycle' ? 'active' : ''}`}
            onClick={() => setActiveCategory('lifecycle')}
          >
            <i className="bi bi-arrow-repeat" aria-hidden="true" />
            <span>Lifecycle</span>
            <span className="category-chip-count">{categoryCounts.lifecycle}</span>
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          {viewMode === 'accordion' && (
            <div className="accordion-toolbar-controls">
              <button
                type="button"
                className="accordion-control-btn"
                title="Expand all sections"
                onClick={() => setExpandedSections(allSectionKeys)}
              >
                <i className="bi bi-arrows-expand" aria-hidden="true" />
                <span>Expand All</span>
              </button>
              <button
                type="button"
                className="accordion-control-btn"
                title="Collapse all sections"
                onClick={() => setExpandedSections([])}
              >
                <i className="bi bi-arrows-collapse" aria-hidden="true" />
                <span>Collapse</span>
              </button>
            </div>
          )}

          <div className="section-search-wrapper">
            <i className="bi bi-search section-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="section-search-input"
              placeholder="Search sections..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              aria-label="Filter sections"
            />
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT: TABS VIEW MODE (FOCUSED & FAST) */}
      {viewMode === 'tabs' && (
        <div className="manage-emp-tabs-card">
          {/* Horizontal Module Tabs Bar */}
          <div className="manage-emp-tabs-header" role="tablist">
            {filteredSections.map((sec) => {
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`manage-emp-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(sec.id)}
                >
                  <span
                    className="tab-icon-badge"
                    style={{ backgroundColor: sec.iconBg, color: sec.iconColor }}
                  >
                    <i className={`bi ${sec.icon}`} aria-hidden="true" />
                  </span>
                  <span>{sec.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Panel */}
          <div className="manage-emp-tab-content" role="tabpanel">
            <div className="tab-content-header">
              <div className="tab-header-left">
                <div
                  className="tab-header-icon"
                  style={{
                    backgroundColor: activeSectionObj.iconBg,
                    color: activeSectionObj.iconColor,
                  }}
                >
                  <i className={`bi ${activeSectionObj.icon}`} aria-hidden="true" />
                </div>
                <div className="tab-header-text">
                  <h3>{activeSectionObj.label}</h3>
                  <p>{activeSectionObj.description}</p>
                </div>
              </div>
              <span className="tab-step-counter">
                Module {activeIndex + 1} of {sections.length}
              </span>
            </div>

            {/* Child Section Component */}
            <div className="tab-body-wrapper">{activeSectionObj.component}</div>

            {/* Step-by-Step Footer Navigation */}
            <div className="tab-footer-nav">
              <button
                type="button"
                className="tab-nav-btn"
                onClick={handlePrevSection}
                disabled={activeIndex === 0}
              >
                <i className="bi bi-chevron-left" aria-hidden="true" />
                <span>Previous: {activeIndex > 0 ? sections[activeIndex - 1].shortLabel : 'Start'}</span>
              </button>

              <button
                type="button"
                className="tab-nav-btn primary"
                onClick={handleNextSection}
                disabled={activeIndex === sections.length - 1}
              >
                <span>Next: {activeIndex < sections.length - 1 ? sections[activeIndex + 1].shortLabel : 'Finished'}</span>
                <i className="bi bi-chevron-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MAIN CONTENT: ACCORDION VIEW MODE (COMPREHENSIVE ALL-IN-ONE) */}
      {viewMode === 'accordion' && (
        <Accordion
          activeKey={expandedSections}
          onSelect={handleAccordionSelect}
          alwaysOpen
          flush
          className="manage-employee-accordion"
        >
          {filteredSections.map((sec) => (
            <Accordion.Item eventKey={sec.id} key={sec.id}>
              <Accordion.Header>
                <span
                  className="accordion-icon-box"
                  style={{ backgroundColor: sec.iconBg, color: sec.iconColor }}
                >
                  <i className={`bi ${sec.icon}`} aria-hidden="true" />
                </span>
                <div className="accordion-title-block">
                  <strong>{sec.label}</strong>
                  <small>{sec.description}</small>
                </div>
              </Accordion.Header>
              <Accordion.Body>{sec.component}</Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  );
};

export default ManageEmployee;
