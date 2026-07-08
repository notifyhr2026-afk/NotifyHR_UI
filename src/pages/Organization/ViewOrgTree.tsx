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

  // node dimensions (keep in sync with nodeSize below)
  const NODE_W = 260;
  const NODE_H = 72;

  const renderNode = ({ nodeDatum, toggleNode }: any) => {
  const w = NODE_W;
  const h = NODE_H;
  const innerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    borderRadius: 12,
    padding: "8px 12px",
    boxSizing: "border-box" as const,
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto",
    fontWeight: 500 as const,
    fontSize: "15px",
    transition: "box-shadow .15s ease, transform .12s ease",
  };

  const bg = isDark
    ? "#17181b"
    : "linear-gradient(180deg, rgba(245,243,255,0.9), #ffffff)";
  const color = isDark ? "#e6e6e9" : "#071033";
  const border = isDark ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.08)";
  const shadow = isDark
    ? "0 4px 10px rgba(0,0,0,0.35), 0 1px 0 rgba(99,102,241,0.02)"
    : "0 4px 8px rgba(15,23,42,0.04), 0 1px 0 rgba(99,102,241,0.03)";

  return (
    <g onClick={toggleNode} style={{ cursor: "pointer" }}>
      <foreignObject x={-w / 2} y={-h / 2} width={w} height={h}>
        <div {...({ xmlns: "http://www.w3.org/1999/xhtml" } as any)} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              ...innerStyle,
              background: bg,
              color,
              border: `1px solid ${border}`,
              boxShadow: shadow,
            }}
          >
            <div style={{ textAlign: "center", pointerEvents: "none" }}>{nodeDatum.name}</div>
          </div>
        </div>
      </foreignObject>
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
            stroke: #9800f9;
            stroke-width: 1.5px;
            fill: none;
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
          nodeSize={{ x: NODE_W * 0.7, y: NODE_H * 1.5 }}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
        />
      )}
    </div>
  );
};

export default ViewOrgTree;