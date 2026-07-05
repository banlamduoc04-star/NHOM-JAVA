<<<<<<< Updated upstream
package com.seal.hackathon.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "hackathon_events")
public class HackathonEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer eventId;
    @Column(nullable = false, length = 150) public String eventName;
    @Column(nullable = false, length = 30) public String season;
    @Column(nullable = false) public Integer eventYear;
    public LocalDate startDate;
    public LocalDate endDate;
    @Column(nullable = false, length = 30) public String status = "Draft";
    @Column(length = 2000) public String description;
    public Integer createdBy;
    @Column(nullable = false) public LocalDateTime createdAt = LocalDateTime.now();
}
=======
package com.seal.hackathon.security;

import com.seal.hackathon.entity.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    private final Key key;
    private final long expirationMs;

    public JwtUtil(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(AppUser user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(user.email)
                .claim("userId", user.userId)
                .claim("role", user.roleName)
                .claim("fullName", user.fullName)
                .claim("approved", user.isApproved)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
}
>>>>>>> Stashed changes
