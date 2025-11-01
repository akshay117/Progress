package com.wecaare.insurance.config;

import com.wecaare.insurance.model.User;
import com.wecaare.insurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing default users...");
        
        // Initialize Admin user: smitha / smithamg33
        if (!userRepository.existsByUsername("smitha")) {
            User adminUser = new User();
            adminUser.setUsername("smitha");
            adminUser.setPassword(passwordEncoder.encode("smithamg33"));
            adminUser.setRole("admin");
            userRepository.save(adminUser);
            log.info("✅ Admin user 'smitha' created successfully");
        } else {
            // Update password in case it changed
            User adminUser = userRepository.findByUsername("smitha").orElse(null);
            if (adminUser != null) {
                adminUser.setPassword(passwordEncoder.encode("smithamg33"));
                adminUser.setRole("admin");
                userRepository.save(adminUser);
                log.info("✅ Admin user 'smitha' password updated");
            }
        }
        
        // Initialize Staff user: wecare / wecare
        if (!userRepository.existsByUsername("wecare")) {
            User staffUser = new User();
            staffUser.setUsername("wecare");
            staffUser.setPassword(passwordEncoder.encode("wecare"));
            staffUser.setRole("staff");
            userRepository.save(staffUser);
            log.info("✅ Staff user 'wecare' created successfully");
        } else {
            // Update password in case it changed
            User staffUser = userRepository.findByUsername("wecare").orElse(null);
            if (staffUser != null) {
                staffUser.setPassword(passwordEncoder.encode("wecare"));
                staffUser.setRole("staff");
                userRepository.save(staffUser);
                log.info("✅ Staff user 'wecare' password updated");
            }
        }
        
        log.info("User initialization completed!");
    }
}

