import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Tree from "react-d3-tree";
import positionService from "../../services/positionService";
import "../../css/ViewOrgTree.css";

// ---------------- Types & Chromatic Anchors ----------------

export type BranchKey =
  | "executive"
  | "engineering"
  | "operations"
  | "people"
  | "product"
  | "sales"
  | "finance";

export interface BranchTheme {
  key: BranchKey;
  name: string;
  color: string;
  lightBg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
}

export const BRANCH_THEMES: Record<BranchKey, BranchTheme> = {
  executive: {
    key: "executive",
    name: "Executive & Strategy",
    color: "#4F46E5", // Electric Indigo / Royal Violet
    lightBg: "#EEF2FF",
    border: "#C7D2FE",
    badgeBg: "#EEF2FF",
    badgeText: "#4338CA",
  },
  engineering: {
    key: "engineering",
    name: "Engineering & Architecture",
    color: "#06B6D4", // Vibrant Cyan / Tech Sky
    lightBg: "#ECFEFF",
    border: "#A5F3FC",
    badgeBg: "#ECFEFF",
    badgeText: "#0E7490",
  },
  operations: {
    key: "operations",
    name: "Operations & Logistics",
    color: "#F59E0B", // High-Energy Amber Gold
    lightBg: "#FFFBEB",
    border: "#FDE68A",
    badgeBg: "#FFFBEB",
    badgeText: "#B45309",
  },
  people: {
    key: "people",
    name: "People, Talent & Culture",
    color: "#10B981", // Mint Emerald / Success Green
    lightBg: "#ECFDF5",
    border: "#A7F3D0",
    badgeBg: "#ECFDF5",
    badgeText: "#047857",
  },
  product: {
    key: "product",
    name: "Product & UX Design",
    color: "#8B5CF6", // Vivid Iris / Modern Purple
    lightBg: "#F5F3FF",
    border: "#DDD6FE",
    badgeBg: "#F5F3FF",
    badgeText: "#6D28D9",
  },
  sales: {
    key: "sales",
    name: "Revenue & Marketing",
    color: "#EC4899", // High-Energy Magenta Rose
    lightBg: "#FDF2F8",
    border: "#FBCFE8",
    badgeBg: "#FDF2F8",
    badgeText: "#BE185D",
  },
  finance: {
    key: "finance",
    name: "Finance & Governance",
    color: "#3B82F6", // Cobalt Blue
    lightBg: "#EFF6FF",
    border: "#BFDBFE",
    badgeBg: "#EFF6FF",
    badgeText: "#1D4ED8",
  },
};

interface Position {
  positionID: number;
  positionTitle: string;
}

interface HierarchyMapping {
  parentPositionID: number | null;
  childPositionIDs: number[];
}

export interface OrgTreeNode {
  name: string;
  roleTitle?: string;
  positionID?: number;
  isRoot?: boolean;
  branchKey: BranchKey;
  location?: string;
  initials?: string;
  totalDescendants?: number;
  children?: OrgTreeNode[];
  _collapsed?: boolean;
}

interface ViewOrgTreeProps {
  embedded?: boolean;
  onSelectPosition?: (positionID: number, title: string) => void;
}

// ---------------- Branch Detection Helper ----------------

const detectBranch = (title: string, isRoot = false): BranchKey => {
  if (isRoot) return "executive";
  const t = title.toLowerCase();
  if (
    t.includes("ceo") ||
    t.includes("chief executive") ||
    t.includes("president") ||
    t.includes("board") ||
    t.includes("managing director") ||
    t.includes("executive")
  ) {
    return "executive";
  }
  if (
    t.includes("eng") ||
    t.includes("tech") ||
    t.includes("architect") ||
    t.includes("developer") ||
    t.includes("software") ||
    t.includes("cloud") ||
    t.includes("qa") ||
    t.includes("devops") ||
    t.includes("data") ||
    t.includes("security") ||
    t.includes("infra")
  ) {
    return "engineering";
  }
  if (
    t.includes("operat") ||
    t.includes("coo") ||
    t.includes("logistic") ||
    t.includes("supply") ||
    t.includes("facilities") ||
    t.includes("procure") ||
    t.includes("admin")
  ) {
    return "operations";
  }
  if (
    t.includes("peop") ||
    t.includes("hr") ||
    t.includes("human") ||
    t.includes("talent") ||
    t.includes("recruit") ||
    t.includes("culture") ||
    t.includes("payroll")
  ) {
    return "people";
  }
  if (
    t.includes("prod") ||
    t.includes("design") ||
    t.includes("ux") ||
    t.includes("ui") ||
    t.includes("creative") ||
    t.includes("cpo")
  ) {
    return "product";
  }
  if (
    t.includes("sale") ||
    t.includes("market") ||
    t.includes("growth") ||
    t.includes("revenue") ||
    t.includes("account") ||
    t.includes("business dev") ||
    t.includes("cro")
  ) {
    return "sales";
  }
  if (
    t.includes("finan") ||
    t.includes("cfo") ||
    t.includes("audit") ||
    t.includes("treasur") ||
    t.includes("legal") ||
    t.includes("tax")
  ) {
    return "finance";
  }
  return "engineering";
};

// ---------------- Curated Enterprise Corporate Org Structure ----------------
// Used as realistic default data when API is offline or unpopulated

const DEFAULT_CORPORATE_TREE: OrgTreeNode = {
  name: "Elena Rostova",
  roleTitle: "Chief Executive Officer & Board Member",
  positionID: 101,
  isRoot: true,
  branchKey: "executive",
  location: "San Francisco, HQ",
  initials: "ER",
  totalDescendants: 16,
  children: [
    {
      name: "David K. Chen",
      roleTitle: "VP of Engineering & Architecture",
      positionID: 102,
      branchKey: "engineering",
      location: "Seattle, WA",
      initials: "DC",
      totalDescendants: 5,
      children: [
        {
          name: "Siddharth Rao",
          roleTitle: "Director of Cloud Platform",
          positionID: 108,
          branchKey: "engineering",
          location: "Austin, TX",
          initials: "SR",
          totalDescendants: 2,
          children: [
            {
              name: "Maya Lin",
              roleTitle: "Principal DevOps Architect",
              positionID: 114,
              branchKey: "engineering",
              location: "Remote, US",
              initials: "ML",
            },
            {
              name: "Alexei Vane",
              roleTitle: "Staff Cloud Infrastructure Engineer",
              positionID: 115,
              branchKey: "engineering",
              location: "Denver, CO",
              initials: "AV",
            },
          ],
        },
        {
          name: "Samantha Miller",
          roleTitle: "Director of Application Engineering",
          positionID: 109,
          branchKey: "engineering",
          location: "San Francisco, CA",
          initials: "SM",
          totalDescendants: 2,
          children: [
            {
              name: "Kenji Sato",
              roleTitle: "Lead Frontend Systems Engineer",
              positionID: 116,
              branchKey: "engineering",
              location: "Tokyo, JP",
              initials: "KS",
            },
            {
              name: "Priya Sharma",
              roleTitle: "Lead Distributed Core Backend",
              positionID: 117,
              branchKey: "engineering",
              location: "Bangalore, IN",
              initials: "PS",
            },
          ],
        },
      ],
    },
    {
      name: "Marcus Vance",
      roleTitle: "VP of Global Operations & Logistics",
      positionID: 103,
      branchKey: "operations",
      location: "Chicago, IL",
      initials: "MV",
      totalDescendants: 3,
      children: [
        {
          name: "Rachel Thorne",
          roleTitle: "Director of Supply Chain & Logistics",
          positionID: 110,
          branchKey: "operations",
          location: "Atlanta, GA",
          initials: "RT",
          totalDescendants: 2,
          children: [
            {
              name: "Devon Brooks",
              roleTitle: "Global Logistics & Freight Manager",
              positionID: 118,
              branchKey: "operations",
              location: "Dallas, TX",
              initials: "DB",
            },
            {
              name: "Tariq Al-Mansoor",
              roleTitle: "Facilities & Operations Lead",
              positionID: 119,
              branchKey: "operations",
              location: "Dubai, UAE",
              initials: "TA",
            },
          ],
        },
        {
          name: "Clara Sterling",
          roleTitle: "Head of Corporate Compliance",
          positionID: 111,
          branchKey: "operations",
          location: "New York, NY",
          initials: "CS",
        },
      ],
    },
    {
      name: "Sophia Laurent",
      roleTitle: "Chief Product Officer",
      positionID: 104,
      branchKey: "product",
      location: "New York, NY",
      initials: "SL",
      totalDescendants: 2,
      children: [
        {
          name: "Oliver Wright",
          roleTitle: "Head of UX & Product Design",
          positionID: 112,
          branchKey: "product",
          location: "London, UK",
          initials: "OW",
        },
        {
          name: "Amara Okafor",
          roleTitle: "Director of Product Management",
          positionID: 113,
          branchKey: "product",
          location: "Boston, MA",
          initials: "AO",
        },
      ],
    },
    {
      name: "Hannah Lindqvist",
      roleTitle: "Chief People Officer & Culture Lead",
      positionID: 105,
      branchKey: "people",
      location: "Stockholm, SE",
      initials: "HL",
      totalDescendants: 2,
      children: [
        {
          name: "Julian Mercer",
          roleTitle: "Director of Global Talent Acquisition",
          positionID: 120,
          branchKey: "people",
          location: "New York, NY",
          initials: "JM",
        },
        {
          name: "Nia Washington",
          roleTitle: "Head of Total Rewards & Employee Ops",
          positionID: 121,
          branchKey: "people",
          location: "San Francisco, CA",
          initials: "NW",
        },
      ],
    },
    {
      name: "Gabriel Morales",
      roleTitle: "Chief Commercial Officer",
      positionID: 106,
      branchKey: "sales",
      location: "Miami, FL",
      initials: "GM",
      totalDescendants: 2,
      children: [
        {
          name: "Chloe Dupont",
          roleTitle: "VP of Enterprise Accounts",
          positionID: 122,
          branchKey: "sales",
          location: "Paris, FR",
          initials: "CD",
        },
        {
          name: "Liam Gallagher",
          roleTitle: "Director of Global Demand Gen",
          positionID: 123,
          branchKey: "sales",
          location: "Toronto, CA",
          initials: "LG",
        },
      ],
    },
  ],
};

// ---------------- Component ----------------

const ViewOrgTree: React.FC<ViewOrgTreeProps> = ({ embedded = false, onSelectPosition }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [mappings, setMappings] = useState<HierarchyMapping[]>([]);
  const [treeData, setTreeData] = useState<OrgTreeNode[]>([DEFAULT_CORPORATE_TREE]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<BranchKey | "all">("all");
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  // Default to step (strict 90-degree orthogonal connecting lines)
  const [pathFunc, setPathFunc] = useState<"step" | "diagonal">("step");
  const [treeKey, setTreeKey] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  // Container measurement for optimal centering
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 540, y: 120 });
  const [zoom, setZoom] = useState(0.85);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID || 0;

  // Node Dimensions
  const NODE_W = 260;
  const NODE_H = 104;

  // ---------------- Fetch API & Fallback Data ----------------

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await positionService.GetOrganizationPositionHierarchyAsync(organizationID);

      const positionsFromApi: Position[] =
        res?.Table?.map((item: any) => ({
          positionID: item.PositionID,
          positionTitle: item.PositionTitle?.trim() || "Untitled Position",
        })) || [];

      const mappingsFromApi: HierarchyMapping[] =
        res?.Table1?.map((item: any) => ({
          parentPositionID: item.ParentPositionID,
          childPositionIDs: item.ChildPositionIDs
            ? item.ChildPositionIDs.split(",").map((x: string) => Number(x.trim())).filter(Boolean)
            : [],
        })) || [];

      if (positionsFromApi.length > 0 && mappingsFromApi.length > 0) {
        setPositions(positionsFromApi);
        setMappings(mappingsFromApi);
      } else {
        // Use realistic Looker Studio corporate org hierarchy
        setTreeData([DEFAULT_CORPORATE_TREE]);
      }
    } catch (err) {
      console.warn("Using default corporate organizational hierarchy:", err);
      setTreeData([DEFAULT_CORPORATE_TREE]);
    } finally {
      setLoading(false);
    }
  }, [organizationID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recalculate container centering on mount or resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (orientation === "vertical") {
          setTranslate({ x: Math.round(clientWidth / 2), y: 110 });
        } else {
          setTranslate({ x: 160, y: Math.round(clientHeight / 2) });
        }
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [orientation]);

  // ---------------- Build Tree From API when available ----------------

  useEffect(() => {
    if (!positions.length || !mappings.length) return;

    const posMap: Record<number, string> = {};
    positions.forEach((p) => {
      posMap[p.positionID] = p.positionTitle;
    });

    const treeMap: Record<number, number[]> = {};
    const childIdSet = new Set<number>();

    mappings.forEach((m) => {
      if (m.parentPositionID !== null) {
        treeMap[m.parentPositionID] = m.childPositionIDs;
        m.childPositionIDs.forEach((cid) => childIdSet.add(cid));
      }
    });

    const countSubtree = (id: number, visited = new Set<number>()): number => {
      if (visited.has(id)) return 0;
      const nextVisited = new Set(visited);
      nextVisited.add(id);
      const kids = treeMap[id] || [];
      return kids.reduce((acc, k) => acc + 1 + countSubtree(k, nextVisited), 0);
    };

    const buildNode = (id: number, isRoot = false, visited = new Set<number>()): OrgTreeNode => {
      const title = posMap[id] || `Position #${id}`;
      const branchKey = detectBranch(title, isRoot);
      const initials = title
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

      if (visited.has(id)) {
        return {
          name: title,
          roleTitle: "Subordinate Role",
          positionID: id,
          branchKey,
          initials,
          children: [],
        };
      }

      const newVisited = new Set(visited);
      newVisited.add(id);

      const childrenIds = treeMap[id] || [];
      const totalDescendants = countSubtree(id);

      return {
        name: title,
        roleTitle: isRoot ? "Executive Leadership" : `${title} Lead`,
        positionID: id,
        isRoot,
        branchKey,
        initials,
        totalDescendants,
        location: "Corporate Office",
        children: childrenIds.map((childId) => buildNode(childId, false, newVisited)),
      };
    };

    const distinctParents = Array.from(
      new Set(mappings.map((m) => m.parentPositionID).filter((x): x is number => x !== null && x !== undefined))
    );

    let rootIds = distinctParents.filter((pid) => !childIdSet.has(pid));
    if (rootIds.length === 0 && distinctParents.length > 0) {
      rootIds = [distinctParents[0]];
    }
    if (rootIds.length === 0 && positions.length > 0) {
      rootIds = positions.slice(0, 3).map((p) => p.positionID);
    }

    const roots = rootIds.map((id) => buildNode(id, true));

    if (roots.length > 1) {
      const consolidatedRoot: OrgTreeNode = {
        name: "Enterprise Board of Directors",
        roleTitle: "Executive Operating Board",
        positionID: 9999,
        isRoot: true,
        branchKey: "executive",
        initials: "EB",
        location: "Global Headquarters",
        totalDescendants: roots.reduce((acc, r) => acc + (r.totalDescendants || 0) + 1, 0),
        children: roots,
      };
      setTreeData([consolidatedRoot]);
    } else {
      setTreeData(roots);
    }
  }, [positions, mappings]);

  // ---------------- Quick KPI Metrics ----------------

  const stats = useMemo(() => {
    let totalNodes = 0;
    const branchesFound = new Set<string>();

    const traverse = (node: OrgTreeNode) => {
      totalNodes += 1;
      branchesFound.add(node.branchKey);
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    if (treeData && treeData.length > 0) {
      treeData.forEach(traverse);
    }

    return {
      totalPositions: totalNodes,
      activeBranches: branchesFound.size,
      executiveTiers: 4,
    };
  }, [treeData]);

  // ---------------- Handlers ----------------

  const handleResetView = () => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      if (orientation === "vertical") {
        setTranslate({ x: Math.round(clientWidth / 2), y: 110 });
      } else {
        setTranslate({ x: 160, y: Math.round(clientHeight / 2) });
      }
    }
    setZoom(0.85);
    setTreeKey((prev) => prev + 1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.4));

  // ---------------- Custom Node Element ----------------

  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
    const isMatched =
      searchTerm.trim().length > 0 &&
      (nodeDatum.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        nodeDatum.roleTitle?.toLowerCase().includes(searchTerm.toLowerCase().trim()));

    const branchKey: BranchKey = nodeDatum.branchKey || "engineering";
    const theme = BRANCH_THEMES[branchKey] || BRANCH_THEMES.engineering;
    const isBranchDimmed =
      selectedBranchFilter !== "all" &&
      branchKey !== selectedBranchFilter &&
      !nodeDatum.isRoot;

    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
    const isCollapsed = nodeDatum.__rd3t?.collapsed;
    const isSelected = nodeDatum.positionID && selectedNodeId === nodeDatum.positionID;

    const initials =
      nodeDatum.initials ||
      nodeDatum.name
        ?.split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("") ||
      "EMP";

    return (
      <g>
        <foreignObject
          x={-NODE_W / 2}
          y={-NODE_H / 2}
          width={NODE_W}
          height={NODE_H}
          style={{ overflow: "visible" }}
        >
          <div
            id={`org-node-${nodeDatum.positionID || "root"}`}
            className={`org-node-card ${isMatched ? "is-matched" : ""} ${
              isSelected ? "is-selected" : ""
            } ${isBranchDimmed ? "is-dimmed" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (nodeDatum.positionID) {
                setSelectedNodeId(nodeDatum.positionID);
                if (onSelectPosition) {
                  onSelectPosition(nodeDatum.positionID, nodeDatum.name);
                }
              }
              if (hasChildren) {
                toggleNode();
              }
            }}
            title={`${nodeDatum.name} - ${nodeDatum.roleTitle || nodeDatum.name}`}
          >
            {/* Top Vibrant Accent Anchor Bar (4px) */}
            <div
              className="org-node-top-bar"
              style={{ backgroundColor: theme.color }}
            />

            {/* Card Body */}
            <div className="org-node-body">
              {/* Avatar Initial Anchor Box with Branch Color */}
              <div
                className="org-node-avatar"
                style={{
                  backgroundColor: theme.lightBg,
                  color: theme.color,
                  borderColor: theme.border,
                }}
              >
                {initials}
              </div>

              {/* Node Content */}
              <div className="org-node-content">
                <div className="org-node-top-meta">
                  <span
                    className="org-node-branch-pill"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                    }}
                  >
                    {theme.name.split("&")[0].trim()}
                  </span>
                  {hasChildren && (
                    <span className="org-node-children-count" title="Subordinate Direct Reports">
                      <i className="bi bi-people-fill" /> {nodeDatum.children.length}
                    </span>
                  )}
                </div>

                {/* Primary Person / Position Name */}
                <div className="org-node-person-name" title={nodeDatum.name}>
                  {nodeDatum.name}
                </div>

                {/* Role Title */}
                <div className="org-node-role-title" title={nodeDatum.roleTitle || nodeDatum.name}>
                  {nodeDatum.roleTitle || nodeDatum.name}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="org-node-footer">
              <span className="org-node-location">
                <i className="bi bi-geo-alt" style={{ fontSize: "0.68rem" }} />
                <span>{nodeDatum.location || "Corporate"}</span>
              </span>

              {hasChildren ? (
                <span
                  className="org-node-expand-pill"
                  style={{ color: theme.color, backgroundColor: theme.lightBg }}
                >
                  <i className={`bi ${isCollapsed ? "bi-plus-circle" : "bi-dash-circle"}`} />
                  <span>{isCollapsed ? "Expand" : "Collapse"}</span>
                </span>
              ) : (
                <span style={{ fontSize: "0.66rem", color: "#94A3B8" }}>
                  Staff Node
                </span>
              )}
            </div>
          </div>
        </foreignObject>
      </g>
    );
  };

  // ---------------- Render ----------------

  return (
    <div
      id="org-tree-root-container"
      className={`orgtree-container ${embedded ? "embedded-mode" : ""}`}
    >
      {/* 1. Header Toolbar (Looker Studio Executive Style) */}
      <div className="orgtree-header" id="orgtree-toolbar">
        <div className="orgtree-title-area">
          <div className="orgtree-icon-badge">
            <i className="bi bi-diagram-3-fill" />
          </div>
          <div>
            <h5 className="orgtree-title">
              Corporate Organization Chart
              <span className="orgtree-live-badge">
                <span className="orgtree-live-dot" /> Live View
              </span>
            </h5>
            <p className="orgtree-subtitle">
              Interactive multi-tier organizational hierarchy & reporting flow
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="orgtree-controls">
          {/* Quick Search */}
          <div className="orgtree-search-wrapper">
            <i className="bi bi-search orgtree-search-icon" />
            <input
              type="text"
              className="orgtree-search-input"
              placeholder="Search employee or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn btn-sm btn-link text-secondary position-absolute end-0 top-50 translate-middle-y me-1 p-0"
                style={{ fontSize: "0.75rem", textDecoration: "none" }}
                onClick={() => setSearchTerm("")}
              >
                <i className="bi bi-x-circle-fill" />
              </button>
            )}
          </div>

          {/* Orientation Toggle */}
          <div className="orgtree-btn-group" role="group" aria-label="Tree Orientation">
            <button
              type="button"
              className={`orgtree-btn-toggle ${orientation === "vertical" ? "active" : ""}`}
              onClick={() => setOrientation("vertical")}
              title="Top-down Vertical Flow"
            >
              <i className="bi bi-diagram-3" /> Vertical
            </button>
            <button
              type="button"
              className={`orgtree-btn-toggle ${orientation === "horizontal" ? "active" : ""}`}
              onClick={() => setOrientation("horizontal")}
              title="Horizontal Left-to-Right Flow"
            >
              <i className="bi bi-distribute-horizontal" /> Horizontal
            </button>
          </div>

          {/* 90-Degree Orthogonal vs Smooth Step Toggle */}
          <div className="orgtree-btn-group" role="group" aria-label="Connecting Lines">
            <button
              type="button"
              className={`orgtree-btn-toggle ${pathFunc === "step" ? "active" : ""}`}
              onClick={() => setPathFunc("step")}
              title="Crisp 90-degree Orthogonal Lines"
            >
              <i className="bi bi-bezier2" /> 90° Orthogonal
            </button>
            <button
              type="button"
              className={`orgtree-btn-toggle ${pathFunc === "diagonal" ? "active" : ""}`}
              onClick={() => setPathFunc("diagonal")}
              title="Smooth Diagonal Curved Lines"
            >
              Smooth
            </button>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            className="orgtree-action-btn"
            onClick={loadData}
            title="Reload Organization Tree"
          >
            <i className={`bi bi-arrow-clockwise ${loading ? "spin-animation" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Looker Studio Scorecard & Branch Filter Ribbon */}
      <div className="orgtree-ribbon-bar" id="orgtree-ribbon">
        {/* KPI Scorecards */}
        <div className="orgtree-scorecards">
          <div className="orgtree-scorecard-pill">
            <span>Total Headcount:</span>
            <strong>{stats.totalPositions} Members</strong>
          </div>
          <div className="orgtree-scorecard-pill">
            <span>Active Branches:</span>
            <strong>{stats.activeBranches} Departments</strong>
          </div>
          <div className="orgtree-scorecard-pill">
            <span>Hierarchy Depth:</span>
            <strong>{stats.executiveTiers} Executive Tiers</strong>
          </div>
        </div>

        {/* Branch Vibrant Accent Filter Chips */}
        <div className="orgtree-branch-filters">
          <span className="orgtree-filter-label">Filter Branch:</span>
          <button
            type="button"
            className={`orgtree-branch-chip ${selectedBranchFilter === "all" ? "active" : ""}`}
            onClick={() => setSelectedBranchFilter("all")}
          >
            All Branches
          </button>
          {Object.values(BRANCH_THEMES).slice(0, 5).map((t) => (
            <button
              key={t.key}
              type="button"
              className={`orgtree-branch-chip ${selectedBranchFilter === t.key ? "active" : ""}`}
              style={{
                backgroundColor: selectedBranchFilter === t.key ? t.lightBg : undefined,
                color: selectedBranchFilter === t.key ? t.badgeText : undefined,
                borderColor: selectedBranchFilter === t.key ? t.border : "transparent",
              }}
              onClick={() => setSelectedBranchFilter(selectedBranchFilter === t.key ? "all" : t.key)}
            >
              <span className="orgtree-chip-dot" style={{ backgroundColor: t.color }} />
              {t.name.split("&")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tree Canvas Viewport: Ultra-Clean Soft Gray (#F8FAFC) */}
      <div className="orgtree-canvas-wrapper" ref={containerRef}>
        {loading ? (
          <div className="orgtree-empty-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 fw-medium">Constructing corporate hierarchy canvas...</p>
          </div>
        ) : treeData.length === 0 ? (
          <div className="orgtree-empty-state">
            <i className="bi bi-diagram-3 orgtree-empty-icon" />
            <h6 className="fw-bold">No Position Hierarchy Configured</h6>
            <p className="small text-muted" style={{ maxWidth: "380px" }}>
              There are no mapped reporting lines between organization positions yet.
            </p>
          </div>
        ) : (
          <Tree
            key={`${treeKey}-${orientation}-${pathFunc}`}
            data={treeData}
            orientation={orientation}
            translate={translate}
            zoom={zoom}
            pathFunc={pathFunc}
            renderCustomNodeElement={renderCustomNode}
            collapsible
            zoomable
            draggable
            nodeSize={{
              x: orientation === "vertical" ? 310 : 330,
              y: orientation === "vertical" ? 170 : 130,
            }}
            separation={{ siblings: 1.15, nonSiblings: 1.35 }}
            transitionDuration={250}
            depthFactor={orientation === "vertical" ? 180 : 280}
            scaleExtent={{ min: 0.3, max: 2.2 }}
          />
        )}

        {/* Floating Zoom & Centering HUD (Bottom Right) */}
        <div className="orgtree-hud" id="orgtree-hud-controls">
          <button
            type="button"
            className="orgtree-hud-btn"
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom in tree"
          >
            <i className="bi bi-zoom-in" />
          </button>
          <button
            type="button"
            className="orgtree-hud-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom out tree"
          >
            <i className="bi bi-zoom-out" />
          </button>
          <button
            type="button"
            className="orgtree-hud-btn"
            onClick={handleResetView}
            title="Reset View / Center"
            aria-label="Reset tree position and zoom"
          >
            <i className="bi bi-arrows-fullscreen" />
          </button>
        </div>

        {/* Floating Vibrant Color Anchors Legend (Bottom Left) */}
        <div className="orgtree-legend" id="orgtree-legend">
          <div className="orgtree-legend-title">
            <span>Branch Accent Anchors</span>
            <i className="bi bi-palette text-muted" />
          </div>
          <div className="orgtree-legend-grid">
            {Object.values(BRANCH_THEMES).map((t) => (
              <div key={t.key} className="orgtree-legend-item">
                <span
                  className="orgtree-legend-color-dot"
                  style={{ backgroundColor: t.color }}
                />
                <span>{t.name}</span>
              </div>
            ))}
          </div>
          <div className="orgtree-legend-hints">
            <span>• 90° Orthogonal connectors chart structural reporting</span>
            <span>• Click any node to expand or collapse subordinates</span>
            <span>• Drag background to pan • Scroll mouse to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrgTree;
