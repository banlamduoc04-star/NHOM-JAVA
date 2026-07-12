package com.seal.hackathon.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


public class SecurityUtil {


    public static Integer currentUserId() {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (auth == null
                || !(auth.getPrincipal()
                instanceof JwtAuthenticationFilter.JwtPrincipal p)) {

            return null;
        }


        return p.userId();
    }


    public static String currentRole() {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (auth == null
                || !(auth.getPrincipal()
                instanceof JwtAuthenticationFilter.JwtPrincipal p)) {

            return null;
        }


        return p.role();
    }


    public static boolean hasRole(String role) {

        String current = currentRole();

        return current != null
                && current.equals(role);
    }


    public static boolean isAdmin() {

        String role = currentRole();

        return "EventCoordinator".equals(role)
                || "Admin".equals(role);
    }


    public static boolean isAuthenticated() {

        return currentUserId() != null;
    }


    public static void requireAuthenticated() {

        if (!isAuthenticated()) {
            throw new AccessDeniedException(
                    "Unauthenticated"
            );
        }
    }


    public static void requireAdmin() {

        if (!isAdmin()) {
            throw new AccessDeniedException(
                    "Admin only"
            );
        }
    }


    public static void require(boolean condition) {

        if (!condition) {
            throw new AccessDeniedException(
                    "Forbidden"
            );
        }
    }
}