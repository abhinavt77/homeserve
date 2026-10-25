package com.app.homeservice.service.impl;

import com.app.homeservice.dto.AddressRequest;
import com.app.homeservice.dto.AddressResponse;
import com.app.homeservice.entity.Address;
import com.app.homeservice.entity.User;
import com.app.homeservice.exception.ResourceNotFoundException;
import com.app.homeservice.repository.AddressRepository;
import com.app.homeservice.repository.UserRepository;
import com.app.homeservice.service.AddressService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressServiceImpl(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                .map(AddressResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddressById(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + id));
        return AddressResponse.fromEntity(address);
    }

    @Override
    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        List<Address> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        boolean shouldBeDefault = request.isDefault() || existing.isEmpty();

        if (shouldBeDefault) {
            existing.forEach(a -> {
                if (a.isDefault()) {
                    a.setDefault(false);
                    addressRepository.save(a);
                }
            });
        }

        Address address = new Address(
                user,
                request.getTitle(),
                request.getStreet(),
                request.getCity(),
                request.getState(),
                request.getPostalCode(),
                request.getLatitude(),
                request.getLongitude(),
                shouldBeDefault
        );

        Address saved = addressRepository.save(address);
        return AddressResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long id, Long userId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + id));

        if (request.isDefault() && !address.isDefault()) {
            addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).forEach(a -> {
                if (a.isDefault()) {
                    a.setDefault(false);
                    addressRepository.save(a);
                }
            });
            address.setDefault(true);
        }

        address.setTitle(request.getTitle());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());

        Address saved = addressRepository.save(address);
        return AddressResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteAddress(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + id));

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        if (wasDefault) {
            addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                    .findFirst()
                    .ifPresent(nextAddress -> {
                        nextAddress.setDefault(true);
                        addressRepository.save(nextAddress);
                    });
        }
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(Long id, Long userId) {
        Address target = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + id));

        addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).forEach(a -> {
            if (a.isDefault()) {
                a.setDefault(false);
                addressRepository.save(a);
            }
        });

        target.setDefault(true);
        Address saved = addressRepository.save(target);
        return AddressResponse.fromEntity(saved);
    }
}
