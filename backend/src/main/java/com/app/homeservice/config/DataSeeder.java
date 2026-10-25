package com.app.homeservice.config;

import com.app.homeservice.entity.ProviderProfile;
import com.app.homeservice.entity.Role;
import com.app.homeservice.entity.ServiceCategory;
import com.app.homeservice.entity.User;
import com.app.homeservice.repository.ProviderProfileRepository;
import com.app.homeservice.repository.ServiceCategoryRepository;
import com.app.homeservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final com.app.homeservice.repository.AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      ServiceCategoryRepository serviceCategoryRepository,
                      ProviderProfileRepository providerProfileRepository,
                      com.app.homeservice.repository.AddressRepository addressRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.addressRepository = addressRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedCategories();
        seedAdmin();
        seedCustomers();
        seedProviders();
        log.info("Database seeding check completed.");
    }

    private void seedCategories() {
        if (serviceCategoryRepository.count() == 0) {
            log.info("Seeding initial service categories...");
            List<ServiceCategory> categories = List.of(
                    new ServiceCategory(null, "Electrician", "ELECTRICIAN", "Wiring, switches, circuit repairs & appliance fitting", new BigDecimal("299.00"), "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80", true),
                    new ServiceCategory(null, "Plumber", "PLUMBER", "Pipe leaks, tap & shower installation, drainage clearing", new BigDecimal("249.00"), "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format&fit=crop&q=80", true),
                    new ServiceCategory(null, "Cleaner", "CLEANER", "Deep home cleaning, kitchen sanitization & disinfection", new BigDecimal("399.00"), "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format&fit=crop&q=80", true),
                    new ServiceCategory(null, "Carpenter", "CARPENTER", "Furniture assembly, door lock fitting, woodwork repair", new BigDecimal("349.00"), "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200&auto=format&fit=crop&q=80", true),
                    new ServiceCategory(null, "Appliance Repair", "APPLIANCE_REPAIR", "AC servicing, refrigerator repair, washing machines", new BigDecimal("449.00"), "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&auto=format&fit=crop&q=80", true)
            );
            serviceCategoryRepository.saveAll(categories);
        }
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@homeserve.com")) {
            log.info("Seeding Admin account...");
            User admin = new User();
            admin.setEmail("admin@homeserve.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setFullName("Platform Administrator");
            admin.setPhone("+919999900000");
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            admin.setProfileImageUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80");
            userRepository.save(admin);
        }
    }

    private void seedCustomers() {
        if (!userRepository.existsByEmail("customer@homeserve.com")) {
            log.info("Seeding default customer account...");
            User customer = new User();
            customer.setEmail("customer@homeserve.com");
            customer.setPassword(passwordEncoder.encode("Password@123"));
            customer.setFullName("Rahul Sharma");
            customer.setPhone("+919876543210");
            customer.setRole(Role.USER);
            customer.setEnabled(true);
            customer.setProfileImageUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");
            User savedCustomer = userRepository.save(customer);

            com.app.homeservice.entity.Address addr = new com.app.homeservice.entity.Address(
                    savedCustomer,
                    "Home",
                    "Flat 402, Sunshine Residency, 100ft Road, Indiranagar",
                    "Bangalore",
                    "Karnataka",
                    "560038",
                    12.9784,
                    77.6408,
                    true
            );
            addressRepository.save(addr);
            log.info("Seeded default address for customer {}", customer.getEmail());
        }

        // Ensure all registered customer users have at least one default service address
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER)
                .forEach(u -> {
                    if (addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(u.getId()).isEmpty()) {
                        com.app.homeservice.entity.Address addr = new com.app.homeservice.entity.Address(
                                u,
                                "Home",
                                "Flat 402, Sunshine Residency, 100ft Road, Indiranagar",
                                "Bangalore",
                                "Karnataka",
                                "560038",
                                12.9784,
                                77.6408,
                                true
                        );
                        addressRepository.save(addr);
                        log.info("Auto-seeded default address for user {}", u.getEmail());
                    }
                });
    }

    private void seedProviders() {
        seedProviderIfAbsent("electrician@homeserve.com", "Suresh Kumar", "ELECTRICIAN", 6, new BigDecimal("350.00"), 12.9716, 77.5946, "Certified electrician with over 6 years experience in commercial and residential electrical installations.");
        seedProviderIfAbsent("plumber@homeserve.com", "Amit Verma", "PLUMBER", 4, new BigDecimal("280.00"), 12.9750, 77.5980, "Specialist in emergency plumbing, sanitary fixtures, and leakage detection.");
        seedProviderIfAbsent("cleaner@homeserve.com", "Sunita Devi", "CLEANER", 5, new BigDecimal("250.00"), 12.9690, 77.5920, "Expert in deep residential sanitization, steam cleaning, and post-renovation cleaning.");
        seedProviderIfAbsent("carpenter@homeserve.com", "Rajesh Mistri", "CARPENTER", 8, new BigDecimal("400.00"), 12.9735, 77.6010, "Master woodworker, custom cabinet and furniture assembly specialist.");
    }

    private void seedProviderIfAbsent(String email, String name, String categoryCode, int exp, BigDecimal rate, double lat, double lng, String bio) {
        if (!userRepository.existsByEmail(email)) {
            ServiceCategory category = serviceCategoryRepository.findByCode(categoryCode).orElse(null);
            if (category == null) return;

            User providerUser = new User();
            providerUser.setEmail(email);
            providerUser.setPassword(passwordEncoder.encode("Password@123"));
            providerUser.setFullName(name);
            providerUser.setPhone("+91981234567" + exp);
            providerUser.setRole(Role.PROVIDER);
            providerUser.setEnabled(true);
            providerUser.setProfileImageUrl("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80");
            User savedUser = userRepository.save(providerUser);

            ProviderProfile profile = new ProviderProfile();
            profile.setUser(savedUser);
            profile.setServiceCategory(category);
            profile.setExperienceYears(exp);
            profile.setHourlyRate(rate);
            profile.setBio(bio);
            profile.setLatitude(lat);
            profile.setLongitude(lng);
            profile.setOnline(true);
            profile.setVerified(true);
            profile.setAverageRating(new BigDecimal("4.90"));
            profile.setTotalReviews(12);
            providerProfileRepository.save(profile);
            log.info("Seeded provider {} ({})", name, categoryCode);
        }
    }
}
