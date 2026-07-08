package com.seal.hackathon.repository;

// Import entity HackathonEvent.
// Repository này sẽ thao tác với dữ liệu của HackathonEvent.
import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.HackathonEvent;


// Khai báo interface HackathonEventRepository.
//
// Interface này dùng để thao tác với bảng hackathon_events
// thông qua entity HackathonEvent.
public interface HackathonEventRepository extends JpaRepository<HackathonEvent, Integer> { }