import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, User } from 'lucide-react';

interface TreeNode {
  id: string;
  name: string;
  parent_id: string | null;
  status: string;
  level: number;
  manager_name?: string | null;
}

interface TreeItemProps {
  node: TreeNode;
  allNodes: TreeNode[];
  onSelect?: (node: TreeNode) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({ node, allNodes, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Find direct children
  const children = allNodes.filter(n => n.parent_id === node.id);
  const hasChildren = children.length > 0;

  return (
    <div className="ml-4 border-l border-base-300/40 pl-3 my-1">
      <div className="flex items-center gap-2 py-1.5 hover:bg-base-200/20 rounded-lg px-2 group cursor-pointer transition-colors">
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-base-content/40 hover:text-primary transition-colors"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-3.5" />
        )}
        
        <Folder size={14} className="text-primary/70 group-hover:text-primary transition-colors shrink-0" />
        
        <div onClick={() => onSelect?.(node)} className="flex items-center gap-2 flex-grow">
          <span className={`text-xs font-bold ${node.status === 'INACTIVE' ? 'text-base-content/40 line-through' : 'text-base-content/85'}`}>
            {node.name}
          </span>
          {node.manager_name && (
            <span className="text-[10px] bg-base-300/50 text-base-content/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
              <User size={9} /> {node.manager_name}
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {children.map(child => (
            <TreeItem key={child.id} node={child} allNodes={allNodes} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export const DepartmentTree: React.FC<{ treeData: TreeNode[]; onSelect?: (node: TreeNode) => void }> = ({
  treeData, onSelect
}) => {
  // Find root departments (parent_id is null or doesn't match any node in list)
  const rootNodes = treeData.filter(n => !n.parent_id || !treeData.some(p => p.id === n.parent_id));

  if (treeData.length === 0) {
    return <div className="text-center py-6 text-xs text-base-content/30 italic">No department hierarchy data found.</div>;
  }

  return (
    <div className="card bg-base-100/40 border border-base-300/50 rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold text-xs uppercase tracking-wider text-base-content/40 mb-4">Organizational Hierarchy Tree</h3>
      <div className="-ml-4">
        {rootNodes.map(root => (
          <TreeItem key={root.id} node={root} allNodes={treeData} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

export default DepartmentTree;
