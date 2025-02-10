import React from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

import DrawingExample from "./drawing-example";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

const App = () => {
    return (
        <APIProvider apiKey={API_KEY}>
            <DrawingExample />
        </APIProvider>
    );
};

export default App;
