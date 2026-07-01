
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "track_mentors", uniqueConstraints = @UniqueConstraint(columnNames = {"trackId", "mentorId"}))
public class TrackMentor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer trackMentorId;
    @Column(nullable = false) public Integer trackId;
    @Column(nullable = false) public Integer mentorId;
    @Column(nullable = false) public LocalDateTime assignedAt = LocalDateTime.now();
}
