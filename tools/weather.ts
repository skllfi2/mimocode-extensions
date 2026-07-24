import { tool } from "@mimo-ai/plugin"

export default tool({
  description: "Get current weather for a city using Open-Meteo API (free, no key required)",
  args: {
    city: tool.schema.string().describe("City name"),
    units: tool.schema.string().optional().describe("Temperature units: 'celsius' (default) or 'fahrenheit'"),
  },
  async execute(args) {
    const { city, units = "celsius" } = args

    // Geocode city
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    )
    const geoData = await geoRes.json() as any
    if (!geoData.results?.length) return `City "${city}" not found`

    const { latitude, longitude, name, country } = geoData.results[0]

    // Get weather
    const tempUnit = units === "fahrenheit" ? "fahrenheit" : "celsius"
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=${tempUnit}`
    )
    const weather = await weatherRes.json() as any
    const c = weather.current

    const weatherCodes: Record<number, string> = {
      0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
      45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
      55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
      71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 80: "Slight showers",
      81: "Moderate showers", 82: "Violent showers", 95: "Thunderstorm",
    }

    return [
      `Weather in ${name}, ${country}:`,
      `  Temperature: ${c.temperature_2m}°${units === "fahrenheit" ? "F" : "C"}`,
      `  Feels like: ${c.apparent_temperature}°${units === "fahrenheit" ? "F" : "C"}`,
      `  Condition: ${weatherCodes[c.weather_code] ?? "Unknown"}`,
      `  Humidity: ${c.relative_humidity_2m}%`,
      `  Wind: ${c.wind_speed_10m} km/h`,
    ].join("\n")
  },
})
