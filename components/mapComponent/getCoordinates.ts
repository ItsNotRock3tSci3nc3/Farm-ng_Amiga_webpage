import { Overlay } from "./types";

export function getAllCoordinates(overlays: Overlay[]): { lat: number; lng: number }[] {
    let allNodes: { lat: number; lng: number }[] = [];

    overlays.forEach((overlay) => {
        if (!overlay.geometry) return;

        if (overlay.type === "polygon" || overlay.type === "polyline") {
            // Get all points of the polygon or polyline
            const path = overlay.geometry.getPath().getArray();
            const coords = path.map((latLng: google.maps.LatLng) => ({
                lat: latLng.lat(),
                lng: latLng.lng(),
            }));
            allNodes = [...allNodes, ...coords];
        } else if (overlay.type === "marker") {
            // Get the coordinates of the marker
            const position = overlay.geometry.getPosition();
            if (position) {
                allNodes.push({ lat: position.lat(), lng: position.lng() });
            }
        } else if (overlay.type === "rectangle") {
            // Get the four corner points of the rectangle
            const bounds = overlay.geometry.getBounds();
            if (bounds) {
                allNodes.push(
                    { lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng() },
                    { lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng() }
                );
            }
        } else if (overlay.type === "circle") {
            // Get the center point of the circle
            const center = overlay.geometry.getCenter();
            if (center) {
                allNodes.push({ lat: center.lat(), lng: center.lng() });
            }
        }
    });

    return allNodes;
}
