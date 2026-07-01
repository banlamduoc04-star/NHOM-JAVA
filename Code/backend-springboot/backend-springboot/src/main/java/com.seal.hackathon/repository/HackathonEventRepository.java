package com.seal.hackathon.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seal.hackathon.entity.HackathonEvent;


public interface HackathonEventRepository extends JpaRepository<HackathonEvent, Integer> {
}