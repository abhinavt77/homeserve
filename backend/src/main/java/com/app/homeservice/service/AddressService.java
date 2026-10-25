package com.app.homeservice.service;

import com.app.homeservice.dto.AddressRequest;
import com.app.homeservice.dto.AddressResponse;

import java.util.List;

public interface AddressService {
    List<AddressResponse> getUserAddresses(Long userId);
    AddressResponse getAddressById(Long id, Long userId);
    AddressResponse createAddress(Long userId, AddressRequest request);
    AddressResponse updateAddress(Long id, Long userId, AddressRequest request);
    void deleteAddress(Long id, Long userId);
    AddressResponse setDefaultAddress(Long id, Long userId);
}
