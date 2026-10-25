-- ========================================================
-- HomeServe V2 Seed Initial Service Categories
-- ========================================================

INSERT INTO service_categories (id, name, code, description, base_price, icon_url, active)
VALUES
    (1, 'Electrician', 'ELECTRICIAN', 'Wiring, switches, circuit repairs, fan/appliance fitting & high-voltage troubleshooting.', 299.00, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80', true),
    (2, 'Plumber', 'PLUMBER', 'Pipe leak repair, tap & shower installation, drainage unblocking & sanitary fittings.', 249.00, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format&fit=crop&q=80', true),
    (3, 'Cleaner', 'CLEANER', 'Deep home cleaning, kitchen sanitization, sofa shampooing & bathroom disinfection.', 399.00, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format&fit=crop&q=80', true),
    (4, 'Carpenter', 'CARPENTER', 'Furniture assembly, hinge repairs, wooden doors, custom shelves & lock fitting.', 349.00, 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200&auto=format&fit=crop&q=80', true),
    (5, 'Appliance Repair', 'APPLIANCE_REPAIR', 'AC servicing, refrigerator gas refill, washing machine repair & microwave fixes.', 449.00, 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;
