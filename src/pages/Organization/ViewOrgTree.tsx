import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import positionService from "../../services/positionService";

// ---------------- Types ----------------

interface Position {
  positionID: number;
  positionTitle: string;
}

interface HierarchyMapping {
  parentPositionID: number | null;
  childPositionIDs: number[];
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

// ---------------- Theme Hook ----------------

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    if (document.body.classList.contains("dark-mode")) return true;
    if (localStorage.getItem("theme") === "dark") return true;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    const updateDarkMode = () => {
      const bodyDark = document.body.classList.contains("dark-mode");
      const storedTheme = localStorage.getItem("theme");
      setIsDark(bodyDark || storedTheme === "dark");
    };

    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const mediaListener = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setIsDark(e.matches);
      }
    };

    media.addEventListener("change", mediaListener);
    window.addEventListener("storage", updateDarkMode);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", mediaListener);
      window.removeEventListener("storage", updateDarkMode);
    };
  }, []);

  return isDark;
};

// ---------------- Component ----------------

const ViewOrgTree: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [mappings, setMappings] = useState<HierarchyMapping[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const isDark = useDarkMode();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID || 0;

  // ---------------- Fetch API ----------------

  useEffect(() => {
    const loadData = async () => {
      try {
        const res =
          await positionService.GetOrganizationPositionHierarchyAsync(
            organizationID
          );

        const positionsFromApi: Position[] =
          res?.Table?.map((item: any) => ({
            positionID: item.PositionID,
            positionTitle: item.PositionTitle?.trim(),
          })) || [];

        const mappingsFromApi: HierarchyMapping[] =
          res?.Table1?.map((item: any) => ({
            parentPositionID: item.ParentPositionID,
            childPositionIDs: item.ChildPositionIDs
              ? item.ChildPositionIDs.split(",").map((x: string) =>
                  Number(x.trim())
                )
              : [],
          })) || [];

        setPositions(positionsFromApi);
        setMappings(mappingsFromApi);
      } catch (err) {
        console.error("API Error:", err);
      }
    };

    loadData();
  }, [organizationID]);

  // ---------------- Build Tree (FIXED LOGIC) ----------------

  useEffect(() => {
    if (!positions.length || !mappings.length) return;

    const posMap: Record<number, string> = {};
    positions.forEach((p) => {
      posMap[p.positionID] = p.positionTitle;
    });

    // parent -> children map
    const treeMap: Record<number, number[]> = {};

    mappings.forEach((m) => {
      if (m.parentPositionID !== null) {
        treeMap[m.parentPositionID] = m.childPositionIDs;
      }
    });

    const buildNode = (id: number, visited = new Set<number>()): TreeNode => {
      if (visited.has(id)) {
        return { name: "⚠ Circular", children: [] };
      }

      const newVisited = new Set(visited);
      newVisited.add(id);

      const children = treeMap[id] || [];

      return {
        name: posMap[id] || `Unknown (${id})`,
        children: children.map((childId) =>
          buildNode(childId, newVisited)
        ),
      };
    };

    // 🔥 ROOT FIX: take ONLY ParentPositionID as root source
    const rootIds = Array.from(
      new Set(mappings.map((m) => m.parentPositionID).filter(Boolean))
    ) as number[];

    const roots = rootIds.map((id) => buildNode(id));

    setTreeData(roots);
  }, [positions, mappings]);

  // ---------------- Node UI ----------------

  const renderNode = ({ nodeDatum, toggleNode }: any) => {
    const isRoot = nodeDatum.name?.toLowerCase().includes("ceo");

    return (
      <g onClick={toggleNode} style={{ cursor: "pointer" }}>
        <rect
          width="190"
          height="65"
          x="-95"
          y="-32"
          rx="12"
          fill={isRoot ? "#0d6efd" : "#3b82f6"}
          stroke="#1e40af"
          strokeWidth="1.2"
        />

        <text
          x="0"
          y="-2"
          textAnchor="middle"
          fill="#ffffff !important"
          style={{ fontSize: "14px", fontWeight: 600 }}
        >
          {nodeDatum.name}
        </text>
      </g>
    );
  };

  // ---------------- UI ----------------

  return (
    <div
      className={`p-3 ${isDark ? "bg-dark text-light" : "bg-light text-dark"}`}
      style={{ height: "90vh" }}
    >
      <h5 className="fw-bold mb-3">Organization Tree</h5>

      <style>
        {`
          .rd3t-link {
            stroke: ${isDark ? "#9ca3af" : "#6b7280"} !important;
            stroke-width: 1.5px !important;
          }
        `}
      </style>

      {treeData.length === 0 ? (
        <p>Loading hierarchy...</p>
      ) : (
        <Tree
          data={treeData}
          orientation="vertical"
          translate={{ x: 600, y: 120 }}
          pathFunc="diagonal"
          renderCustomNodeElement={renderNode}
          collapsible
          zoomable
          draggable
          separation={{ siblings: 1.5, nonSiblings: 2 }}
        />
      )}
    </div>
  );
};

export default ViewOrgTree;