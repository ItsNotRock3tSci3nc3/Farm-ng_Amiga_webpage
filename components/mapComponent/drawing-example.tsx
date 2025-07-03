"use client";

import {

    ControlPosition,

    Map,

    MapControl,

    AdvancedMarker,

    InfoWindow,

    Pin,

} from "@vis.gl/react-google-maps";

import { UndoRedoControl } from "./undo-redo-control";

import { useDrawingManager } from "./use-drawing-manager";

import ControlPanel from "./control-panel";

import { getAllCoordinates } from "./getCoordinates";

import { useState, useCallback, useRef, useEffect } from "react";

import { DrawingActionKind } from "./types";

// Get your Google Map ID from environment

const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID as string;

const DrawingExample = () => {

    // State to store drawn shapes

    const drawingManager = useDrawingManager();

    const [nodes, setNodes] = useState<{ lat: number; lng: number }[]>([]);

    const [currentNode, setCurrentNode] = useState<{ lat: number; lng: number; id: number }>();

    const [drawingState, setDrawingState] = useState<unknown>({ now: [] });

    const [hoveredNode, setHoveredNode] = useState<{ lat: number; lng: number } | null>(null);

    const [isHovering, setIsHovering] = useState(false);

    const [isFetching, setIsFetching] = useState(false);

    const [coordinatesPushed, setCoordinatesPushed] = useState(false);

    const [isRunning, setIsRunning] = useState(false);

    // ✅ This stores the robot's real-time position from farm-ng

    const [robotPosition, setRobotPosition] = useState<{ lat: number; lng: number } | null>(null);

    const dispatchRef = useRef<React.Dispatch<unknown> | null>(null);

    // ✅ Poll robot GPS from FastAPI backend (every 3 sec)

    useEffect(() => {

        const fetchRobotGps = async () => {

            try {

                const response = await fetch("http://100.97.75.64:8000/robot_gps");

                if (!response.ok) return;

                const data = await response.json();

                console.log("📡 Robot GPS Response:", data);

                // Ensure 0.0 lat/lng are not rejected

                if (data.lat !== null && data.lat !== undefined &&

                    data.lng !== null && data.lng !== undefined) {

                    setRobotPosition({ lat: data.lat, lng: data.lng });

                }

            } catch (error) {

                console.error("Failed to fetch robot GPS:", error);

            }

        };

        fetchRobotGps();

        const interval = setInterval(fetchRobotGps, 3000);

        return () => clearInterval(interval);

    }, []);

    const handleDispatch = (dispatch: React.Dispatch<unknown>) => {

        dispatchRef.current = dispatch;

    };

    const clearAllFromParent = () => {

        if (dispatchRef.current) {

            dispatchRef.current({ type: DrawingActionKind.CLEAR_ALL });

        }

    };

    // Get all drawn coordinates + currentNode (if exists)

    const getCoordinates = () => {

        if (!drawingState.now.length) {

            console.log("⚠️ No shapes drawn yet!");

            setNodes([]);

            return;

        }

        const allNodes = getAllCoordinates(drawingState.now);

        const allDrewNodesWithId = allNodes.map((node, index) => ({

            ...node,

            id: index + 1,

        }));

        if (currentNode) {

            allDrewNodesWithId.unshift(currentNode);

        }

        setNodes(allDrewNodesWithId);

        console.log("📍 All Drawn Nodes:", allDrewNodesWithId);

        if (drawingManager) {

            drawingManager.setDrawingMode(null);

        }

    };

    const clearAll = () => {

        setNodes([]);

        setCurrentNode(undefined);

        console.log("🗑️ All markers cleared.");

        clearAllFromParent();

    };

    // Hover behavior for info windows

    const handleMouseEnter = (node: { lat: number; lng: number }) => {

        setIsHovering(true);

        setTimeout(() => setHoveredNode(node), 100);

    };

    const handleMouseLeave = useCallback(() => {

        setTimeout(() => {

            if (!isHovering) {

                setHoveredNode(null);

            }

        }, 100);

    }, [isHovering]);

    const handleMapClick = () => {

        setHoveredNode(null);

    };

    const fetchCurrentRobotLocations = async () => {

        try {

            const response = await fetch("map/api/update-location"); // You can delete this if unused

            const data = await response.json();

            if (data.success !== false && data.currentNode) {

                setCurrentNode(data.currentNode);

                setNodes((prevNodes) => {

                    if (prevNodes.length > 0 && prevNodes[0].id === data.currentNode.id) {

                        return [data.currentNode, ...prevNodes.slice(1)];

                    } else {

                        return [data.currentNode, ...prevNodes];

                    }

                });

            }

        } catch (error) {

            console.error("Error fetching locations:", error);

        }

    };

    // Toggle for internal polling (optional use)

    const toggleFetching = () => {

        setIsFetching((prev) => !prev);

    };

    // Push all drawn coordinates to FastAPI at /coordinates

    const pushCoordinates = async () => {

        try {

            const response = await fetch("http://100.97.75.64:8000/coordinates", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify(nodes),

            });

            const data = await response.json();

            console.log("📤 Farm-ng response:", data);

            alert("Coordinates sent to Farm-ng!");

            setCoordinatesPushed(true);

        } catch (error) {

            console.error("Failed to send coordinates: ", error);

            alert("Failed to send coordinates.");

        }

    };

    const runFarmNg = async () => {

        setIsRunning(true);

        try {

            const response = await fetch("http://100.97.75.64:8000/run", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({ action: "start" }),

            });

            const data = await response.json();

            alert("Farm-ng is now running!");

            console.log("🚜 Run response:", data);

        } catch (error) {

            alert("Failed to start Farm-ng.");

            console.error("Failed to start Farm-ng:", error);

        }

        setIsRunning(false);

    };



    return (
        <>
            <Map

                mapId={MAP_ID}

                defaultZoom={18}
                center={robotPosition ?? { lat: 38.94171479639421, lng: -92.31970464069614 }} //set to GPS position of farm-ng, else default to lat: 38.94171479639421, lng: -92.31970464069614

                

                gestureHandling="greedy"

                disableDefaultUI={true}

                mapTypeId="satellite"

                style={{ height: "60vh", width: "60vw" }}

                onClick={handleMapClick}
            >

                {/* Red markers: drawn route nodes */}

                {nodes.map((node, index) => (
                    <AdvancedMarker

                        key={index}

                        position={{ lat: node.lat, lng: node.lng }}

                        onMouseEnter={() => handleMouseEnter(node)}

                        onMouseLeave={handleMouseLeave}
                    >
                        <Pin background="red" />
                    </AdvancedMarker>

                ))}

                {/* Info popup for hovered node */}

                {hoveredNode && (
                    <InfoWindow

                        position={hoveredNode}

                        onCloseClick={() => setHoveredNode(null)}

                        pixelOffset={[0, -35]}
                    >
                        <div

                            className="p-2 text-black"

                            onMouseEnter={() => setIsHovering(true)}

                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <p><strong>Lat:</strong> {hoveredNode.lat.toFixed(6)}</p>
                            <p><strong>Lng:</strong> {hoveredNode.lng.toFixed(6)}</p>
                        </div>
                    </InfoWindow>

                )}

                {/* 🔵 Blue pin: current robot GPS */}

                {robotPosition && (
                    <AdvancedMarker position={robotPosition}>
                        <Pin background="blue" />
                    </AdvancedMarker>

                )}
            </Map>

            <ControlPanel />

            {/* Drawing controls */}
            <MapControl position={ControlPosition.TOP_CENTER}>
                <UndoRedoControl

                    drawingManager={drawingManager}

                    onStateChange={setDrawingState}

                    onDispatch={handleDispatch}

                />
            </MapControl>

            {/* Live robot GPS info */}
            <div className="p-4 bg-gray-100 rounded shadow" style={{ minWidth: 200 }}>
                <h2 className="text-xl font-semibold mb-2">Latest Robot GPS</h2>

                {robotPosition ? (
                    <>
                        <p><strong>Latitude:</strong> {robotPosition.lat.toFixed(6)}</p>
                        <p><strong>Longitude:</strong> {robotPosition.lng.toFixed(6)}</p>
                    </>

                ) : (
                    <p className="text-gray-500">Waiting for GPS data...</p>

                )}
            </div>

            {/* Buttons */}
            <button onClick={getCoordinates} className="mt-2 p-2 bg-blue-500 text-white rounded">

                Get All Coordinates
            </button>

            <button onClick={clearAll} className="p-2 bg-red-500 text-white rounded">

                Clear All
            </button>

            <button

                onClick={toggleFetching}

                className={`mt-2 p-2 ${isFetching ? "bg-red-500" : "bg-blue-500"} text-white rounded`}
            >

                {isFetching ? "Stop Fetching" : "Start Fetching Coordinates"}
            </button>

            <button

                onClick={nodes.length === 0 ? undefined : pushCoordinates}

                className={`mt-2 p-2 text-white rounded ${nodes.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-500"

                    }`}

                disabled={nodes.length === 0}
            >

                Push Coordinates to Farm-ng
            </button>

            {coordinatesPushed && (
                <button

                    onClick={runFarmNg}

                    className="mt-2 ml-4 p-2 bg-orange-500 text-white rounded"

                    disabled={isRunning}
                >

                    {isRunning ? "Running..." : "Run Farm-ng"}
                </button>

            )}

            {/* Drawn coordinates display */}
            <div className="p-4 bg-gray-100 mt-4 rounded">
                <h2 className="text-lg font-semibold mb-2">Drawn Nodes (Lat/Lng):</h2>
                <ul>

                    {nodes.map((node, index) => (
                        <li key={index}>

                            {`id_${node.id}: (${node.lat.toFixed(6)}, ${node.lng.toFixed(6)})`}
                        </li>

                    ))}
                </ul>
            </div>

            
        </>

    );

};

export default DrawingExample;
