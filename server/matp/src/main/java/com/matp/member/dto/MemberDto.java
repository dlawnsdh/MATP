package com.matp.member.dto;

import com.matp.member.entity.Member;

import java.time.LocalDateTime;

/**
 * 회원 엔티티 정보를 담는 DTO
 */
public record MemberDto(
        Long memberId,
        String email,
        String nickname,
        String birthday,
        String profileUrl,
        Integer gender,
        String memo,
        boolean isFollowing,
        String registrationId,
        LocalDateTime createdAt,
        LocalDateTime modifiedAt

) {
    public static MemberDto of(Long id, String email, String nickname, String birthday, String profileUrl, Integer gender, String memo, String registrationId) {
        return new MemberDto(id, email, nickname, birthday, profileUrl, gender, memo,false, registrationId, null, null);
    }

    public static MemberDto of(String email, String nickname, String birthday, String profileUrl, Integer gender, String memo, String registrationId) {
        return new MemberDto(null, email, nickname, birthday, profileUrl, gender, memo, false,registrationId, null, null);
    }

    public static MemberDto of(String email, String nickname, String profileUrl, String registrationId) {
        return new MemberDto(null, email, nickname, null, profileUrl, null, null,false, registrationId, null, null);
    }

    public static MemberDto from(Member entity) {
        return new MemberDto(
                entity.getMemberId(),
                entity.getEmail(),
                entity.getNickname(),
                entity.getBirthday(),
                entity.getProfileUrl(),
                entity.getGender(),
                entity.getMemo(),
                entity.isFollowing(),
                entity.getRegistrationId(),
                entity.getCreatedAt(),
                entity.getModifiedAt()
        );
    }

    public Member toEntity() {
        return Member.of(
                email,
                nickname,
                birthday,
                profileUrl,
                gender,
                memo,
                registrationId
        );
    }

}
