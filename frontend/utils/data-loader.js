export const fetchData = async () => {
  try {
    const response = await fetch("http://18.218.227.30:8000/battles", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();

    // 🛠️ Filter out invalid points
    const validData = data
      .filter(d => d.latitude !== null && d.longitude !== null)
      .map(d => [d.longitude, d.latitude]);

    console.log("✅ Filtered Coordinates:", validData);
    return validData;
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return [];
  }
};
