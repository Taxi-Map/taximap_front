import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const CircleNode = ({ data }: NodeProps) => {
    return (
        <div className="w-8 h-8 bg-blue-atlantic border-2 border-blue-deep rounded-full flex items-center justify-center relative shadow-lg hover:scale-110 transition-transform group cursor-pointer">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-deep text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-md font-medium">
                {data.label}
            </div>
            <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2 !bg-blue-sky !border-none" />
            <Handle type="source" position={Position.Top} id="top-source" className="!w-2 !h-2 !bg-blue-sky !border-none" />
            <Handle type="target" position={Position.Right} id="right" className="!w-2 !h-2 !bg-blue-sky !border-none" />
            <Handle type="source" position={Position.Right} id="right-source" className="!w-2 !h-2 !bg-blue-sky !border-none" />
            <Handle type="target" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-blue-sky !border-none" />
            <Handle type="source" position={Position.Bottom} id="bottom-source" className="!w-2 !h-2 !bg-blue-sky !border-none" />
            <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-blue-sky !border-none" />
            <Handle type="source" position={Position.Left} id="left-source" className="!w-2 !h-2 !bg-blue-sky !border-none" />
        </div>
    );
};

export default memo(CircleNode);
