import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { routeService } from '../services/routeService';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CircleNode from './CircleNode';

export default function RouteBuilderPage() {
    const navigate = useNavigate();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(true);

    const nodeTypes = useMemo(() => ({ circle: CircleNode }), []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch Stops (Nodes)
            const stops = await routeService.getAllStops();
            if (stops) {
                const newNodes: Node[] = stops.map((stop) => ({
                    id: stop.id.toString(),
                    type: 'circle', // Use custom node type
                    position: {
                        x: (stop.longitude - 13.1) * 20000,
                        y: -(stop.latitude + 8.8) * 20000
                    },
                    data: { label: stop.nome },
                    // Styles are handled by the component now
                }));
                setNodes(newNodes);
            }


            // Helper to calculate edge handles based on node positions
            const calculateHandles = (sourceStop: any, targetStop: any) => {
                // Project to screen coordinates (matching the node projection)
                const x1 = (sourceStop.longitude - 13.1) * 20000;
                const y1 = -(sourceStop.latitude + 8.8) * 20000;
                const x2 = (targetStop.longitude - 13.1) * 20000;
                const y2 = -(targetStop.latitude + 8.8) * 20000;

                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

                // Source uses "-source" suffix handles, target uses base handle IDs
                let sourceHandle = 'right-source';
                let targetHandle = 'left';

                if (angle > -45 && angle <= 45) {
                    sourceHandle = 'right-source';
                    targetHandle = 'left';
                } else if (angle > 45 && angle <= 135) {
                    sourceHandle = 'bottom-source';
                    targetHandle = 'top';
                } else if (angle > 135 || angle <= -135) {
                    sourceHandle = 'left-source';
                    targetHandle = 'right';
                } else {
                    sourceHandle = 'top-source';
                    targetHandle = 'bottom';
                }

                return { sourceHandle, targetHandle };
            };

            // Fetch Lines to build Edges
            const lines = await routeService.getAllLines();
            if (lines) {
                const newEdges: Edge[] = [];
                for (const line of lines) {
                    const details = await routeService.getLineDetails(line.id);
                    if (details && details.percurso) {
                        const stops = details.percurso;
                        for (let i = 0; i < stops.length - 1; i++) {
                            const sourceStop = stops[i];
                            const targetStop = stops[i + 1];
                            const source = sourceStop.id.toString();
                            const target = targetStop.id.toString();
                            const edgeId = `e${source}-${target}-${line.id}`;

                            const { sourceHandle, targetHandle } = calculateHandles(sourceStop, targetStop);

                            newEdges.push({
                                id: edgeId,
                                source: source,
                                target: target,
                                sourceHandle: sourceHandle,
                                targetHandle: targetHandle,
                                label: line.nome, // Optional: hide label if too cluttered
                                animated: false,
                                style: { stroke: '#94a3b8', strokeWidth: 1.5 },
                                markerEnd: {
                                    type: MarkerType.ArrowClosed,
                                    color: '#94a3b8',
                                },
                            });
                        }
                    }
                }
                setEdges(newEdges);
            }

        } catch (error) {
            console.error("Failed to fetch graph data", error);
        } finally {
            setIsLoading(false);
        }
    }, [setNodes, setEdges]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="w-full h-screen bg-slate-50 flex flex-col">
            {/* Header - Responsive */}
            <div className="bg-white border-b px-3 py-3 md:px-4 md:py-4 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full flex-shrink-0">
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-slate-700" />
                    </button>
                    <h1 className="text-base md:text-xl font-bold text-slate-900 truncate">Route Builder</h1>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm md:text-base flex-shrink-0"
                >
                    <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* ReactFlow Container */}
            <div className="flex-1 w-full h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    attributionPosition="bottom-right"
                >
                    {/* MiniMap - Hidden on mobile */}
                    <div className="hidden md:block">
                        <MiniMap />
                    </div>
                    <Controls />
                    <Background color="#f1f5f9" gap={16} />
                </ReactFlow>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-slate-900"></div>
                </div>
            )}
        </div>
    );
}
