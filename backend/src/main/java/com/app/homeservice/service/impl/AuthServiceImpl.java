package com.app.homeservice.service.impl;

import com.app.homeservice.dto.AuthRequest;
import com.app.homeservice.dto.AuthResponse;
import com.app.homeservice.dto.RegisterRequest;
import com.app.homeservice.dto.UserResponse;
import com.app.homeservice.entity.ProviderProfile;
import com.app.homeservice.entity.Role;
import com.app.homeservice.entity.ServiceCategory;
import com.app.homeservice.entity.User;
import com.app.homeservice.exception.BadRequestException;
import com.app.homeservice.exception.ResourceNotFoundException;
import com.app.homeservice.repository.ProviderProfileRepository;
import com.app.homeservice.repository.ServiceCategoryRepository;
import com.app.homeservice.repository.UserRepository;
import com.app.homeservice.security.JwtUtils;
import com.app.homeservice.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(UserRepository userRepository,
                           ProviderProfileRepository providerProfileRepository,
                           ServiceCategoryRepository serviceCategoryRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = (User) authentication.getPrincipal();

        if (!user.isEnabled()) {
            throw new BadRequestException("Your account has been deactivated. Please contact support.");
        }

        String token = jwtUtils.generateToken(user, user.getRole().name(), user.getId());

        Boolean isVerified = null;
        Boolean isOnline = null;
        if (user.getRole() == Role.PROVIDER) {
            Optional<ProviderProfile> profileOpt = providerProfileRepository.findByUserId(user.getId());
            if (profileOpt.isPresent()) {
                isVerified = profileOpt.get().isVerified();
                isOnline = profileOpt.get().isOnline();
            }
        }

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole(),
                user.getProfileImageUrl(),
                isVerified,
                isOnline
        );
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered: " + email);
        }

        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot register as administrator");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setRole(request.getRole());
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        Boolean isVerified = null;
        Boolean isOnline = null;

        if (request.getRole() == Role.PROVIDER) {
            Long categoryId = request.getServiceCategoryId();
            if (categoryId == null) {
                // Default to first category if not specified
                categoryId = serviceCategoryRepository.findAll().stream()
                        .findFirst()
                        .map(ServiceCategory::getId)
                        .orElseThrow(() -> new BadRequestException("No service categories available"));
            }

            final Long finalCategoryId = categoryId;
            ServiceCategory category = serviceCategoryRepository.findById(finalCategoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Service category not found: " + finalCategoryId));

            ProviderProfile profile = new ProviderProfile(
                    savedUser,
                    category,
                    request.getExperienceYears(),
                    request.getHourlyRate(),
                    request.getBio(),
                    request.getLatitude(),
                    request.getLongitude()
            );
            if (request.getDocumentUrl() != null) {
                profile.setDocumentUrl(request.getDocumentUrl());
            }

            providerProfileRepository.save(profile);
            isVerified = profile.isVerified();
            isOnline = profile.isOnline();
        }

        String token = jwtUtils.generateToken(savedUser, savedUser.getRole().name(), savedUser.getId());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getPhone(),
                savedUser.getRole(),
                savedUser.getProfileImageUrl(),
                isVerified,
                isOnline
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserResponse.fromEntity(user);
    }
}
