import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, Node, Edge, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { routeService } from '../services/routeService';
import { ArrowLeft, RefreshCw, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CircleNode from './CircleNode';
import { Button } from './ui/Button';

export default function RouteBuilderPage() {
    const navigate = useNavigate();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(true);

    const nodeTypes = useMemo(() => ({ circle: CircleNode }), []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const stops = await routeService.getAllStops();
            if (stops) {
                const newNodes: Node[] = stops.map((stop) => ({
                    id: stop.id.toString(),
                    type: 'circle',
                    position: { x: (stop.longitude - 13.1) * 20000, y: -(stop.latitude + 8.8) * 20000 },
                    data: { label: stop.nome },
                }));
                setNodes(newNodes);
            }

            const calculateHandles = (sourceStop: any, targetStop: any) => {
                const x1 = (sourceStop.longitude - 13.1) * 20000;
                const y1 = -(sourceStop.latitude + 8.8) * 20000;
                const x2 = (targetStop.longitude - 13.1) * 20000;
                const y2 = -(targetStop.latitude + 8.8) * 20000;
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                let sourceHandle = 'right-source', targetHandle = 'left';
                if (angle > -45 && angle <= 45) { sourceHandle = 'right-source'; targetHandle = 'left'; }
                else if (angle > 45 && angle <= 135) { sourceHandle = 'bottom-source'; targetHandle = 'top'; }
                else if (angle > 135 || angle <= -135) { sourceHandle = 'left-source'; targetHandle = 'right'; }
                else { sourceHandle = 'top-source'; targetHandle = 'bottom'; }
                return { sourceHandle, targetHandle };
            };

            const lines = await routeService.getAllLines();
            if (lines) {
                const newEdges: Edge[] = [];
                for (const line of lines) {
                    const details = await routeService.getLineDetails(line.id);
                    if (details && details.percurso) {
                        const stops = details.percurso;
                        for (let i = 0; i < stops.length - 1; i++) {
                            const sourceStop = stops[i], targetStop = stops[i + 1];
                            const source = sourceStop.id.toString(), target = targetStop.id.toString();
                            const { sourceHandle, targetHandle } = calculateHandles(sourceStop, targetStop);
                            newEdges.push({
                                id: `e${source}-${target}-${line.id}`,
                                source, target, sourceHandle, targetHandle,
                                label: line.nome,
                                animated: false,
                                style: { stroke: '#94A3B8', strokeWidth: 2 },
                                markerEnd: { type: MarkerType.ArrowClosed, color: '#94A3B8' },
                            });
                        }
                    }
                }
                setEdges(newEdges);
            }
        } catch (error) { console.error("Failed to fetch graph data", error); }
        finally { setIsLoading(false); }
    }, [setNodes, setEdges]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="w-full h-screen bg-blue-deep flex flex-col">
            <div className="bg-blue-ocean border-b border-white/10 px-3 py-3 md:px-4 md:py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full shrink-0 transition-colors">
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-blue-horizon" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-atlantic rounded-xl flex items-center justify-center">
                            <Navigation className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-base md:text-xl font-bold text-white truncate">Route Builder</h1>
                    </div>
                </div>
                <Button variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4 md:w-5 md:h-5" />} onClick={fetchData}>
                    <span className="hidden sm:inline">Refresh</span>
                </Button>
            </div>

            <div className="flex-1 w-full h-full">
                <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView attributionPosition="bottom-right">
                    <div className="hidden md:block"><MiniMap style={{ background: '#0A1628' }} nodeColor="#2E6B9E" maskColor="rgba(10,22,40,0.7)" /></div>
                    <Controls style={{ background: '#1B3A5C', color: '#8EC8E8', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Background color="#1B3A5C" gap={16} />
                </ReactFlow>
            </div>

            {isLoading && (
                <div className="absolute inset-0 bg-blue-deep/60 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-blue-atlantic/30 border-t-blue-sky rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
