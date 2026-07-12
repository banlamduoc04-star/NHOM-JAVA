package com.seal.hackathon.security;

import com.seal.hackathon.entity.AppUser;
import com.seal.hackathon.repository.AppUserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // JWT Utility
    private final JwtUtil jwtUtil;
    private final AppUserRepository users;


    public JwtAuthenticationFilter(
            JwtUtil jwtUtil,
            AppUserRepository users
    ) {
        this.jwtUtil = jwtUtil;
        this.users = users;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Get Authorization Header
        String header = request.getHeader("Authorization");


        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7);


            try {

                // Parse JWT Claims
                Claims claims = jwtUtil.parseClaims(token);

                String email = claims.getSubject();
                String role = String.valueOf(claims.get("role"));
                Integer userId = ((Number) claims.get("userId"))
                        .intValue();


                AppUser user = users
                        .findById(userId)
                        .orElse(null);


                String accountStatus =
                        user == null
                                || user.accountStatus == null
                                || user.accountStatus.isBlank()

                                ? (
                                user != null
                                        && Boolean.TRUE.equals(user.isApproved)
                                        ? "Active"
                                        : "Pending"
                        )

                                : user.accountStatus;


                if (user == null
                        || !Boolean.TRUE.equals(user.isApproved)
                        || !"Active".equalsIgnoreCase(accountStatus)) {

                    SecurityContextHolder.clearContext();

                    filterChain.doFilter(
                            request,
                            response
                    );

                    return;
                }


                var auth = new UsernamePasswordAuthenticationToken(

                        new JwtPrincipal(
                                userId,
                                email,
                                role
                        ),

                        null,

                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + role
                                )
                        )
                );


                // Save Authentication
                SecurityContextHolder
                        .getContext()
                        .setAuthentication(auth);


            } catch (Exception ignored) {

                // Clear Authentication
                SecurityContextHolder.clearContext();
            }
        }


        // Continue Filter Chain
        filterChain.doFilter(
                request,
                response
        );
    }


    // JWT User Information
    public record JwtPrincipal(
            Integer userId,
            String email,
            String role
    ) {
    }
}