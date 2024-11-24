const pullRequestData = {
    routes: [
        {
            from: { lat: 40.7128, lng: -74.0060 }, // New York
            to: { lat: 51.5074, lng: -0.1278 }     // London
        },
        {
            from: { lat: 35.6762, lng: 139.6503 }, // Tokyo
            to: { lat: 37.7749, lng: -122.4194 }   // San Francisco
        },
        {
            from: { lat: -33.8688, lng: 151.2093 }, // Sydney
            to: { lat: 52.5200, lng: 13.4050 }      // Berlin
        },
        {
            from: { lat: 1.3521, lng: 103.8198 },   // Singapore
            to: { lat: 55.7558, lng: 37.6173 }      // Moscow
        },
        {
            from: { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
            to: { lat: 31.2304, lng: 121.4737 }     // Shanghai
        },
        {
            from: { lat: 19.4326, lng: -99.1332 },  // Mexico City
            to: { lat: 25.2048, lng: 55.2708 }      // Dubai
        },
        {
            from: { lat: 48.8566, lng: 2.3522 },    // Paris
            to: { lat: -33.9188, lng: 18.4233}     // Cape Town
        },
        {
            from: { lat: 53.3501, lng: -6.2661},      // Dublin
            to: { lat: 31.2304, lng: 121.4737 }     // Shanghai
        }
    ],

    generateRandomCoordinates() {
        return {
            lat: (Math.random() * 180 - 90),  
            lng: (Math.random() * 360 - 180)
        };
    },

    getRandomRoute() {
        const from = this.generateRandomCoordinates();
        const to = this.generateRandomCoordinates();
        return { from, to };
    }
};