package com.wishtree.rmp.service;

import com.wishtree.rmp.dto.UserDto;
import com.wishtree.rmp.dto.auth.AuthResponse;
import com.wishtree.rmp.dto.auth.LoginRequest;
import com.wishtree.rmp.dto.auth.RefreshTokenRequest;
import com.wishtree.rmp.entity.User;
import com.wishtree.rmp.exceptions.BadRequestException;
import com.wishtree.rmp.exceptions.UnauthorizedException;
import com.wishtree.rmp.repository.RolePermissionRepository;
import com.wishtree.rmp.repository.UserRepository;
import com.wishtree.rmp.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(request.getEmail());

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("User {} logged in successfully", request.getEmail());

        Set<String> permissions = rolePermissionRepository.findPermissionCodesByRoles(user.getRoles());

        return AuthResponse.of(
                accessToken,
                refreshToken,
                tokenProvider.getExpirationTime(),
                UserDto.fromEntityWithPermissions(user, permissions)
        );
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String email = tokenProvider.getUsernameFromToken(request.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!request.getRefreshToken().equals(user.getRefreshToken())) {
            throw new UnauthorizedException("Refresh token mismatch");
        }

        String newAccessToken = tokenProvider.generateAccessToken(email);
        String newRefreshToken = tokenProvider.generateRefreshToken(email);

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        Set<String> permissions = rolePermissionRepository.findPermissionCodesByRoles(user.getRoles());

        return AuthResponse.of(
                newAccessToken,
                newRefreshToken,
                tokenProvider.getExpirationTime(),
                UserDto.fromEntityWithPermissions(user, permissions)
        );
    }

    @Transactional
    public void logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            userRepository.findByEmail(auth.getName()).ifPresent(user -> {
                user.setRefreshToken(null);
                userRepository.save(user);
            });
        }
        SecurityContextHolder.clearContext();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Not authenticated");
        }

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Set<String> permissions = rolePermissionRepository.findPermissionCodesByRoles(user.getRoles());
        return UserDto.fromEntityWithPermissions(user, permissions);
    }

    @Transactional
    public User createUser(String email, String password, String name, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .name(name)
                .enabled(true)
                .accountNonLocked(true)
                .build();

        user.addRole(role);
        return userRepository.save(user);
    }
}

