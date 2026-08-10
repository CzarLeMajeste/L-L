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
    private final IdentityVerificationService identityVerificationService;
    private final AuditLogService auditLogService;

    public ListingService(
        IdentityVerificationService identityVerificationService,
        AuditLogService auditLogService
    ) {
        this.identityVerificationService = identityVerificationService;
        this.auditLogService = auditLogService;
    }

    public Listing createListing(String clientId, CreateListingRequest request) {
        identityVerificationService.assertVerifiedClient(clientId);

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
        auditLogService.log(clientId, "CLIENT", "CREATE_LISTING", String.valueOf(id), "SUCCESS", "Listing created");
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
