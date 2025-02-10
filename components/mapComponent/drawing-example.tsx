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

const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID as string;

const DrawingExample = () => {
    const drawingManager = useDrawingManager();
    const [nodes, setNodes] = useState<{ lat: number; lng: number }[]>([]);
    const [currentNode, setCurrentNode] = useState<{
        lat: number;
        lng: number;
        id: number;
    }>();
    const [drawingState, setDrawingState] = useState<unknown>({ now: [] }); // 存储当前绘制的形状
    const [hoveredNode, setHoveredNode] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [isHovering, setIsHovering] = useState(false); // 防止 InfoWindow 触发 `onMouseLeave`
    const [isFetching, setIsFetching] = useState(false); // 是否开始获取坐标的状态

    const dispatchRef = useRef<React.Dispatch<unknown> | null>(null); // 用于保存 dispatch

    // 轮询 API 获取坐标
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isFetching) {
            interval = setInterval(fetchCurrentRobotLocations, 5000); // 每 5 秒获取新坐标
        } else if (!isFetching && interval) {
            clearInterval(interval); // 停止轮询
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isFetching]); // 依赖 isFetching，点击按钮后才开始获取数据

    // 接收 dispatch 并存储到 ref 中
    const handleDispatch = (dispatch: React.Dispatch<unknown>) => {
        dispatchRef.current = dispatch;
    };

    // 调用 dispatch 的示例
    const clearAllFromParent = () => {
        if (dispatchRef.current) {
            dispatchRef.current({ type: DrawingActionKind.CLEAR_ALL }); // 调用子组件的 dispatch
        }
    };

    // 获取所有绘制形状的坐标
    const getCoordinates = () => {
        if (!drawingState.now.length) {
            console.log("⚠️ No shapes drawn yet!");
            setNodes([]);
            return;
        }

        const allNodes = getAllCoordinates(drawingState.now);

        // add id to each node
        const allDrewNodesWithId = allNodes.map((node, index) => ({
            ...node,
            id: index + 1,
        }));
        // concat nodes
        console.log("currentNode", currentNode);
        if (currentNode) {
            console.log("currentNode", currentNode);

            allDrewNodesWithId.unshift(currentNode);
        }
        setNodes(allDrewNodesWithId);
        console.log("📍 All Drawn Nodes:", allDrewNodesWithId);

        if (drawingManager) {
            drawingManager.setDrawingMode(null); // 切换绘制模式
        }
    };

    // 清空所有标记
    const clearAll = () => {
        setNodes([]); // 清空节点
        setCurrentNode(undefined)
        console.log("🗑️ All markers cleared.");
        clearAllFromParent();
    };

    // 处理鼠标悬停，防止 InfoWindow 频繁闪烁
    const handleMouseEnter = (node: { lat: number; lng: number }) => {
        setIsHovering(true);
        setTimeout(() => {
            setHoveredNode(node);
        }, 100); // 增加 100ms 延迟，防止闪烁
    };

    // 处理鼠标移出
    const handleMouseLeave = useCallback(() => {
        setTimeout(() => {
            if (!isHovering) {
                setHoveredNode(null);
            }
        }, 100); // 只有在 `isHovering` 为 false 时才隐藏 `InfoWindow`
    }, [isHovering]);

    // **新增**：点击地图任意地方关闭 `InfoWindow`
    const handleMapClick = () => {
        setHoveredNode(null);
    };

    const fetchCurrentRobotLocations = async () => {
        try {
            const response = await fetch("map/api/update-location");
            const data = await response.json();

            if (data.success !== false && data.currentNode) {
                setCurrentNode(data.currentNode);
    
                setNodes((prevNodes) => {
                    if (prevNodes.length > 0) {
                        if (prevNodes[0].id === data.currentNode.id) {
                            console.log(1);
                            return [data.currentNode, ...prevNodes.slice(1)];
                        } else {
                            console.log(2);
                            return [data.currentNode, ...prevNodes];
                        }
                    } else {
                        console.log(3);
                        return [data.currentNode];
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    // 启动/停止获取 API 坐标的函数
    const toggleFetching = () => {
        setIsFetching((prev) => !prev);
    };

    return (
        <>
            <Map
                mapId={MAP_ID}
                defaultZoom={18}
                defaultCenter={{
                    lat: 38.94171479639421,
                    lng: -92.31970464069614,
                }}
                gestureHandling={"greedy"}
                disableDefaultUI={true}
                mapTypeId="satellite"
                style={{ height: "60vh", width: "60vw" }}
                onClick={handleMapClick} // **点击地图空白处关闭 `InfoWindow`**
            >
                {/* 在地图上渲染所有的 AdvancedMarker */}
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

                {/* 显示 InfoWindow 在悬停的点上 */}
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
                            <p>
                                <strong>ID:</strong> {hoveredNode.id}
                            </p>
                            <p>
                                <strong>Lat:</strong>{" "}
                                {hoveredNode.lat.toFixed(6)}
                            </p>
                            <p>
                                <strong>Lng:</strong>{" "}
                                {hoveredNode.lng.toFixed(6)}
                            </p>
                        </div>
                    </InfoWindow>
                )}
            </Map>

            <ControlPanel />

            {/* Drawing Controls */}
            <MapControl position={ControlPosition.TOP_CENTER}>
                <UndoRedoControl
                    drawingManager={drawingManager}
                    onStateChange={setDrawingState}
                    onDispatch={handleDispatch}
                />
            </MapControl>

            {/* 按钮：获取所有坐标 */}
            <button
                onClick={getCoordinates}
                className="mt-2 p-2 bg-blue-500 text-white rounded"
            >
                Get All Coordinates
            </button>

            <button
                onClick={clearAll}
                className="p-2 bg-red-500 text-white rounded"
            >
                Clear All
            </button>
            <button
                onClick={toggleFetching}
                className={`mt-2 p-2 ${
                    isFetching ? "bg-red-500" : "bg-blue-500"
                } text-white rounded`}
            >
                {isFetching ? "Stop Fetching" : "Start Fetching Coordinates"}
            </button>

            {/* 显示所有绘制的坐标点 */}
            <div className="p-4 bg-gray-100 mt-4 rounded">
                <h2 className="text-lg font-semibold mb-2">
                    Drawn Nodes (Lat/Lng):
                </h2>
                <ul>
                    {nodes.map((node, index) => (
                        <li key={index}>{`id_${node.id}: (${node.lat.toFixed(
                            6
                        )}, ${node.lng.toFixed(6)})`}</li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default DrawingExample;
