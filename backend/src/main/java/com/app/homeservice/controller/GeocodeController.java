package com.app.homeservice.controller;

import com.app.homeservice.dto.ApiResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/geocode")
@Tag(name = "Geocoding Service", description = "Server-side proxy for Nominatim OpenStreetMap and BigDataCloud geocoding without client CORS or 403 blocks")
public class GeocodeController {

    private static final Logger log = LoggerFactory.getLogger(GeocodeController.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String USER_AGENT = "HomeServe-Platform/1.0 (contact@homeserve.com)";

    @GetMapping("/search")
    @Operation(summary = "Search areas, landmarks, and addresses with autocomplete")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchLocations(@RequestParam String q) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(ApiResponse.success(results));
        }

        try {
            String encodedQuery = URLEncoder.encode(q.trim(), StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodedQuery + "&countrycodes=in&limit=8&addressdetails=1";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", USER_AGENT);
            headers.set("Accept", "application/json");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.isArray()) {
                    for (JsonNode item : root) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("displayName", item.path("display_name").asText());
                        map.put("lat", Double.parseDouble(item.path("lat").asText("0")));
                        map.put("lng", Double.parseDouble(item.path("lon").asText("0")));

                        JsonNode addr = item.path("address");
                        String road = addr.path("road").asText("");
                        String suburb = addr.path("suburb").asText("");
                        String neighbourhood = addr.path("neighbourhood").asText("");
                        String city = addr.path("city").asText(addr.path("town").asText(addr.path("village").asText("Bangalore")));
                        String state = addr.path("state").asText("Karnataka");
                        String postcode = addr.path("postcode").asText("560001");

                        String street = Arrays.asList(road, suburb, neighbourhood).stream()
                                .filter(s -> !s.isEmpty())
                                .reduce((a, b) -> a + ", " + b)
                                .orElse(item.path("display_name").asText().split(",")[0]);

                        map.put("street", street);
                        map.put("city", city);
                        map.put("state", state);
                        map.put("postalCode", postcode);
                        results.add(map);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Server-side Nominatim search failed: {}", e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/reverse")
    @Operation(summary = "Reverse geocode latitude and longitude into street, city, and postal code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reverseGeocode(
            @RequestParam double lat,
            @RequestParam double lng) {

        Map<String, Object> result = new HashMap<>();
        result.put("latitude", lat);
        result.put("longitude", lng);

        // 1. Try Nominatim reverse geocode with server User-Agent
        try {
            String url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lng + "&zoom=18&addressdetails=1";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", USER_AGENT);
            headers.set("Accept", "application/json");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode item = objectMapper.readTree(response.getBody());
                JsonNode addr = item.path("address");

                String road = addr.path("road").asText("");
                String building = addr.path("building").asText(addr.path("house_number").asText(""));
                String suburb = addr.path("suburb").asText(addr.path("neighbourhood").asText(addr.path("residential").asText("")));
                String city = addr.path("city").asText(addr.path("town").asText(addr.path("village").asText(addr.path("state_district").asText("Bangalore"))));
                String state = addr.path("state").asText("Karnataka");
                String postcode = addr.path("postcode").asText("560001");
                String displayName = item.path("display_name").asText("");

                List<String> streetParts = new ArrayList<>();
                if (!building.isEmpty()) streetParts.add(building);
                if (!road.isEmpty()) streetParts.add(road);
                if (!suburb.isEmpty()) streetParts.add(suburb);

                String street = !streetParts.isEmpty() ? String.join(", ", streetParts) : displayName.split(",")[0];

                result.put("street", street);
                result.put("city", city);
                result.put("state", state);
                result.put("postalCode", postcode);
                result.put("formattedAddress", !displayName.isEmpty() ? displayName : street + ", " + city + " - " + postcode);
                return ResponseEntity.ok(ApiResponse.success(result));
            }
        } catch (Exception e) {
            log.warn("Server-side Nominatim reverse geocode failed: {}", e.getMessage());
        }

        // 2. Fallback to BigDataCloud reverse geocode
        try {
            String bdUrl = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lng + "&localityLanguage=en";
            ResponseEntity<String> bdRes = restTemplate.getForEntity(bdUrl, String.class);
            if (bdRes.getStatusCode().is2xxSuccessful() && bdRes.getBody() != null) {
                JsonNode bd = objectMapper.readTree(bdRes.getBody());
                String city = bd.path("city").asText(bd.path("locality").asText("Bangalore"));
                String state = bd.path("principalSubdivision").asText("Karnataka");
                String postcode = bd.path("postcode").asText("560001");
                String locality = bd.path("locality").asText("");
                String street = !locality.isEmpty() ? locality + " Area" : "Main Road";

                result.put("street", street);
                result.put("city", city);
                result.put("state", state);
                result.put("postalCode", postcode);
                result.put("formattedAddress", street + ", " + city + ", " + state + " - " + postcode);
                return ResponseEntity.ok(ApiResponse.success(result));
            }
        } catch (Exception e) {
            log.warn("BigDataCloud reverse geocode failed: {}", e.getMessage());
        }

        // Default fallback if offline
        result.put("street", "Near Pin Location");
        result.put("city", "Bangalore");
        result.put("state", "Karnataka");
        result.put("postalCode", "560001");
        result.put("formattedAddress", lat + ", " + lng);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
