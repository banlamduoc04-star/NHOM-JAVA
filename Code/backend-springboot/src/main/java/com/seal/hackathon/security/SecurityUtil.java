package com.seal.hackathon.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    public static Integer currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null
                || !(auth.getPrincipal() instanceof JwtAuthenticationFilter.JwtPrincipal p)) {
            return null;
        }

        return p.userId();
    }

    public static String currentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null
                || !(auth.getPrincipal() instanceof JwtAuthenticationFilter.JwtPrincipal p)) {
            return null;
        }

        return p.role();
    }
}