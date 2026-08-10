package com.lodgelink.backend.service;

import com.lodgelink.backend.domain.Listing;
import com.lodgelink.backend.domain.PropertyType;
import com.lodgelink.backend.dto.CreateListingRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ListingService {
    private final Map<Long, Listing> listings = new ConcurrentHashMap<>();
    private final AtomicLong listingIdSequence = new AtomicLong(1);

    public Listing createListing(CreateListingRequest request) {
        long id = listingIdSequence.getAndIncrement();
        Listing listing = new Listing(
            id,
            request.title(),
            request.propertyType(),
            request.location(),
            request.nightlyRate(),
            request.maxGuests(),
            request.available()
        );
        listings.put(id, listing);
        return listing;
    }

    public List<Listing> getListings(PropertyType propertyType) {
        return listings.values().stream()
            .filter(listing -> propertyType == null || listing.propertyType() == propertyType)
            .sorted(Comparator.comparing(Listing::id))
            .toList();
    }

    public Listing getListing(Long id) {
        Listing listing = listings.get(id);
        if (listing == null) {
            throw new ResourceNotFoundException("Listing " + id + " was not found");
        }
        return listing;
    }
}
