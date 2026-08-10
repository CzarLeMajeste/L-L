package com.lodgelink.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createsAndFiltersLodgingAndCondoListings() throws Exception {
        Map<String, Object> lodgingListing = new HashMap<>();
        lodgingListing.put("title", "Hillside Lodge");
        lodgingListing.put("propertyType", "LODGING_HOUSE");
        lodgingListing.put("location", "Baguio");
        lodgingListing.put("nightlyRate", 140.50);
        lodgingListing.put("maxGuests", 6);
        lodgingListing.put("available", true);

        Map<String, Object> condoListing = new HashMap<>();
        condoListing.put("title", "Metro Condo Loft");
        condoListing.put("propertyType", "PRIVATE_CONDO");
        condoListing.put("location", "Makati");
        condoListing.put("nightlyRate", 120.00);
        condoListing.put("maxGuests", 3);
        condoListing.put("available", true);

        mockMvc.perform(post("/api/listings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lodgingListing)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.propertyType").value("LODGING_HOUSE"));

        mockMvc.perform(post("/api/listings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(condoListing)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.propertyType").value("PRIVATE_CONDO"));

        mockMvc.perform(get("/api/listings").queryParam("propertyType", "LODGING_HOUSE"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].propertyType").value("LODGING_HOUSE"))
            .andExpect(jsonPath("$[1]").doesNotExist());
    }

    @Test
    void createsBookingForAvailableListingWithCalculatedTotal() throws Exception {
        Map<String, Object> listing = new HashMap<>();
        listing.put("title", "Sunset Condo");
        listing.put("propertyType", "PRIVATE_CONDO");
        listing.put("location", "Cebu");
        listing.put("nightlyRate", 100);
        listing.put("maxGuests", 2);
        listing.put("available", true);

        String listingResponse = mockMvc.perform(post("/api/listings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(listing)))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();

        long listingId = objectMapper.readTree(listingResponse).get("id").asLong();

        Map<String, Object> booking = new HashMap<>();
        booking.put("listingId", listingId);
        booking.put("guestName", "Alex Cruz");
        booking.put("checkIn", LocalDate.now().plusDays(1));
        booking.put("checkOut", LocalDate.now().plusDays(4));
        booking.put("guests", 2);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(booking)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("CONFIRMED"))
            .andExpect(jsonPath("$.totalPrice").value(300));
    }

    @Test
    void rejectsBookingWhenListingDoesNotExist() throws Exception {
        Map<String, Object> booking = new HashMap<>();
        booking.put("listingId", 999);
        booking.put("guestName", "Alex Cruz");
        booking.put("checkIn", LocalDate.now().plusDays(1));
        booking.put("checkOut", LocalDate.now().plusDays(2));
        booking.put("guests", 1);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(booking)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Listing 999 was not found"));
    }
}
