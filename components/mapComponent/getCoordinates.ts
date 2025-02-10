import { Overlay } from "./types";

export function getAllCoordinates(overlays: Overlay[]): { lat: number; lng: number }[] {
    let allNodes: { lat: number; lng: number }[] = [];

    overlays.forEach((overlay) => {
        if (!overlay.geometry) return;

        if (overlay.type === "polygon" || overlay.type === "polyline") {
            // 获取多边形或折线的所有点
            const path = overlay.geometry.getPath().getArray();
            const coords = path.map((latLng: google.maps.LatLng) => ({
                lat: latLng.lat(),
                lng: latLng.lng(),
            }));
            allNodes = [...allNodes, ...coords];
        } else if (overlay.type === "marker") {
            // 获取标记点的坐标
            const position = overlay.geometry.getPosition();
            if (position) {
                allNodes.push({ lat: position.lat(), lng: position.lng() });
            }
        } else if (overlay.type === "rectangle") {
            // 获取矩形的四个角点
            const bounds = overlay.geometry.getBounds();
            if (bounds) {
                allNodes.push(
                    { lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng() },
                    { lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng() }
                );
            }
        } else if (overlay.type === "circle") {
            // 获取圆的中心点
            const center = overlay.geometry.getCenter();
            if (center) {
                allNodes.push({ lat: center.lat(), lng: center.lng() });
            }
        }
    });

    return allNodes;
}
