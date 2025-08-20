export async function calculateDistance(pinCode1: string, pinCode2: string): Promise<number> {
  try {
    // In a real implementation, you would use a geolocation API service
    // For now, we'll simulate distance calculation based on PIN codes
    
    // Simple simulation: calculate based on PIN code difference
    const pin1 = parseInt(pinCode1);
    const pin2 = parseInt(pinCode2);
    
    if (isNaN(pin1) || isNaN(pin2)) {
      throw new Error("Invalid PIN codes");
    }
    
    // Simulate distance (this is a very rough approximation)
    const difference = Math.abs(pin1 - pin2);
    let distance;
    
    if (difference === 0) {
      distance = 0; // Same PIN code
    } else if (difference < 10) {
      distance = Math.random() * 5 + 1; // 1-6 km for nearby areas
    } else if (difference < 100) {
      distance = Math.random() * 20 + 5; // 5-25 km for same city/district
    } else if (difference < 1000) {
      distance = Math.random() * 100 + 25; // 25-125 km for same state
    } else {
      distance = Math.random() * 500 + 100; // 100-600 km for different states
    }
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error("Distance calculation error:", error);
    throw new Error("Failed to calculate distance");
  }
}

export async function getLocationFromPinCode(pinCode: string): Promise<{
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
}> {
  try {
    // In a real implementation, you would use a PIN code to location API
    // For now, we'll return simulated data
    
    const pin = parseInt(pinCode);
    if (isNaN(pin)) {
      throw new Error("Invalid PIN code");
    }
    
    // Simulate location data based on PIN code ranges
    let city = "Unknown City";
    let state = "Unknown State";
    
    if (pinCode.startsWith("110")) {
      city = "New Delhi";
      state = "Delhi";
    } else if (pinCode.startsWith("400")) {
      city = "Mumbai";
      state = "Maharashtra";
    } else if (pinCode.startsWith("560")) {
      city = "Bangalore";
      state = "Karnataka";
    } else if (pinCode.startsWith("600")) {
      city = "Chennai";
      state = "Tamil Nadu";
    } else if (pinCode.startsWith("700")) {
      city = "Kolkata";
      state = "West Bengal";
    } else if (pinCode.startsWith("500")) {
      city = "Hyderabad";
      state = "Telangana";
    } else {
      // Generate a generic city/state based on PIN code
      city = `City-${pinCode.substring(0, 3)}`;
      state = `State-${pinCode.substring(0, 2)}`;
    }
    
    return {
      city,
      state,
      latitude: Math.random() * 30 + 8, // Random latitude within India
      longitude: Math.random() * 30 + 68, // Random longitude within India
    };
  } catch (error) {
    console.error("Location lookup error:", error);
    throw new Error("Failed to get location from PIN code");
  }
}
